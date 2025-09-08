/**
 * Generic Repository Interface
 * Demonstrates: Repository Pattern, Generic Programming, Abstraction
 */
export interface IRepository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(options?: QueryOptions): Promise<T[]>;
  create(entity: T): Promise<T>;
  update(id: ID, entity: Partial<T>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
  exists(id: ID): Promise<boolean>;
  count(options?: QueryOptions): Promise<number>;
}

/**
 * Specification Pattern for complex queries
 * Demonstrates: Specification Pattern, Query Object Pattern
 */
export interface ISpecification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: ISpecification<T>): ISpecification<T>;
  or(other: ISpecification<T>): ISpecification<T>;
  not(): ISpecification<T>;
  toQuery(): any; // Database-specific query representation
}

export abstract class BaseSpecification<T> implements ISpecification<T> {
  abstract isSatisfiedBy(candidate: T): boolean;
  abstract toQuery(): any;

  and(other: ISpecification<T>): ISpecification<T> {
    return new AndSpecification(this, other);
  }

  or(other: ISpecification<T>): ISpecification<T> {
    return new OrSpecification(this, other);
  }

  not(): ISpecification<T> {
    return new NotSpecification(this);
  }
}

class AndSpecification<T> extends BaseSpecification<T> {
  constructor(
    private left: ISpecification<T>,
    private right: ISpecification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
  }

  toQuery(): any {
    return {
      AND: [this.left.toQuery(), this.right.toQuery()]
    };
  }
}

class OrSpecification<T> extends BaseSpecification<T> {
  constructor(
    private left: ISpecification<T>,
    private right: ISpecification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
  }

  toQuery(): any {
    return {
      OR: [this.left.toQuery(), this.right.toQuery()]
    };
  }
}

class NotSpecification<T> extends BaseSpecification<T> {
  constructor(private spec: ISpecification<T>) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return !this.spec.isSatisfiedBy(candidate);
  }

  toQuery(): any {
    return {
      NOT: this.spec.toQuery()
    };
  }
}

// Query options for filtering, sorting, and pagination
export interface QueryOptions {
  where?: any;
  orderBy?: any;
  include?: any;
  skip?: number;
  take?: number;
}

// Unit of Work pattern for transaction management
export interface IUnitOfWork {
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  isActive(): boolean;
}
