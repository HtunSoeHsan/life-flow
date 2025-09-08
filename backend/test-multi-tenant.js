const { PrismaClient: MasterPrismaClient } = require('./node_modules/.prisma/master-client');
const { PrismaClient: TenantPrismaClient } = require('./node_modules/.prisma/tenant-client');

async function testMultiTenant() {
  console.log('🧪 Testing Multi-Tenant Setup');
  
  // Initialize master client
  const masterClient = new MasterPrismaClient({
    datasources: {
      master_db: {
        url: process.env.MASTER_DATABASE_URL || process.env.DATABASE_URL
      }
    }
  });

  try {
    console.log('1. Testing master database connection...');
    await masterClient.$connect();
    console.log('✅ Master database connected');

    // Create first hospital
    console.log('2. Creating first hospital (City Hospital)...');
    const hospital1 = await masterClient.hospital.create({
      data: {
        name: 'City Hospital',
        address: '123 Main St',
        phone: '123-456-7890',
        email: 'contact@cityhospital.com',
        licenseNo: 'LIC123',
        contactPerson: 'John Doe',
        domain: 'cityhospital.com',
        subdomain: 'city',
        schemaName: 'tenant_city_hospital_' + Date.now()
      }
    });
    console.log('✅ Hospital 1 created:', hospital1.id);

    // Create second hospital
    console.log('3. Creating second hospital (Metro Hospital)...');
    const hospital2 = await masterClient.hospital.create({
      data: {
        name: 'Metro Hospital',
        address: '456 Oak Ave',
        phone: '987-654-3210',
        email: 'info@metrohospital.com',
        licenseNo: 'LIC456',
        contactPerson: 'Jane Smith',
        domain: 'metrohospital.com',
        subdomain: 'metro',
        schemaName: 'tenant_metro_hospital_' + Date.now()
      }
    });
    console.log('✅ Hospital 2 created:', hospital2.id);

    // Create tenant schemas for both hospitals
    console.log('4. Creating tenant schema for Hospital 1...');
    await createTenantSchema(hospital1.schemaName);
    
    console.log('5. Creating tenant schema for Hospital 2...');
    await createTenantSchema(hospital2.schemaName);

    // Test tenant client for hospital 1
    console.log('6. Testing tenant client for Hospital 1...');
    const tenant1Client = new TenantPrismaClient({
      datasources: {
        tenant_db: {
          url: buildSchemaUrl(hospital1.schemaName)
        }
      }
    });

    await tenant1Client.$connect();
    
    // Add a user to hospital 1
    const user1 = await tenant1Client.user.create({
      data: {
        email: 'admin@cityhospital.com',
        password: 'hashedpassword',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      }
    });
    console.log('✅ User created in Hospital 1:', user1.id);

    // Test tenant client for hospital 2
    console.log('7. Testing tenant client for Hospital 2...');
    const tenant2Client = new TenantPrismaClient({
      datasources: {
        tenant_db: {
          url: buildSchemaUrl(hospital2.schemaName)
        }
      }
    });

    await tenant2Client.$connect();
    
    // Add a user to hospital 2
    const user2 = await tenant2Client.user.create({
      data: {
        email: 'admin@metrohospital.com',
        password: 'hashedpassword',
        firstName: 'Metro',
        lastName: 'Admin',
        role: 'admin'
      }
    });
    console.log('✅ User created in Hospital 2:', user2.id);

    // Verify data isolation
    console.log('8. Verifying data isolation...');
    const hospital1Users = await tenant1Client.user.findMany();
    const hospital2Users = await tenant2Client.user.findMany();
    
    console.log(`Hospital 1 users: ${hospital1Users.length} (should be 1)`);
    console.log(`Hospital 2 users: ${hospital2Users.length} (should be 1)`);
    
    if (hospital1Users.length === 1 && hospital2Users.length === 1) {
      console.log('✅ Data isolation working correctly!');
    } else {
      console.log('❌ Data isolation issue detected');
    }

    // List all hospitals
    console.log('9. Listing all hospitals from master database...');
    const allHospitals = await masterClient.hospital.findMany();
    console.log(`Total hospitals: ${allHospitals.length}`);
    allHospitals.forEach(h => {
      console.log(`- ${h.name} (${h.subdomain})`);
    });

    console.log('🎉 Multi-tenant test completed successfully!');

    // Cleanup connections
    await masterClient.$disconnect();
    await tenant1Client.$disconnect();
    await tenant2Client.$disconnect();

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

function buildSchemaUrl(schemaName) {
  const baseUrl = process.env.DATABASE_URL || 'postgresql://postgres:password733@localhost:5432/bbm_database';
  const url = new URL(baseUrl);
  url.searchParams.set('schema', schemaName);
  return url.toString();
}

async function createTenantSchema(schemaName) {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);

  // Create the schema using raw SQL
  const masterClient = new MasterPrismaClient();
  try {
    await masterClient.$queryRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    console.log(`✅ Schema ${schemaName} created`);
    
    // Push the tenant schema to the new schema
    const databaseUrl = buildSchemaUrl(schemaName);
    const env = {
      ...process.env,
      TENANT_DATABASE_URL: databaseUrl
    };

    await execAsync('npx prisma db push --schema=prisma/tenant-schema.prisma', {
      env,
      cwd: process.cwd()
    });
    console.log(`✅ Schema ${schemaName} migrated`);
    
  } finally {
    await masterClient.$disconnect();
  }
}

// Load environment variables
require('dotenv').config();

// Run the test
testMultiTenant().catch(console.error);
