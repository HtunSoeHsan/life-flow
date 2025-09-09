import { Request, Response } from 'express';
import SchemaManager from '../database/schemaManager';
import { hashPassword } from '../utils/auth';

const schemaManager = SchemaManager.getInstance();

// Register new donor
export const registerDonor = async (req: Request, res: Response) => {
  try {
    const hospitalId = req.hospitalId || req.headers['x-hospital-id'] as string;
    console.log('Hospital ID:', hospitalId);
    console.log("req body:", req.body);
    if (!hospitalId) {
      res.status(400).json({ error: 'Hospital ID required' });
      return;
    }

    const tenantClient = schemaManager.getTenantClient(hospitalId);
    
    const donorData = req.body;
    
    if (!donorData.firstName || !donorData.lastName) {
      res.status(400).json({ error: 'First name and last name are required' });
      return;
    }
    
    const donorRecord = {
      firstName: donorData.firstName,
      lastName: donorData.lastName,
      email: donorData.email,
      phone: donorData.phone,
      dateOfBirth: new Date(donorData.dateOfBirth),
      gender: donorData.gender,
      bloodGroup: donorData.bloodGroup,
      weight: donorData.weight,
      address: donorData.address,
      occupation: donorData.occupation,
      emergencyContact: donorData.emergencyContact,
      hasChronicDisease: donorData.medicalHistory?.hasChronicDisease || false,
      chronicDiseaseDetails: donorData.medicalHistory?.chronicDiseaseDetails || null,
      recentMedication: donorData.medicalHistory?.recentMedication || false,
      isPregnant: donorData.medicalHistory?.isPregnant || false,
      preferredDonationTime: donorData.preferences?.preferredDonationTime || null,
      notifications: donorData.preferences?.notifications || false,
      emergencyDonor: donorData.preferences?.emergencyDonor || false,
      donorId: `D${Date.now()}`,
      isEligible: true,
      isActive: true,
      consent: true
    };

    const donor = await tenantClient.donor.create({
      data: donorRecord
    });

    res.status(201).json({
      success: true,
      data: donor,
      message: 'Donor registered successfully'
    });
  } catch (error) {
    console.error('Error registering donor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all donors with pagination and filters
export const getDonors = async (req: Request, res: Response) => {
  try {
    const hospitalId = req.hospitalId || req.headers['x-hospital-id'] as string;
    
    if (!hospitalId) {
      res.status(400).json({ error: 'Hospital ID required' });
      return;
    }

    const { bloodGroup, status, page = 1, limit = 10, search } = req.query;
    
    const tenantClient = schemaManager.getTenantClient(hospitalId);
    
    const where: any = {};
    if (bloodGroup) where.bloodGroup = bloodGroup;
    if (status) where.isActive = status === 'active';
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { donorId: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [donors, total] = await Promise.all([
      tenantClient.donor.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      tenantClient.donor.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        donors,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching donors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Check donor eligibility
export const checkEligibility = async (req: Request, res: Response) => {
  try {
    const { donorData } = req.body;
    if (!donorData) {
      res.status(400).json({ error: 'Donor data is required' });
      return;
    }
    
    if (!donorData.dateOfBirth) {
      res.status(400).json({ error: 'Date of birth is required' });
      return;
    }
    
    // Basic eligibility checks
    const age = new Date().getFullYear() - new Date(donorData.dateOfBirth).getFullYear();
    const weight = donorData.weight;
    const hasChronicDisease = donorData.medicalHistory?.hasChronicDisease;
    const recentMedication = donorData.medicalHistory?.recentMedication;
    const isPregnant = donorData.medicalHistory?.isPregnant;

    let isEligible = true;
    const reasons = [];

    if (age < 18 || age > 65) {
      isEligible = false;
      reasons.push('Age must be between 18-65 years');
    }

    if (weight < 50) {
      isEligible = false;
      reasons.push('Weight must be at least 50 kg');
    }

    if (hasChronicDisease) {
      isEligible = false;
      reasons.push('Chronic diseases may affect eligibility');
    }

    if (recentMedication) {
      isEligible = false;
      reasons.push('Recent medication may affect eligibility');
    }

    if (isPregnant) {
      isEligible = false;
      reasons.push('Pregnant or breastfeeding donors are not eligible');
    }

    res.json({
      success: true,
      data: {
        isEligible,
        summary: isEligible ? 'Donor is eligible for blood donation' : reasons.join(', '),
        reasons
      }
    });
  } catch (error) {
    console.error('Error checking eligibility:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update donor
export const updateDonor = async (req: Request, res: Response) => {
  try {
    const hospitalId = req.hospitalId || req.headers['x-hospital-id'] as string;
    const { donorId } = req.params;
    console.log("Updating donor:", donorId, req.body);
    console.log('Hospital ID:', hospitalId);
    if (!hospitalId) {
      res.status(400).json({ error: 'Hospital ID required' });
      return;
    }

    const tenantClient = schemaManager.getTenantClient(hospitalId);
    
    const donorData = req.body;
    const updateRecord = {
      firstName: donorData.firstName,
      lastName: donorData.lastName,
      email: donorData.email,
      phone: donorData.phone,
      dateOfBirth: new Date(donorData.dateOfBirth),
      gender: donorData.gender,
      bloodGroup: donorData.bloodGroup,
      weight: donorData.weight,
      address: donorData.address,
      occupation: donorData.occupation,
      emergencyContact: donorData.emergencyContact,
      hasChronicDisease: donorData.medicalHistory?.hasChronicDisease || false,
      chronicDiseaseDetails: donorData.medicalHistory?.chronicDiseaseDetails || null,
      recentMedication: donorData.medicalHistory?.recentMedication || false,
      isPregnant: donorData.medicalHistory?.isPregnant || false,
      preferredDonationTime: donorData.preferences?.preferredDonationTime || null,
      notifications: donorData.preferences?.notifications || false,
      emergencyDonor: donorData.preferences?.emergencyDonor || false
    };
    
    const donor = await tenantClient.donor.update({
      where: { id: donorId },
      data: updateRecord
    });

    res.json({
      success: true,
      data: donor,
      message: 'Donor updated successfully'
    });
  } catch (error) {
    console.error('Error updating donor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};