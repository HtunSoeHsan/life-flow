import { PrismaClient as MasterClient } from '.prisma/master-client';
import { hashPassword } from '../src/utils/auth';
import masterClient from '../src/database/masterClient';
import SchemaManager from '../src/database/schemaManager';

const schemaManager = SchemaManager.getInstance();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create hospitals in master database
  const hospitals = await Promise.all([
    masterClient.hospital.upsert({
      where: { email: 'admin@cityhospital.com' },
      update: {},
      create: {
        name: 'City General Hospital',
        address: '123 Main St, City Center',
        phone: '+1-555-0101',
        email: 'admin@cityhospital.com',
        licenseNo: 'LIC001',
        contactPerson: 'Dr. John Smith',
        schemaName: 'tenant_city_hospital',
        isActive: true
      }
    }),
    masterClient.hospital.upsert({
      where: { email: 'admin@metromedical.com' },
      update: {},
      create: {
        name: 'Metro Medical Center',
        address: '456 Health Ave, Metro District',
        phone: '+1-555-0102',
        email: 'admin@metromedical.com',
        licenseNo: 'LIC002',
        contactPerson: 'Dr. Sarah Johnson',
        schemaName: 'tenant_metro_medical',
        isActive: true
      }
    }),
    masterClient.hospital.upsert({
      where: { email: 'admin@regionalblood.org' },
      update: {},
      create: {
        name: 'Regional Blood Bank',
        address: '789 Blood Drive, Regional Area',
        phone: '+1-555-0103',
        email: 'admin@regionalblood.org',
        licenseNo: 'LIC003',
        contactPerson: 'Dr. Michael Brown',
        schemaName: 'tenant_regional_blood',
        isActive: true
      }
    })
  ]);

  console.log('✅ Created hospitals:', hospitals.map(h => h.name));

  // Seed tenant data for each hospital
  for (const hospital of hospitals) {
    console.log(`🏥 Seeding data for ${hospital.name}...`);
    
    // Create tenant schema for this hospital
    await schemaManager.createTenantSchema(hospital.id);
    
    // Get tenant client for this hospital
    const tenantClient = schemaManager.getTenantClient(hospital.id);
  
  // Create users
  const users = await Promise.all([
    tenantClient.user.upsert({
      where: { email: 'admin@hospital.com' },
      update: {},
      create: {
        email: 'admin@hospital.com',
        password: await hashPassword('admin123'),
        role: 'admin',
        firstName: 'Hospital',
        lastName: 'Admin',
        phone: '+1-555-1001',
        isActive: true
      }
    }),
    tenantClient.user.upsert({
      where: { email: 'staff@hospital.com' },
      update: {},
      create: {
        email: 'staff@hospital.com',
        password: await hashPassword('staff123'),
        role: 'staff',
        firstName: 'Staff',
        lastName: 'Member',
        phone: '+1-555-1002',
        isActive: true
      }
    })
  ]);

    console.log(`✅ Created users for ${hospital.name}:`, users.map(u => u.email));

    // Create donors for this hospital
    const donors = await Promise.all([
    tenantClient.donor.create({
      data: {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@email.com',
        phone: '+1-555-2001',
        dateOfBirth: new Date('1990-05-15'),
        gender: 'Female',
        bloodGroup: 'O+',
        weight: 65.5,
        address: '123 Donor St, City',
        occupation: 'Teacher',
        emergencyContact: '+1-555-2002',
        hasChronicDisease: false,
        recentMedication: false,
        isPregnant: false,
        lastDonationDate: new Date('2024-01-15'),
        emergencyDonor: true,
        consent: true,
        isEligible: true,
        isActive: true
      }
    }),
    tenantClient.donor.create({
      data: {
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@email.com',
        phone: '+1-555-2003',
        dateOfBirth: new Date('1985-08-22'),
        gender: 'Male',
        bloodGroup: 'A+',
        weight: 75.0,
        address: '456 Helper Ave, City',
        occupation: 'Engineer',
        emergencyContact: '+1-555-2004',
        hasChronicDisease: false,
        recentMedication: false,
        isPregnant: false,
        lastDonationDate: new Date('2024-02-10'),
        emergencyDonor: false,
        consent: true,
        isEligible: true,
        isActive: true
      }
    }),
    tenantClient.donor.create({
      data: {
        firstName: 'Carol',
        lastName: 'Davis',
        email: 'carol@email.com',
        phone: '+1-555-2005',
        dateOfBirth: new Date('1992-12-03'),
        gender: 'Female',
        bloodGroup: 'B+',
        weight: 58.0,
        address: '789 Care Blvd, City',
        occupation: 'Nurse',
        emergencyContact: '+1-555-2006',
        hasChronicDisease: false,
        recentMedication: false,
        isPregnant: false,
        lastDonationDate: new Date('2024-01-28'),
        emergencyDonor: true,
        consent: true,
        isEligible: true,
        isActive: true
      }
    })
  ]);

    console.log(`✅ Created donors for ${hospital.name}:`, donors.map(d => `${d.firstName} ${d.lastName}`));

    // Create blood units for this hospital
    const bloodUnits = await Promise.all([
    tenantClient.bloodUnit.create({
      data: {
        unitId: 'BU2024001',
        donorId: donors[0].id,
        bloodGroup: 'O+',
        component: 'Whole Blood',
        collectionDate: new Date('2024-01-15'),
        expiryDate: new Date('2024-02-19'),
        volume: 450,
        status: 'Available',
        location: 'Refrigerator-A1',
        temperature: 4.2,
        batchNumber: 'B240115001',
        testResults: { HIV: 'Negative', HBV: 'Negative', HCV: 'Negative' },
        crossMatchStatus: 'Compatible',
        quarantineStatus: 'Released'
      }
    }),
    tenantClient.bloodUnit.create({
      data: {
        unitId: 'BU2024002',
        donorId: donors[1].id,
        bloodGroup: 'A+',
        component: 'Red Blood Cells',
        collectionDate: new Date('2024-02-10'),
        expiryDate: new Date('2024-03-24'),
        volume: 350,
        status: 'Available',
        location: 'Refrigerator-B2',
        temperature: 4.0,
        batchNumber: 'B240210002',
        testResults: { HIV: 'Negative', HBV: 'Negative', HCV: 'Negative' },
        crossMatchStatus: 'Compatible',
        quarantineStatus: 'Released'
      }
    }),
    tenantClient.bloodUnit.create({
      data: {
        unitId: 'BU2024003',
        donorId: donors[2].id,
        bloodGroup: 'B+',
        component: 'Plasma',
        collectionDate: new Date('2024-01-28'),
        expiryDate: new Date('2025-01-28'),
        volume: 250,
        status: 'Reserved',
        location: 'Freezer-C1',
        temperature: -18.5,
        batchNumber: 'B240128003',
        testResults: { HIV: 'Negative', HBV: 'Negative', HCV: 'Negative' },
        crossMatchStatus: 'Pending',
        quarantineStatus: 'Released',
        reservedFor: 'Emergency Case #001'
      }
    })
  ]);

    console.log(`✅ Created blood units for ${hospital.name}:`, bloodUnits.map(bu => bu.unitId));

    // Create collections for this hospital
    const collections = await Promise.all([
    tenantClient.collection.create({
      data: {
        collectionId: 'COL2024001',
        donorId: donors[0].id,
        donorName: `${donors[0].firstName} ${donors[0].lastName}`,
        bloodGroup: 'O+',
        collectionDate: new Date('2024-01-15'),
        collectionTime: '10:30 AM',
        volume: 450,
        collectionType: 'Whole Blood',
        collectionMethod: 'Standard',
        location: 'Collection Room 1',
        staff: 'Nurse Jane',
        status: 'Completed',
        currentStep: 5,
        bagNumber: 'BAG001',
        temperature: 37.0,
        qualityChecks: { hemoglobin: 13.5, bloodPressure: '120/80' },
        testingStatus: { screening: 'Completed', crossMatch: 'Completed' }
      }
    }),
    tenantClient.collection.create({
      data: {
        collectionId: 'COL2024002',
        donorId: donors[1].id,
        donorName: `${donors[1].firstName} ${donors[1].lastName}`,
        bloodGroup: 'A+',
        collectionDate: new Date('2024-02-10'),
        collectionTime: '2:15 PM',
        volume: 450,
        collectionType: 'Whole Blood',
        collectionMethod: 'Standard',
        location: 'Collection Room 2',
        staff: 'Nurse Bob',
        status: 'Processing',
        currentStep: 3,
        bagNumber: 'BAG002',
        temperature: 37.2,
        qualityChecks: { hemoglobin: 14.2, bloodPressure: '118/75' },
        testingStatus: { screening: 'In Progress', crossMatch: 'Pending' }
      }
    })
  ]);

    console.log(`✅ Created collections for ${hospital.name}:`, collections.map(c => c.collectionId));

    // Create distributions for this hospital
    const distributions = await Promise.all([
    tenantClient.distribution.create({
      data: {
        distributionId: 'DIST2024001',
        bloodUnitId: bloodUnits[0].id,
        requestDate: new Date('2024-02-01'),
        issueDate: new Date('2024-02-01'),
        quantity: 1,
        purpose: 'Emergency Surgery',
        urgency: 'Emergency',
        status: 'Issued',
        approvedBy: 'Dr. Smith',
        notes: 'Emergency case - patient in critical condition'
      }
    }),
    tenantClient.distribution.create({
      data: {
        distributionId: 'DIST2024002',
        bloodUnitId: bloodUnits[2].id,
        requestDate: new Date('2024-02-05'),
        quantity: 1,
        purpose: 'Routine Surgery',
        urgency: 'Routine',
        status: 'Requested',
        notes: 'Scheduled surgery for next week'
      }
    })
  ]);

    console.log(`✅ Created distributions for ${hospital.name}:`, distributions.map(d => d.distributionId));
    
  }
  
  // Close all tenant connections
  await schemaManager.closeAllConnections();

  console.log('🎉 Database seeding completed successfully for all hospitals!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await masterClient.$disconnect();
  });