import { Request, Response } from 'express';
import { PrismaClient } from '.prisma/tenant-client';
import { DistributionDAO } from '../dao/DistributionDAO';

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
        hospitalId,
        contactPerson,
        notes
      } = req.body;

      // Validate required fields
      if (!quantity || !purpose || !urgency) {
        res.status(400).json({
          error: 'Missing required fields: quantity, purpose, urgency'
        });
        return;
      }

      // Generate unique distribution ID
      const distributionId = `DIST${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      const newDistribution = await this.dao.create({
        distributionId,
        bloodUnitId: bloodUnitId || `UNIT${Date.now()}`,
        requestDate: new Date(),
        quantity: parseFloat(quantity),
        purpose,
        urgency,
        status: 'Requested',
        notes
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