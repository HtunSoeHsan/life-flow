import { PrismaClient, Collection } from '.prisma/tenant-client';
import { AbstractBaseDAO, QueryOptions } from './BaseDAO';

/**
 * Data Access Object for Collection entity
 */
export class CollectionDAO extends AbstractBaseDAO<Collection, string> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'collection');
  }

  public async findById(id: string): Promise<Collection | null> {
    return await (this.prisma as any).collection.findUnique({ where: { id } });
  }

  public async findAll(options?: QueryOptions): Promise<Collection[]> {
    return await (this.prisma as any).collection.findMany(options);
  }

  public async create(data: any): Promise<Collection> {
    return await (this.prisma as any).collection.create({ data });
  }

  public async update(id: string, data: any): Promise<Collection | null> {
    return await (this.prisma as any).collection.update({ where: { id }, data });
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await (this.prisma as any).collection.delete({ where: { id } });
      return true;
    } catch (error) {
      console.error('Error deleting collection:', error);
      return false;
    }
  }
}

