import { PrismaClient, Distribution } from '.prisma/tenant-client';
import { AbstractBaseDAO, QueryOptions } from './BaseDAO';

/**
 * Interface for distribution statistics
 */
export interface DistributionStats {
  total: number;
  pending: number;
  emergency: number;
  completed: number;
}

/**
 * Data Access Object for Distribution entity
 */
export class DistributionDAO extends AbstractBaseDAO<Distribution, string> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'distribution');
  }

  public async findById(id: string): Promise<Distribution | null> {
    return await (this.prisma as any).distribution.findUnique({ where: { id } });
  }

  public async findAll(options?: QueryOptions): Promise<Distribution[]> {
    return await (this.prisma as any).distribution.findMany(options);
  }

  public async create(data: any): Promise<Distribution> {
    return await (this.prisma as any).distribution.create({ data });
  }

  public async update(id: string, data: any): Promise<Distribution | null> {
    return await (this.prisma as any).distribution.update({ where: { id }, data });
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await (this.prisma as any).distribution.delete({ where: { id } });
      return true;
    } catch (error) {
      console.error('Error deleting distribution:', error);
      return false;
    }
  }

  /**
   * Find distributions by status
   */
  public async findByStatus(status: string): Promise<Distribution[]> {
    return await (this.prisma as any).distribution.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Find distributions by urgency
   */
  public async findByUrgency(urgency: string): Promise<Distribution[]> {
    return await (this.prisma as any).distribution.findMany({
      where: { urgency },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Find distributions with filters and pagination
   */
  public async findWithFilters(
    filters: { status?: string; urgency?: string; purpose?: string },
    options?: QueryOptions
  ): Promise<{ distributions: Distribution[], total: number }> {
    const where = this.buildWhereClause(filters);
    
    const [distributions, total] = await Promise.all([
      (this.prisma as any).distribution.findMany({
        where,
        ...options
      }),
      (this.prisma as any).distribution.count({ where })
    ]);

    return { distributions, total };
  }

  /**
   * Get distribution statistics
   */
  public async getStats(): Promise<DistributionStats> {
    const [total, pending, emergency, completed] = await Promise.all([
      this.count(),
      this.count({ where: { status: 'Requested' } }),
      this.count({ where: { urgency: 'Emergency' } }),
      this.count({ where: { status: 'Issued' } })
    ]);

    return { total, pending, emergency, completed };
  }

  /**
   * Find overdue distributions (past required date and still pending)
   */
  public async findOverdue(): Promise<Distribution[]> {
    return await (this.prisma as any).distribution.findMany({
      where: {
        status: { in: ['Requested', 'Approved'] },
        // Note: Need to add requiredDate field to Distribution model for this to work
        // requiredDate: { lt: new Date() }
      },
      orderBy: { requestDate: 'asc' }
    });
  }

  /**
   * Find distributions for a specific blood unit
   */
  public async findByBloodUnitId(bloodUnitId: string): Promise<Distribution[]> {
    return await (this.prisma as any).distribution.findMany({
      where: { bloodUnitId },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Update distribution status
   */
  public async updateStatus(id: string, status: string, notes?: string): Promise<Distribution | null> {
    return await this.update(id, {
      status,
      notes,
      updatedAt: new Date()
    });
  }

  /**
   * Issue distribution (update status and issue date)
   */
  public async issueDistribution(id: string, approvedBy: string, notes?: string): Promise<Distribution | null> {
    return await this.update(id, {
      status: 'Issued',
      issueDate: new Date(),
      approvedBy,
      notes,
      updatedAt: new Date()
    });
  }

  /**
   * Cancel distribution with reason
   */
  public async cancelDistribution(id: string, reason: string): Promise<Distribution | null> {
    return await this.update(id, {
      status: 'Cancelled',
      notes: `Cancelled: ${reason}`,
      updatedAt: new Date()
    });
  }
}
