import { PrismaClient as TenantPrismaClient } from '../../node_modules/.prisma/tenant-client';
import { PrismaClient as MasterPrismaClient } from '../../node_modules/.prisma/master-client';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export class SchemaManager {
  private static instance: SchemaManager;
  private tenantConnections: Map<string, TenantPrismaClient> = new Map();
  
  private constructor() {}
  
  public static getInstance(): SchemaManager {
    if (!SchemaManager.instance) {
      SchemaManager.instance = new SchemaManager();
    }
    return SchemaManager.instance;
  }

  /**
   * Get or create a Prisma client for a specific tenant schema
   */
  public getTenantClient(hospitalId: string): TenantPrismaClient {
    const schemaName = this.getSchemaName(hospitalId);
    
    if (!this.tenantConnections.has(hospitalId)) {
      const databaseUrl = this.buildSchemaUrl(schemaName);
      const client = new TenantPrismaClient({
        datasources: {
          tenant_db: {
            url: databaseUrl
          }
        }
      });
      
      this.tenantConnections.set(hospitalId, client);
    }
    
    return this.tenantConnections.get(hospitalId)!;
  }

  /**
   * Create a new schema for a tenant
   */
  public async createTenantSchema(hospitalId: string): Promise<void> {
    const schemaName = this.getSchemaName(hospitalId);
    
    try {
      // Create the schema
      await this.executeSQL(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
      
      // Run migrations for this schema
      await this.runMigrationsForSchema(schemaName);
      
      console.log(`Created schema and ran migrations for tenant: ${hospitalId}`);
    } catch (error) {
      console.error(`Error creating tenant schema for ${hospitalId}:`, error);
      throw error;
    }
  }

  /**
   * Drop a tenant schema (use with caution!)
   */
  public async dropTenantSchema(hospitalId: string): Promise<void> {
    const schemaName = this.getSchemaName(hospitalId);
    
    try {
      await this.executeSQL(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
      
      // Close and remove the connection
      const client = this.tenantConnections.get(hospitalId);
      if (client) {
        await client.$disconnect();
        this.tenantConnections.delete(hospitalId);
      }
      
      console.log(`Dropped schema for tenant: ${hospitalId}`);
    } catch (error) {
      console.error(`Error dropping tenant schema for ${hospitalId}:`, error);
      throw error;
    }
  }

  /**
   * List all tenant schemas
   */
  public async listTenantSchemas(): Promise<string[]> {
    const result = await this.executeSQL(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenant_%'
    `);
    
    return result.map((row: any) => row.schema_name);
  }

  /**
   * Migrate all tenant schemas
   */
  public async migrateAllTenants(hospitalIds: string[]): Promise<void> {
    for (const hospitalId of hospitalIds) {
      try {
        const schemaName = this.getSchemaName(hospitalId);
        await this.runMigrationsForSchema(schemaName);
        console.log(`Migrated schema for tenant: ${hospitalId}`);
      } catch (error) {
        console.error(`Error migrating tenant ${hospitalId}:`, error);
      }
    }
  }

  /**
   * Get master database client
   */
  public getMasterClient(): MasterPrismaClient {
    return new MasterPrismaClient();
  }

  /**
   * Close all tenant connections
   */
  public async closeAllConnections(): Promise<void> {
    for (const [hospitalId, client] of this.tenantConnections) {
      try {
        await client.$disconnect();
        console.log(`Closed connection for tenant: ${hospitalId}`);
      } catch (error) {
        console.error(`Error closing connection for tenant ${hospitalId}:`, error);
      }
    }
    this.tenantConnections.clear();
  }

  // Private helper methods

  private getSchemaName(hospitalId: string): string {
    return `tenant_${hospitalId.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  }

  private buildSchemaUrl(schemaName: string): string {
    const baseUrl = process.env.TENANT_DATABASE_URL || process.env.DATABASE_URL || '';
    const url = new URL(baseUrl);
    url.searchParams.set('schema', schemaName);
    return url.toString();
  }

  private async executeSQL(query: string): Promise<any[]> {
    // Use the master Prisma client to execute raw SQL
    const mainClient = new MasterPrismaClient();
    try {
      const result = await mainClient.$queryRawUnsafe(query);
      return Array.isArray(result) ? result : [result];
    } finally {
      await mainClient.$disconnect();
    }
  }

  private async runMigrationsForSchema(schemaName: string): Promise<void> {
    const databaseUrl = this.buildSchemaUrl(schemaName);
    
    // Set environment variable for this migration
    const env = {
      ...process.env,
      TENANT_DATABASE_URL: databaseUrl
    };

    try {
      await execAsync('npx prisma db push --schema=prisma/tenant-schema.prisma --accept-data-loss', {
        env,
        cwd: process.cwd()
      });
    } catch (error) {
      console.error(`Migration failed for schema ${schemaName}:`, error);
      throw error;
    }
  }
}

export default SchemaManager;
