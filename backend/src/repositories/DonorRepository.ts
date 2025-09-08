import { PrismaClient } from '@prisma/client';
import { IRepository, QueryOptions, BaseSpecification } from './IRepository';
import { Donor, DonorConstructorData } from '../models/Donor';

/**
 * DonorRepository implementing Repository Pattern with Prisma ORM
 * Demonstrates: Repository Pattern, ORM Integration, Data Access Layer
 */
export class DonorRepository implements IRepository<Donor, string> {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findById(id: string): Promise<Donor | null> {
    try {
      const donorData = await this.prisma.donor.findUnique({
        where: { id },
        include: {
          tenant: true
        }
      });

      if (!donorData) return null;

      return this.mapToDomainModel(donorData);
    } catch (error) {
      console.error('Error finding donor by id:', error);
      throw new Error('Failed to find donor');
    }
  }

  async findAll(options?: QueryOptions): Promise<Donor[]> {
    try {
      const donors = await this.prisma.donor.findMany({
        where: options?.where,
        orderBy: options?.orderBy,
        include: options?.include || { tenant: true },
        skip: options?.skip,
        take: options?.take
      });

      return donors.map(donor => this.mapToDomainModel(donor));
    } catch (error) {
      console.error('Error finding all donors:', error);
      throw new Error('Failed to find donors');
    }
  }

  async create(donor: Donor): Promise<Donor> {
    try {
      const donorData = await this.prisma.donor.create({
        data: {
          tenantId: donor.tenantId,
          donorId: donor.donorId,
          firstName: donor.firstName,
          lastName: donor.lastName,
          email: donor.email,
          phone: donor.phone,
          dateOfBirth: donor.dateOfBirth,
          gender: donor.gender,
          bloodGroup: donor.bloodGroup,
          weight: donor.weight,
          address: donor.address,
          occupation: donor.occupation,
          emergencyContact: donor.emergencyContact,
          hasChronicDisease: donor.medicalHistory.hasChronicDisease,
          chronicDiseaseDetails: donor.medicalHistory.chronicDiseaseDetails,
          recentMedication: donor.medicalHistory.recentMedication,
          isPregnant: donor.medicalHistory.isPregnant,
          lastDonationDate: donor.medicalHistory.lastDonationDate,
          preferredDonationTime: donor.preferences.preferredDonationTime,
          notifications: donor.preferences.notifications,
          emergencyDonor: donor.preferences.emergencyDonor,
          consent: donor.preferences.consent,
          fingerprintHash: donor.biometricData?.fingerprintHash,
          fingerprintTemplate: donor.biometricData?.getTemplate(),
          biometricData: donor.biometricData ? donor.biometricData.toJSON() : undefined,
          biometricVerified: donor.biometricData?.isVerified || false,
          isEligible: donor.isEligible,
          isActive: donor.isActive
        },
        include: {
          tenant: true
        }
      });

      return this.mapToDomainModel(donorData);
    } catch (error) {
      console.error('Error creating donor:', error);
      throw new Error('Failed to create donor');
    }
  }

  async update(id: string, updates: Partial<Donor>): Promise<Donor | null> {
    try {
      const updateData: any = {};
      
      // Map domain model updates to database fields
      if (updates.firstName) updateData.firstName = updates.firstName;
      if (updates.lastName) updateData.lastName = updates.lastName;
      if (updates.email) updateData.email = updates.email;
      if (updates.phone) updateData.phone = updates.phone;
      if (updates.weight) updateData.weight = updates.weight;
      if (updates.address) updateData.address = updates.address;

      const donorData = await this.prisma.donor.update({
        where: { id },
        data: updateData,
        include: {
          tenant: true
        }
      });

      return this.mapToDomainModel(donorData);
    } catch (error) {
      console.error('Error updating donor:', error);
      throw new Error('Failed to update donor');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.donor.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting donor:', error);
      return false;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.prisma.donor.count({
        where: { id }
      });
      return count > 0;
    } catch (error) {
      console.error('Error checking donor existence:', error);
      return false;
    }
  }

  async count(options?: QueryOptions): Promise<number> {
    try {
      return await this.prisma.donor.count({
        where: options?.where
      });
    } catch (error) {
      console.error('Error counting donors:', error);
      throw new Error('Failed to count donors');
    }
  }

  // Donor-specific methods
  async findByTenantId(tenantId: string, options?: QueryOptions): Promise<Donor[]> {
    const queryOptions = {
      ...options,
      where: {
        ...options?.where,
        tenantId
      }
    };
    return this.findAll(queryOptions);
  }

  async findByDonorId(tenantId: string, donorId: string): Promise<Donor | null> {
    try {
      const donorData = await this.prisma.donor.findFirst({
        where: {
          tenantId,
          donorId
        },
        include: {
          tenant: true
        }
      });

      if (!donorData) return null;
      return this.mapToDomainModel(donorData);
    } catch (error) {
      console.error('Error finding donor by donor ID:', error);
      throw new Error('Failed to find donor by donor ID');
    }
  }

