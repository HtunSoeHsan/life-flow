import { PrismaClient as MasterPrismaClient } from '../../node_modules/.prisma/master-client';

// This is the master database client used for:
// - Hospital registration/lookup
// - System-wide settings
// - Cross-tenant operations
export const masterClient = new MasterPrismaClient({
  datasources: {
    master_db: {
      url: process.env.MASTER_DATABASE_URL || process.env.DATABASE_URL
    }
  }
});

export default masterClient;
