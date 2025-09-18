import { Request, Response } from 'express';
import SchemaManager from '../database/schemaManager';

const schemaManager = SchemaManager.getInstance();

// Get inventory summary by blood group
export const getInventorySummary = async (req: Request, res: Response) => {
  try {
    const hospitalId = req.hospitalId || req.headers['x-hospital-id'] as string;
    
    if (!hospitalId) {
      res.status(400).json({ error: 'Hospital ID required' });
      return;
    }

    const tenantClient = schemaManager.getTenantClient(hospitalId);
    const bloodUnits = await tenantClient.bloodUnit.findMany();
    // Group by blood group
    const summary = bloodUnits.reduce((acc: any, unit: any) => {
      const group = unit.bloodGroup;
      if (!acc[group]) {
        acc[group] = { bloodType: group, total: 0, available: 0, reserved: 0, expiring: 0 };
      }
      
      acc[group].total++;
      if (unit.status === 'Available') acc[group].available++;
      if (unit.status === 'Reserved') acc[group].reserved++;
      
      // Check if expiring within 7 days
      const expiryDate = new Date(unit.expiryDate);
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      if (expiryDate <= sevenDaysFromNow && unit.status === 'Available') {
        acc[group].expiring++;
      }
      
      return acc;
    }, {});

    res.json({
      success: true,
      data: Object.values(summary)
    });
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get blood units with pagination and filters
export const getBloodUnits = async (req: Request, res: Response) => {
  try {
    const hospitalId = req.hospitalId || req.headers['x-hospital-id'] as string;
    
    if (!hospitalId) {
      res.status(400).json({ error: 'Hospital ID required' });
      return;
    }

    const { bloodGroup, status, component, page = 1, limit = 10 } = req.query;
    
    const tenantClient = schemaManager.getTenantClient(hospitalId);
    
    const where: any = {};
    if (bloodGroup) where.bloodGroup = bloodGroup;
    if (status) where.status = status;
    if (component) where.component = component;

    const skip = (Number(page) - 1) * Number(limit);
    
    const [bloodUnits, total] = await Promise.all([
      tenantClient.bloodUnit.findMany({
        where,
        include: {
          donor: {
            select: {
              firstName: true,
              lastName: true,
              donorId: true
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      tenantClient.bloodUnit.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        bloodUnits,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching blood units:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new blood unit
export const createBloodUnit = async (req: Request, res: Response) => {
  try {
    const hospitalId = req.hospitalId || req.headers['x-hospital-id'] as string;
    
    if (!hospitalId) {
      res.status(400).json({ error: 'Hospital ID required' });
      return;
    }

    const tenantClient = schemaManager.getTenantClient(hospitalId);
    
    // Calculate expiry date based on component
    const { collectionDate, component } = req.body;
    const collection = new Date(collectionDate);
    let expiryDate = new Date(collection);
    
    switch (component) {
      case 'Whole Blood':
        expiryDate.setDate(collection.getDate() + 35);
        break;
      case 'Red Blood Cells':
        expiryDate.setDate(collection.getDate() + 42);
        break;
      case 'Plasma':
        expiryDate.setFullYear(collection.getFullYear() + 1);
        break;
      case 'Platelets':
        expiryDate.setDate(collection.getDate() + 5);
        break;
      default:
        expiryDate.setDate(collection.getDate() + 35);
    }

    // Validate donor exists
    const donor = await tenantClient.donor.findUnique({
      where: { donorId: req.body.donorId }
    });
    if (!donor) {
      res.status(400).json({ error: 'Donor not found' });
      return;
    }

    const bloodUnit = await tenantClient.bloodUnit.create({
      data: {
        ...req.body,
        donorId: donor.id, // Use the actual donor ID from database
        unitId: `BU${Date.now()}`,
        expiryDate,
        testResults: req.body.testResults || {},
        temperature: req.body.temperature || 4.0
      }
    });

    res.status(201).json({
      success: true,
      data: bloodUnit,
      message: 'Blood unit created successfully'
    });
  } catch (error) {
    console.error('Error creating blood unit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update blood unit status
export const updateBloodUnitStatus = async (req: Request, res: Response) => {
  try {
    const hospitalId = req.hospitalId || req.headers['x-hospital-id'] as string;
    const { unitId } = req.params;
    const { status, notes } = req.body;
    
    if (!hospitalId) {
      res.status(400).json({ error: 'Hospital ID required' });
      return;
    }

    const tenantClient = schemaManager.getTenantClient(hospitalId);
    
    const bloodUnit = await tenantClient.bloodUnit.update({
      where: { id: unitId },
      data: {
        status,
        notes: notes || null,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: bloodUnit,
      message: 'Blood unit status updated successfully'
    });
  } catch (error) {
    console.error('Error updating blood unit status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update test results
export const updateTestResults = async (req: Request, res: Response) => {
  try {
    const hospitalId = req.hospitalId || req.headers['x-hospital-id'] as string;
    const { unitId } = req.params;
    const testResults = req.body;
    
    if (!hospitalId) {
      res.status(400).json({ error: 'Hospital ID required' });
      return;
    }

    const tenantClient = schemaManager.getTenantClient(hospitalId);
    
    const bloodUnit = await tenantClient.bloodUnit.update({
      where: { id: unitId },
      data: {
        testResults,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: bloodUnit,
      message: 'Test results updated successfully'
    });
  } catch (error) {
    console.error('Error updating test results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Issue blood unit
export const issueBloodUnit = async (req: Request, res: Response) => {
  try {
    const hospitalId = req.hospitalId || req.headers['x-hospital-id'] as string;
    const { unitId } = req.params;
    const issueData = req.body;
    
    if (!hospitalId) {
      res.status(400).json({ error: 'Hospital ID required' });
      return;
    }

    const tenantClient = schemaManager.getTenantClient(hospitalId);
    
    // Update unit status to issued
    const bloodUnit = await tenantClient.bloodUnit.update({
      where: { id: unitId },
      data: {
        status: 'Issued',
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: bloodUnit,
      message: 'Blood unit issued successfully'
    });
  } catch (error) {
    console.error('Error issuing blood unit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get expiring units
export const getExpiringUnits = async (req: Request, res: Response) => {
  try {
    const hospitalId = req.hospitalId || req.headers['x-hospital-id'] as string;
    const { days = 7 } = req.query;
    
    if (!hospitalId) {
      res.status(400).json({ error: 'Hospital ID required' });
      return;
    }

    const tenantClient = schemaManager.getTenantClient(hospitalId);
    
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + Number(days));

    const expiringUnits = await tenantClient.bloodUnit.findMany({
      where: {
        expiryDate: {
          lte: expiryThreshold
        },
        status: 'Available'
      },
      include: {
        donor: {
          select: {
            firstName: true,
            lastName: true,
            donorId: true
          }
        }
      },
      orderBy: { expiryDate: 'asc' }
    });

    res.json({
      success: true,
      data: expiringUnits
    });
  } catch (error) {
    console.error('Error fetching expiring units:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};