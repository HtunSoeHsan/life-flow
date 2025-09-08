import { Request, Response } from 'express';
import { PrismaClient } from '.prisma/tenant-client';
import { DistributionDAO } from '../dao/DistributionDAO';
import SchemaManager from '../database/schemaManager';

const schemaManager = SchemaManager.getInstance();

/**
 * DistributionController for managing blood distribution requests using DAO pattern
 */
export class DistributionController {
  private dao: DistributionDAO;

  constructor(prismaClient: PrismaClient) {
    this.dao = new DistributionDAO(prismaClient);
  }

  /**
   * Retrieve all distribution requests with filtering and pagination
   */
  public async getDistributions(req: Request, res: Response): Promise<void> {
    try {
      const { status, urgency, purpose, page = 1, limit = 10 } = req.query;
      const filters = { status: status as string, urgency: urgency as string, purpose: purpose as string };
      const options = {
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' as const }
      };

      const { distributions, total } = await this.dao.findWithFilters(filters, options);

      res.json({
        success: true,
        data: {
          distributions,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error fetching distributions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Create a new distribution request
   */
  public async createDistributionRequest(req: Request, res: Response): Promise<void> {
    try {
      const {
        bloodUnitId,
        quantity,
        purpose,
        urgency,
        requestingHospitalId,
        targetHospitalId,
        contactPerson,
        notes
      } = req.body;

      // Validate required fields
      if (!quantity || !purpose || !urgency || !targetHospitalId) {
        res.status(400).json({
          error: 'Missing required fields: quantity, purpose, urgency, targetHospitalId'
        });
        return;
      }

      // Generate unique distribution ID
      const distributionId = `DIST${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Use tenant client directly
      const tenantClient = schemaManager.getTenantClient(targetHospitalId);
      const newDistribution = await tenantClient.distribution.create({
        data: {
          distributionId,
          bloodUnitId: bloodUnitId || `UNIT${Date.now()}`,
          requestDate: new Date(),
          quantity: parseFloat(quantity),
          purpose,
          urgency,
          status: 'Requested',
          requestingHospitalId: requestingHospitalId || req.hospitalId,
          targetHospitalId,
          contactPerson,
          notes: notes || null
        }
      });

      res.status(201).json({
        success: true,
        data: newDistribution,
        message: 'Distribution request created successfully'
      });
    } catch (error) {
      console.error('Error creating distribution request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get distribution request by ID
   */
  public async getDistributionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const distribution = await this.dao.findById(id);

      if (!distribution) {
        res.status(404).json({ error: 'Distribution request not found' });
        return;
      }

      res.json({ success: true, data: distribution });
    } catch (error) {
      console.error('Error fetching distribution:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update distribution request
   */
  public async updateDistribution(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedDistribution = await this.dao.update(id, {
        ...updateData,
        updatedAt: new Date()
      });

      res.json({
        success: true,
        data: updatedDistribution,
        message: 'Distribution request updated successfully'
      });
    } catch (error) {
      console.error('Error updating distribution:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Issue blood units for a distribution request
   */
  public async issueBloodUnits(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { bloodUnitIds, issuedBy, deliveryMethod, notes } = req.body;

      // Check if distribution exists
      const distribution = await this.dao.findById(id);

      if (!distribution) {
        res.status(404).json({ error: 'Distribution request not found' });
        return;
      }

      // Update distribution status
      const updatedDistribution = await this.dao.issueDistribution(
        id,
        issuedBy || 'System',
        notes || distribution.notes
      );

      res.json({
        success: true,
        data: updatedDistribution,
        message: 'Blood units issued successfully'
      });
    } catch (error) {
      console.error('Error issuing blood units:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Cancel distribution request
   */
  public async cancelDistribution(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const cancelledDistribution = await this.dao.cancelDistribution(
        id,
        reason || 'No reason provided'
      );

      res.json({
        success: true,
        data: cancelledDistribution,
        message: 'Distribution request cancelled successfully'
      });
    } catch (error) {
      console.error('Error cancelling distribution:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get distribution statistics
   */
  public async getDistributionStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.dao.getStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching distribution stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get requests made by this hospital (stored in other hospitals' databases)
   */
  public async getMyRequests(req: Request, res: Response): Promise<void> {
    try {
      const hospitalId = req.hospitalId || req.headers['x-hospital-id'] as string;
      
      if (!hospitalId) {
        res.status(400).json({ error: 'Hospital ID required' });
        return;
      }

      // Get all hospitals from master database
      const masterClient = schemaManager.getMasterClient();
      const hospitals = await masterClient.hospital.findMany({ where: { isActive: true } });
      
      let allMyRequests: any[] = [];
      
      // Search in each hospital's database for requests made by this hospital
      for (const hospital of hospitals) {
        try {
          const tenantClient = schemaManager.getTenantClient(hospital.id);
          const requests = await tenantClient.distribution.findMany({
            where: { requestingHospitalId: hospitalId },
            orderBy: { createdAt: 'desc' }
          });
          allMyRequests = allMyRequests.concat(requests);
        } catch (error) {
          console.error(`Error fetching from hospital ${hospital.id}:`, error);
        }
      }

      res.json({
        success: true,
        data: {
          distributions: allMyRequests,
          pagination: {
            page: 1,
            limit: allMyRequests.length,
            total: allMyRequests.length,
            pages: 1
          }
        }
      });
    } catch (error) {
      console.error('Error fetching my requests:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Delete distribution request
   */
  public async deleteDistribution(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = await this.dao.delete(id);
      
      if (!deleted) {
        res.status(500).json({ error: 'Failed to delete distribution request' });
        return;
      }

      res.json({
        success: true,
        message: 'Distribution request deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting distribution:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}