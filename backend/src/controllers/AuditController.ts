import { Request, Response } from 'express';
import SchemaManager from '../database/schemaManager';

const schemaManager = SchemaManager.getInstance();

export class AuditController {
  /**
   * Get audit logs with filtering and pagination
   */
  public async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const hospitalId = req.hospitalId || req.headers['x-hospital-id'] as string;
      if (!hospitalId) {
        res.status(400).json({ error: 'Hospital ID required' });
        return;
      }

      const { 
        userId, 
        action, 
        entityType, 
        startDate, 
        endDate, 
        page = 1, 
        limit = 50 
      } = req.query;

      const tenantClient = schemaManager.getTenantClient(hospitalId);
      
      const where: any = {};
      if (userId) where.userId = userId;
      if (action) where.action = { contains: action as string, mode: 'insensitive' };
      if (entityType) where.entityType = entityType;
      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp.gte = new Date(startDate as string);
        if (endDate) where.timestamp.lte = new Date(endDate as string);
      }

      const [auditLogs, total] = await Promise.all([
        tenantClient.auditLog.findMany({
          where,
          orderBy: { timestamp: 'desc' },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit)
        }),
        tenantClient.auditLog.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          auditLogs,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get audit statistics
   */
  public async getAuditStats(req: Request, res: Response): Promise<void> {
    try {
      const hospitalId = req.hospitalId || req.headers['x-hospital-id'] as string;
      if (!hospitalId) {
        res.status(400).json({ error: 'Hospital ID required' });
        return;
      }

      const tenantClient = schemaManager.getTenantClient(hospitalId);
      
      const [
        totalLogs,
        todayLogs,
        topActions,
        topUsers
      ] = await Promise.all([
        tenantClient.auditLog.count(),
        tenantClient.auditLog.count({
          where: {
            timestamp: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        tenantClient.auditLog.groupBy({
          by: ['action'],
          _count: { action: true },
          orderBy: { _count: { action: 'desc' } },
          take: 5
        }),
        tenantClient.auditLog.groupBy({
          by: ['userEmail'],
          _count: { userEmail: true },
          orderBy: { _count: { userEmail: 'desc' } },
          take: 5
        })
      ]);

      res.json({
        success: true,
        data: {
          totalLogs,
          todayLogs,
          topActions: topActions.map(item => ({
            action: item.action,
            count: item._count.action
          })),
          topUsers: topUsers.map(item => ({
            userEmail: item.userEmail,
            count: item._count.userEmail
          }))
        }
      });
    } catch (error) {
      console.error('Error fetching audit stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}