import { Request, Response } from 'express';
import masterClient from '../database/masterClient';
import SchemaManager from '../database/schemaManager';
import { hashPassword } from '../utils/auth';

const schemaManager = SchemaManager.getInstance();

// Create a new hospital (tenant)
export const createHospital = async (req: Request, res: Response) => {
  try {
    const {
      name,
      address,
      phone,
      email,
      licenseNo,
      contactPerson,
      domain,
      subdomain,
      settings,
      features,
      subscriptionTier
    } = req.body;

    // Generate schema name
    const schemaName = `tenant_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;

    // Create hospital in master database
    const hospital = await masterClient.hospital.create({
      data: {
        name,
        address,
        phone,
        email,
        licenseNo,
        contactPerson,
        domain,
        subdomain,
        schemaName,
        settings,
        features,
        subscriptionTier: subscriptionTier || 'basic'
      }
    });

    // Create tenant schema
    await schemaManager.createTenantSchema(hospital.id);

    res.status(201).json({
      success: true,
      data: hospital,
      message: 'Hospital created successfully'
    });
  } catch (error) {
    console.error('Error creating hospital:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all hospitals (admin view)
export const getAllHospitals = async (req: Request, res: Response) => {
  try {
    const hospitals = await masterClient.hospital.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: hospitals,
      total: hospitals.length
    });
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get specific hospital data (from master database)
export const getHospitalData = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    
    const hospital = await masterClient.hospital.findUnique({
      where: { id: hospitalId }
    });

    if (!hospital) {
      res.status(404).json({ error: 'Hospital not found' });
      return;
    }

    // Get tenant client for this hospital
    const tenantClient = schemaManager.getTenantClient(hospitalId);
    
    // Get statistics from tenant database
    const [users, donors, bloodUnits, collections, distributions] = await Promise.all([
      tenantClient.user.count(),
      tenantClient.donor.count(),
      tenantClient.bloodUnit.count(),
      tenantClient.collection.count(),
      tenantClient.distribution.count()
    ]);

    res.json({
      success: true,
      data: {
        ...hospital,
        statistics: {
          totalUsers: users,
          totalDonors: donors,
          totalBloodUnits: bloodUnits,
          totalCollections: collections,
          totalDistributions: distributions
        }
      }
    });
  } catch (error) {
    console.error('Error fetching hospital data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update hospital data
export const updateHospital = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    const updateData = req.body;
    
    const hospital = await masterClient.hospital.update({
      where: { id: hospitalId },
      data: updateData
    });
    
    res.json({
      success: true,
      data: hospital,
      message: 'Hospital updated successfully'
    });
  } catch (error) {
    console.error('Error updating hospital:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get users for a specific hospital
export const getHospitalUsers = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    
    const hospital = await masterClient.hospital.findUnique({
      where: { id: hospitalId }
    });

    if (!hospital) {
      res.status(404).json({ error: 'Hospital not found' });
      return;
    }

    const tenantClient = schemaManager.getTenantClient(hospitalId);
    const users = await tenantClient.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching hospital users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create user for a specific hospital
export const createHospitalUser = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.params;
    const userData = req.body;
    
    const hospital = await masterClient.hospital.findUnique({
      where: { id: hospitalId }
    });

    if (!hospital) {
      res.status(404).json({ error: 'Hospital not found' });
      return;
    }

    // Hash password before storing
    if (userData.password) {
      userData.password = await hashPassword(userData.password);
    }

    const tenantClient = schemaManager.getTenantClient(hospitalId);
    const user = await tenantClient.user.create({
      data: userData
    });

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating hospital user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user for a specific hospital
export const updateHospitalUser = async (req: Request, res: Response) => {
  try {
    const { hospitalId, userId } = req.params;
    const updateData = req.body;
    
    const hospital = await masterClient.hospital.findUnique({
      where: { id: hospitalId }
    });

    if (!hospital) {
      res.status(404).json({ error: 'Hospital not found' });
      return;
    }

    // Hash password if being updated
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    const tenantClient = schemaManager.getTenantClient(hospitalId);
    const user = await tenantClient.user.update({
      where: { id: userId },
      data: updateData
    });

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating hospital user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get aggregated statistics across all hospitals
export const getBloodInventorySummary = async (req: Request, res: Response) => {
  try {
    const hospitals = await masterClient.hospital.findMany({
      where: { isActive: true }
    });

    const aggregatedData = [];

    for (const hospital of hospitals) {
      try {
        const tenantClient = schemaManager.getTenantClient(hospital.id);
        const bloodUnits = await tenantClient.bloodUnit.findMany();
        
        const hospitalData = {
          hospitalId: hospital.id,
          hospitalName: hospital.name,
          bloodUnits: bloodUnits.length,
          bloodUnitsByGroup: bloodUnits.reduce((acc: Record<string, number>, unit: any) => {
            acc[unit.bloodGroup] = (acc[unit.bloodGroup] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          bloodUnitsByStatus: bloodUnits.reduce((acc: Record<string, number>, unit: any) => {
            acc[unit.status] = (acc[unit.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        };

        aggregatedData.push(hospitalData);
      } catch (error) {
        console.error(`Error fetching data for hospital ${hospital.id}:`, error);
        // Continue with other hospitals
      }
    }

    res.json({
      success: true,
      data: aggregatedData,
      summary: {
        totalHospitals: hospitals.length,
        totalBloodUnits: aggregatedData.reduce((sum, h) => sum + h.bloodUnits, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching blood inventory summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
