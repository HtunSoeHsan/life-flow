import { Request, Response } from 'express';
import { PrismaClient } from '.prisma/tenant-client';

/**
 * BloodInventoryController for managing blood inventory
 */
export class BloodInventoryController {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  /**
   * Get blood inventory summary
   */
  public async getInventorySummary(req: Request, res: Response): Promise<void> {
    try {
      // Check if BloodUnit table exists
      const tableExists = await this.checkTableExists('BloodUnit');
      if (!tableExists) {
        res.status(404).json({ 
          error: 'BloodUnit table not found. Please run database migrations first.' 
        });
        return;
      }

      const bloodUnits = await this.prisma.bloodUnit.findMany({
        where: { status: { in: ['Available', 'Reserved'] } }
      });

      const summary = bloodUnits.reduce((acc: any, unit) => {
        const group = unit.bloodGroup;
        if (!acc[group]) {
          acc[group] = {
            bloodType: group,
            total: 0,
            available: 0,
            reserved: 0,
            expiring: 0
          };
        }
        
        acc[group].total++;
        if (unit.status === 'Available') acc[group].available++;
        if (unit.status === 'Reserved') acc[group].reserved++;
        
        // Check if expiring within 7 days
        const expiryDate = new Date(unit.expiryDate);
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        
        if (expiryDate <= sevenDaysFromNow) {
          acc[group].expiring++;
        }
        
        return acc;
      }, {});

      const inventoryData = Object.values(summary);

      res.json({
        success: true,
        data: inventoryData,
        summary: {
          totalUnits: bloodUnits.length,
          availableUnits: bloodUnits.filter(u => u.status === 'Available').length,
          reservedUnits: bloodUnits.filter(u => u.status === 'Reserved').length,
          expiringUnits: bloodUnits.filter(u => {
            const expiryDate = new Date(u.expiryDate);
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
            return expiryDate <= sevenDaysFromNow;
          }).length
        }
      });
    } catch (error) {
      console.error('Error fetching inventory summary:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get all blood units with filtering
   */
  public async getBloodUnits(req: Request, res: Response): Promise<void> {
    try {
      // Check if BloodUnit table exists
      const tableExists = await this.checkTableExists('BloodUnit');
      if (!tableExists) {
        res.status(404).json({ 
          error: 'BloodUnit table not found. Please run database migrations first.' 
        });
        return;
      }

      const { bloodGroup, status, component, page = 1, limit = 10 } = req.query;
      
      const where: any = {};
      if (bloodGroup) where.bloodGroup = bloodGroup;
      if (status) where.status = status;
      if (component) where.component = component;

      const [bloodUnits, total] = await Promise.all([
        this.prisma.bloodUnit.findMany({
          where,
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            donor: {
              select: {
                firstName: true,
                lastName: true,
                donorId: true
              }
            }
          }
        }),
        this.prisma.bloodUnit.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          bloodUnits,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error fetching blood units:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Create new blood unit
   */
  public async createBloodUnit(req: Request, res: Response): Promise<void> {
    try {
      // Check if BloodUnit table exists
      const tableExists = await this.checkTableExists('BloodUnit');
      if (!tableExists) {
        res.status(404).json({ 
          error: 'BloodUnit table not found. Please run database migrations first.' 
        });
        return;
      }

      const {
        donorId,
        bloodGroup,
        component,
        volume,
        collectionDate,
        location,
        batchNumber
      } = req.body;

      // Calculate expiry date based on component
      const expiryDate = new Date(collectionDate);
      switch (component) {
        case 'Whole Blood':
          expiryDate.setDate(expiryDate.getDate() + 35);
          break;
        case 'Red Blood Cells':
          expiryDate.setDate(expiryDate.getDate() + 42);
          break;
        case 'Plasma':
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          break;
        case 'Platelets':
          expiryDate.setDate(expiryDate.getDate() + 5);
          break;
        default:
          expiryDate.setDate(expiryDate.getDate() + 35);
      }

      const bloodUnit = await this.prisma.bloodUnit.create({
        data: {
          unitId: `BU${Date.now()}`,
          donorId,
          bloodGroup,
          component,
          volume: parseFloat(volume),
          collectionDate: new Date(collectionDate),
          expiryDate,
          location,
          batchNumber,
          status: 'Quarantine',
          temperature: 4.0,
          testResults: {},
          crossMatchStatus: 'Pending',
          quarantineStatus: 'In Quarantine'
        }
      });

      res.status(201).json({
        success: true,
        data: bloodUnit,
        message: 'Blood unit created successfully'
      });
    } catch (error) {
      console.error('Error creating blood unit:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update blood unit status
   */
  public async updateBloodUnitStatus(req: Request, res: Response): Promise<void> {
    try {
      // Check if BloodUnit table exists
      const tableExists = await this.checkTableExists('BloodUnit');
      if (!tableExists) {
        res.status(404).json({ 
          error: 'BloodUnit table not found. Please run database migrations first.' 
        });
        return;
      }

      const { id } = req.params;
      const { status, notes } = req.body;

      const bloodUnit = await this.prisma.bloodUnit.update({
        where: { id },
        data: {
          status,
          notes,
          updatedAt: new Date()
        }
      });

      res.json({
        success: true,
        data: bloodUnit,
        message: 'Blood unit status updated successfully'
      });
    } catch (error) {
      console.error('Error updating blood unit status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Check if table exists
   */
  private async checkTableExists(tableName: string): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1 FROM "blood_units" LIMIT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get expiring blood units
   */
  public async getExpiringUnits(req: Request, res: Response): Promise<void> {
    try {
      // Check if BloodUnit table exists
      const tableExists = await this.checkTableExists('BloodUnit');
      if (!tableExists) {
        res.status(404).json({ 
          error: 'BloodUnit table not found. Please run database migrations first.' 
        });
        return;
      }

      const { days = 7 } = req.query;
      const expiryThreshold = new Date();
      expiryThreshold.setDate(expiryThreshold.getDate() + Number(days));

      const expiringUnits = await this.prisma.bloodUnit.findMany({
        where: {
          expiryDate: { lte: expiryThreshold },
          status: { in: ['Available', 'Reserved'] }
        },
        orderBy: { expiryDate: 'asc' },
        include: {
          donor: {
            select: {
              firstName: true,
              lastName: true,
              donorId: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: expiringUnits,
        count: expiringUnits.length
      });
    } catch (error) {
      console.error('Error fetching expiring units:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}