  async findByFingerprint(tenantId: string, fingerprintHash: string): Promise<Donor | null> {
    try {
      const donorData = await this.prisma.donor.findFirst({
        where: {
          tenantId,
          fingerprintHash,
          biometricVerified: true
        },
        include: {
          tenant: true
        }
      });

      if (!donorData) return null;
      return this.mapToDomainModel(donorData);
    } catch (error) {
      console.error('Error finding donor by fingerprint:', error);
      throw new Error('Failed to find donor by fingerprint');
    }
  }

  async findByBloodGroup(tenantId: string, bloodGroup: string): Promise<Donor[]> {
    return this.findByTenantId(tenantId, {
      where: { bloodGroup }
    });
  }

  async findEligibleDonors(tenantId: string): Promise<Donor[]> {
    return this.findByTenantId(tenantId, {
      where: {
        isEligible: true,
        isActive: true
      }
    });
  }

  // Private mapping method
  private mapToDomainModel(donorData: any): Donor {
    const constructorData: DonorConstructorData = {
      id: donorData.id,
      tenantId: donorData.tenantId,
      donorId: donorData.donorId,
      firstName: donorData.firstName,
      lastName: donorData.lastName,
      email: donorData.email,
      phone: donorData.phone,
      dateOfBirth: donorData.dateOfBirth,
      gender: donorData.gender,
      bloodGroup: donorData.bloodGroup,
      weight: donorData.weight,
      address: donorData.address,
      occupation: donorData.occupation,
      emergencyContact: donorData.emergencyContact,
      medicalHistory: {
        hasChronicDisease: donorData.hasChronicDisease,
        chronicDiseaseDetails: donorData.chronicDiseaseDetails,
        recentMedication: donorData.recentMedication,
        isPregnant: donorData.isPregnant,
        lastDonationDate: donorData.lastDonationDate,
        allergies: donorData.biometricData?.allergies || [],
        surgeries: donorData.biometricData?.surgeries || []
      },
      preferences: {
        preferredDonationTime: donorData.preferredDonationTime,
        notifications: donorData.notifications,
        emergencyDonor: donorData.emergencyDonor,
        consent: donorData.consent
      },
      biometricData: donorData.fingerprintHash ? {
        fingerprintHash: donorData.fingerprintHash,
        fingerprintTemplate: donorData.fingerprintTemplate,
        confidence: donorData.biometricData?.confidence || 0
      } : undefined
    };

    return new Donor(constructorData);
  }
}

// Donor-specific specifications
export class DonorSpecifications {
  static byBloodGroup(bloodGroup: string) {
    return new BloodGroupSpecification(bloodGroup);
  }

  static eligible() {
    return new EligibleDonorSpecification();
  }

  static byAge(minAge: number, maxAge: number) {
    return new AgeRangeSpecification(minAge, maxAge);
  }

  static byWeight(minWeight: number) {
    return new MinimumWeightSpecification(minWeight);
  }
}

class BloodGroupSpecification extends BaseSpecification<Donor> {
  constructor(private bloodGroup: string) {
    super();
  }

  isSatisfiedBy(donor: Donor): boolean {
    return donor.bloodGroup === this.bloodGroup;
  }

  toQuery(): any {
    return {
      bloodGroup: this.bloodGroup
    };
  }
}

class EligibleDonorSpecification extends BaseSpecification<Donor> {
  isSatisfiedBy(donor: Donor): boolean {
    return donor.isEligible && donor.isActive && donor.canDonate();
  }

  toQuery(): any {
    return {
      isEligible: true,
      isActive: true
    };
  }
}

class AgeRangeSpecification extends BaseSpecification<Donor> {
  constructor(private minAge: number, private maxAge: number) {
    super();
  }

  isSatisfiedBy(donor: Donor): boolean {
    const age = donor.age;
    return age >= this.minAge && age <= this.maxAge;
  }

  toQuery(): any {
    const now = new Date();
    const maxBirthDate = new Date(now.getFullYear() - this.minAge, now.getMonth(), now.getDate());
    const minBirthDate = new Date(now.getFullYear() - this.maxAge, now.getMonth(), now.getDate());
    
    return {
      dateOfBirth: {
        gte: minBirthDate,
        lte: maxBirthDate
      }
    };
  }
}

class MinimumWeightSpecification extends BaseSpecification<Donor> {
  constructor(private minWeight: number) {
    super();
  }

  isSatisfiedBy(donor: Donor): boolean {
    return donor.weight >= this.minWeight;
  }

  toQuery(): any {
    return {
      weight: {
        gte: this.minWeight
      }
    };
  }
}
