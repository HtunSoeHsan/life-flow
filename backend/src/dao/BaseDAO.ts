import { PrismaClient } from '.prisma/tenant-client';

/**
 * Base Data Access Object (DAO) interface
 * Provides generic CRUD operations and common database methods
 */
export interface BaseDAO<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(options?: QueryOptions): Promise<T[]>;
  create(data: any): Promise<T>;
  update(id: ID, data: any): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
  exists(id: ID): Promise<boolean>;
  count(options?: QueryOptions): Promise<number>;
}

/**
 * Query options for filtering, sorting, and pagination
 */
export interface QueryOptions {
  where?: any;
  orderBy?: any;
  include?: any;
  skip?: number;
  take?: number;
  select?: any;
}

/**
 * Abstract base DAO implementation with common functionality
 */
export abstract class AbstractBaseDAO<T, ID> implements BaseDAO<T, ID> {
  protected prisma: any;
  protected modelName: string;

  constructor(prisma: any, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  abstract findById(id: ID): Promise<T | null>;
  abstract findAll(options?: QueryOptions): Promise<T[]>;
  abstract create(data: any): Promise<T>;
  abstract update(id: ID, data: any): Promise<T | null>;
  abstract delete(id: ID): Promise<boolean>;

  async exists(id: ID): Promise<boolean> {
    const entity = await this.findById(id);
    return entity !== null;
  }

  async count(options?: QueryOptions): Promise<number> {
    const model = (this.prisma as any)[this.modelName];
    return await model.count({
      where: options?.where
    });
  }

  /**
   * Build query options from request parameters
   */
  protected buildQueryOptions(queryParams: any): QueryOptions {
    const options: QueryOptions = {};

    // Pagination
    if (queryParams.page && queryParams.limit) {
      const page = parseInt(queryParams.page) || 1;
      const limit = parseInt(queryParams.limit) || 10;
      options.skip = (page - 1) * limit;
      options.take = limit;
    }

    // Sorting
    if (queryParams.sortBy) {
      const sortOrder = queryParams.sortOrder === 'desc' ? 'desc' : 'asc';
      options.orderBy = { [queryParams.sortBy]: sortOrder };
    } else {
      options.orderBy = { createdAt: 'desc' };
    }

    return options;
  }

  /**
   * Build where clause from filters
   */
  protected buildWhereClause(filters: Record<string, any>): any {
    const where: any = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Handle different filter types
        if (typeof value === 'string' && value.includes('*')) {
          // Wildcard search
          where[key] = {
            contains: value.replace(/\*/g, ''),
            mode: 'insensitive'
          };
        } else if (Array.isArray(value)) {
          // Array filter (in clause)
          where[key] = { in: value };
        } else {
          // Exact match
          where[key] = value;
        }
      }
    });

    return where;
  }
}
