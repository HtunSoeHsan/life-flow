import { Request, Response, NextFunction } from 'express';
import SchemaManager from '../database/schemaManager';

const schemaManager = SchemaManager.getInstance();

export interface AuditLogData {
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
}

export const auditLogger = (action: string, entityType: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store the original json method
    const originalJson = res.json;
    
    // Override json method to capture successful responses
    res.json = function(body: any) {
      // Only log for successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Log audit asynchronously without blocking the response
        setImmediate(() => {
          logAudit(req, action, entityType, body).catch(err => 
            console.error('Audit logging error:', err)
          );
        });
      }
      
      // Call the original json method
      return originalJson.call(this, body);
    };
    
    next();
  };
};

async function logAudit(req: Request, action: string, entityType: string, responseBody?: any) {
  try {
    const hospitalId = (req as any).hospitalId || req.headers['x-hospital-id'] as string;
    if (!hospitalId) {
      return;
    }

    const tenantClient = schemaManager.getTenantClient(hospitalId);
    
    // Extract entity ID
    let entityId = null;
    if (responseBody?.data?.id) {
      entityId = responseBody.data.id;
    } else if (req.params.id || req.params.donorId || req.params.collectionId || req.params.unitId) {
      entityId = req.params.id || req.params.donorId || req.params.collectionId || req.params.unitId;
    }
    
    // Try to get user info from headers, body, or default to anonymous
    const userId = (req as any).userId || req.headers['x-user-id'] || req.body?.userId || 'anonymous';
    const userEmail = (req as any).userEmail || req.headers['x-user-email'] || req.body?.userEmail || 'anonymous@lifeflow.com';
    
    const auditData = {
      userId: userId as string,
      userEmail: userEmail as string,
      action,
      entityType,
      entityId: entityId || undefined,
      oldValues: undefined,
      newValues: req.body ? req.body : undefined,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.get('User-Agent') || 'Unknown'
    };

    await tenantClient.auditLog.create({ data: auditData });
    console.log(`✅ Audit: ${action} ${entityType} by ${auditData.userEmail}`);
  } catch (error) {
    console.error('❌ Audit logging failed:', error);
  }
}

export const createAuditLog = async (hospitalId: string, logData: AuditLogData) => {
  try {
    const tenantClient = schemaManager.getTenantClient(hospitalId);
    await tenantClient.auditLog.create({
      data: {
        userId: logData.userId,
        userEmail: logData.userEmail,
        action: logData.action,
        entityType: logData.entityType,
        entityId: logData.entityId || undefined,
        oldValues: logData.oldValues || undefined,
        newValues: logData.newValues || undefined,
        ipAddress: undefined,
        userAgent: undefined
      }
    });
  } catch (error) {
    console.error('Manual audit logging failed:', error);
  }
};