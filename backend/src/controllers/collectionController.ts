import { Request, Response } from 'express';
import SchemaManager from '../database/schemaManager';

const schemaManager = SchemaManager.getInstance();

// Get all collections with pagination and filters
export const getCollections = async (req: Request, res: Response) => {
  try {
    const hospitalId = req.hospitalId || req.headers['x-hospital-id'] as string;
    
    if (!hospitalId) {
      res.status(400).json({ error: 'Hospital ID required' });
      return;
    }

    const { status, donorId, page = 1, limit = 10, search } = req.query;
    
    const tenantClient = schemaManager.getTenantClient(hospitalId);
    
    const where: any = {};
    if (status) where.status = status;
    if (donorId) where.donorId = donorId;
    if (search) {
      where.OR = [
        { collectionId: { contains: search as string, mode: 'insensitive' } },
        { donor: { 
          OR: [
            { firstName: { contains: search as string, mode: 'insensitive' } },
            { lastName: { contains: search as string, mode: 'insensitive' } },
            { donorId: { contains: search as string, mode: 'insensitive' } }
          ]
        }}
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [collections, total] = await Promise.all([
      tenantClient.collection.findMany({
        where,
        include: {
          donor: {
            select: {
              firstName: true,
              lastName: true,
              donorId: true,
              bloodGroup: true
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      tenantClient.collection.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        collections,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Test endpoint to debug request body
export const testEndpoint = async (req: Request, res: Response) => {
  console.log('=== TEST ENDPOINT ===');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Raw body:', req.body);
  console.log('Body type:', typeof req.body);
  console.log('Body keys:', Object.keys(req.body || {}));
  res.json({ received: req.body, headers: req.headers });
};

// Create new collection
export const createCollection = async (req: Request, res: Response) => {
  try {
    console.log("req.hospitalId:", req.hospitalId)
    console.log("req.headerId:",req.headers['x-hospital-id'])
    const hospitalId = req.hospitalId || req.headers['x-hospital-id'] as string;
    console.log('Hospital ID:', hospitalId);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    if (!hospitalId) {
      res.status(400).json({ error: 'Hospital ID required' });
      return;
    }

    const tenantClient = schemaManager.getTenantClient(hospitalId);
    
    // Validate donor exists
    const donor = await tenantClient.donor.findFirst({
      where: { donorId: req.body.donorId }
    });
    console.log("Found donor:", donor);
    if (!donor) {
      res.status(400).json({ error: 'Donor not found' });
      return;
    }

    const collectionDate = req.body.collectionDate ? new Date(req.body.collectionDate) : new Date();
    console.log("Parsed collection date:", collectionDate);
    if (isNaN(collectionDate.getTime())) {
      res.status(400).json({ error: 'Invalid collection date' });
      return;
    }

    const collection = await tenantClient.collection.create({
      data: {
        donorId: donor.id,
        donorName: `${donor.firstName} ${donor.lastName}`,
        bloodGroup: donor.bloodGroup,
        collectionDate,
        collectionTime: req.body.collectionTime || new Date().toTimeString().slice(0, 5),
        volume: req.body.volume || 450,
        collectionType: req.body.collectionType || 'Whole Blood',
        collectionMethod: req.body.collectionMethod || 'Voluntary',
        location: req.body.location || 'Main Center',
        staff: req.body.staff || 'Staff',
        collectionId: `COL${Date.now()}`,
        bagNumber: `BAG${Date.now()}`,
        qualityChecks: {},
        testingStatus: {},
        status: 'Scheduled'
      },
      include: {
        donor: {
          select: {
            firstName: true,
            lastName: true,
            donorId: true,
            bloodGroup: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: collection,
      message: 'Collection scheduled successfully'
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update collection status
export const updateCollectionStatus = async (req: Request, res: Response) => {
  try {
    const hospitalId = req.hospitalId || req.headers['x-hospital-id'] as string;
    const { collectionId } = req.params;
    const { status, notes } = req.body;
    
    if (!hospitalId) {
      res.status(400).json({ error: 'Hospital ID required' });
      return;
    }

    const tenantClient = schemaManager.getTenantClient(hospitalId);
    
    const collection = await tenantClient.collection.update({
      where: { id: collectionId },
      data: {
        status,
        notes: notes || null,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: collection,
      message: 'Collection status updated successfully'
    });
  } catch (error) {
    console.error('Error updating collection status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Complete collection (create blood unit)
export const completeCollection = async (req: Request, res: Response) => {
  try {
    const hospitalId = req.hospitalId || req.headers['x-hospital-id'] as string;
    const { collectionId } = req.params;
    const { bloodUnitData } = req.body;
    
    if (!hospitalId) {
      res.status(400).json({ error: 'Hospital ID required' });
      return;
    }

    const tenantClient = schemaManager.getTenantClient(hospitalId);
    
    // Get collection details
    const collection = await tenantClient.collection.findUnique({
      where: { id: collectionId },
      include: { donor: true }
    });
    
    if (!collection) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    // Calculate expiry date
    const collectionDate = new Date(collection.collectionDate);
    let expiryDate = new Date(collectionDate);
    
    switch (bloodUnitData.component) {
      case 'Whole Blood':
        expiryDate.setDate(collectionDate.getDate() + 35);
        break;
      case 'Red Blood Cells':
        expiryDate.setDate(collectionDate.getDate() + 42);
        break;
      case 'Plasma':
        expiryDate.setFullYear(collectionDate.getFullYear() + 1);
        break;
      case 'Platelets':
        expiryDate.setDate(collectionDate.getDate() + 5);
        break;
      default:
        expiryDate.setDate(collectionDate.getDate() + 35);
    }

    // Create blood unit
    const bloodUnit = await tenantClient.bloodUnit.create({
      data: {
        ...bloodUnitData,
        donorId: collection.donorId,
        unitId: `BU${Date.now()}`,
        bloodGroup: collection.donor.bloodGroup,
        collectionDate: collection.collectionDate,
        expiryDate,
        testResults: {},
        status: 'Available'
      }
    });

    // Update collection status
    await tenantClient.collection.update({
      where: { id: collectionId },
      data: {
        status: 'Completed',
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: { collection, bloodUnit },
      message: 'Collection completed successfully'
    });
  } catch (error) {
    console.error('Error completing collection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};