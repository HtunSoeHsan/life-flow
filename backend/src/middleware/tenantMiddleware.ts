import { Request, Response, NextFunction } from 'express';
import { PrismaClient as TenantPrismaClient } from '../../node_modules/.prisma/tenant-client';
import SchemaManager from '../database/schemaManager';
import masterClient from '../database/masterClient';

const schemaManager = SchemaManager.getInstance();

declare global {
  namespace Express {
    interface Request {
      hospitalId?: string;
      hospital?: any;
      prisma?: TenantPrismaClient;
      tenantId?: string;
      tenant?: any;
    }
  }
}

export const hospitalMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract hospital from subdomain or domain
    const host = req.get('host') || '';
    const subdomain = host.split('.')[0];
    
    // For development, you can also extract from headers
    const hospitalFromHeader = req.headers['x-hospital-id'] as string;
    
    let hospital;
    
    if (hospitalFromHeader) {
      hospital = await masterClient.hospital.findFirst({
        where: {
          OR: [
            { id: hospitalFromHeader },
            { subdomain: hospitalFromHeader }
          ],
          isActive: true
        }
      });
    } else if (subdomain && subdomain !== 'localhost' && subdomain !== '127') {
      hospital = await masterClient.hospital.findFirst({
        where: {
          subdomain,
          isActive: true
        }
      });
    }
    
    // For development - use first active hospital if none specified
    if (!hospital) {
      hospital = await masterClient.hospital.findFirst({
        where: {
          isActive: true
        }
      });
    }
    
    if (!hospital) {
      return res.status(400).json({ error: 'No active hospital found' });
    }

    // Use SchemaManager to get correct Prisma client
    const client = schemaManager.getTenantClient(hospital.id);
    req.hospitalId = hospital.id;
    req.hospital = hospital;
    req.prisma = client; // Attach Prisma client to the request specific to the tenant
    
    // Also set tenant properties for backward compatibility
    req.tenantId = hospital.id;
    req.tenant = hospital;

    next();
  } catch (error) {
    console.error('Hospital middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Export as tenantMiddleware for backward compatibility
export const tenantMiddleware = hospitalMiddleware;

export default hospitalMiddleware;
