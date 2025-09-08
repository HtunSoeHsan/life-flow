import { v4 as uuidv4 } from 'uuid';

/**
 * Abstract Base Entity class implementing common entity behavior
 * Demonstrates: Inheritance, Abstraction, Encapsulation
 */
export abstract class BaseEntity {
  protected _id: string;
  protected _createdAt: Date;
  protected _updatedAt: Date;
  protected _isActive: boolean;

  constructor(id?: string) {
    this._id = id || uuidv4();
    this._createdAt = new Date();
    this._updatedAt = new Date();
    this._isActive = true;
  }

  // Getter methods (Encapsulation)
  public get id(): string {
    return this._id;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  // Business methods
  public markAsUpdated(): void {
    this._updatedAt = new Date();
  }

  public activate(): void {
    this._isActive = true;
    this.markAsUpdated();
  }

  public deactivate(): void {
    this._isActive = false;
    this.markAsUpdated();
  }

  // Abstract methods (Template Method Pattern)
  public abstract validate(): boolean;
  public abstract toJSON(): object;
  
  // Template method for entity operations
  public save(): boolean {
    if (!this.validate()) {
      throw new Error('Entity validation failed');
    }
    this.markAsUpdated();
    return this.performSave();
  }

  protected abstract performSave(): boolean;
}
