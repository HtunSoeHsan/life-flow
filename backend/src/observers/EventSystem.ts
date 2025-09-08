/**
 * Event System implementing Observer Pattern
 * Demonstrates: Observer Pattern, Event-Driven Architecture, Loose Coupling
 */
export interface IDomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  eventData: any;
  occurredOn: Date;
  version: number;
}

export interface IEventHandler<T extends IDomainEvent> {
  handle(event: T): Promise<void>;
  canHandle(eventType: string): boolean;
}

export interface IEventPublisher {
  publish<T extends IDomainEvent>(event: T): Promise<void>;
  publishMany<T extends IDomainEvent>(events: T[]): Promise<void>;
}

export interface IEventSubscriber {
  subscribe<T extends IDomainEvent>(eventType: string, handler: IEventHandler<T>): void;
  unsubscribe(eventType: string, handler: IEventHandler<any>): void;
}

export class EventBus implements IEventPublisher, IEventSubscriber {
  private handlers: Map<string, IEventHandler<any>[]> = new Map();
  private eventStore: IDomainEvent[] = []; // Simple in-memory store

  public subscribe<T extends IDomainEvent>(eventType: string, handler: IEventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    
    const eventHandlers = this.handlers.get(eventType)!;
    if (!eventHandlers.includes(handler)) {
      eventHandlers.push(handler);
    }
  }

  public unsubscribe(eventType: string, handler: IEventHandler<any>): void {
    const eventHandlers = this.handlers.get(eventType);
    if (eventHandlers) {
      const index = eventHandlers.indexOf(handler);
      if (index > -1) {
        eventHandlers.splice(index, 1);
      }
    }
  }

  public async publish<T extends IDomainEvent>(event: T): Promise<void> {
    // Store event
    this.eventStore.push(event);

    // Notify handlers
    const eventHandlers = this.handlers.get(event.eventType) || [];
    
    const handlePromises = eventHandlers
      .filter(handler => handler.canHandle(event.eventType))
      .map(handler => this.safeHandle(handler, event));

    await Promise.allSettled(handlePromises);
  }

  public async publishMany<T extends IDomainEvent>(events: T[]): Promise<void> {
    const publishPromises = events.map(event => this.publish(event));
    await Promise.allSettled(publishPromises);
  }

  public getEventHistory(aggregateId: string): IDomainEvent[] {
    return this.eventStore.filter(event => event.aggregateId === aggregateId);
  }

  public getEventsByType(eventType: string): IDomainEvent[] {
    return this.eventStore.filter(event => event.eventType === eventType);
  }

  private async safeHandle<T extends IDomainEvent>(handler: IEventHandler<T>, event: T): Promise<void> {
    try {
      await handler.handle(event);
    } catch (error) {
      console.error(`Error handling event ${event.eventType}:`, error);
      // In production, you might want to implement retry logic or dead letter queue
    }
  }
}

// Base Event class
export abstract class BaseDomainEvent implements IDomainEvent {
  public readonly eventId: string;
  public readonly eventType: string;
  public readonly aggregateId: string;
  public readonly aggregateType: string;
  public readonly eventData: any;
  public readonly occurredOn: Date;
  public readonly version: number;

  constructor(
    aggregateId: string,
    aggregateType: string,
    eventData: any,
    version: number = 1
  ) {
    this.eventId = this.generateEventId();
    this.eventType = this.constructor.name;
    this.aggregateId = aggregateId;
    this.aggregateType = aggregateType;
    this.eventData = eventData;
    this.occurredOn = new Date();
    this.version = version;
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Donor-related Events
export class DonorRegisteredEvent extends BaseDomainEvent {
  constructor(donorId: string, donorData: any) {
    super(donorId, 'Donor', donorData);
  }
}

export class DonorEligibilityChangedEvent extends BaseDomainEvent {
  constructor(donorId: string, eligibilityData: any) {
    super(donorId, 'Donor', eligibilityData);
  }
}

export class BiometricDataEnrolledEvent extends BaseDomainEvent {
  constructor(donorId: string, biometricData: any) {
    super(donorId, 'Donor', biometricData);
  }
}

export class BiometricVerificationAttemptedEvent extends BaseDomainEvent {
  constructor(donorId: string, verificationData: any) {
    super(donorId, 'Donor', verificationData);
  }
}

// Blood Collection Events
export class BloodCollectionScheduledEvent extends BaseDomainEvent {
  constructor(collectionId: string, collectionData: any) {
    super(collectionId, 'Collection', collectionData);
  }
}

export class BloodCollectionCompletedEvent extends BaseDomainEvent {
  constructor(collectionId: string, collectionData: any) {
    super(collectionId, 'Collection', collectionData);
  }
}

// Blood Unit Events
export class BloodUnitCreatedEvent extends BaseDomainEvent {
  constructor(unitId: string, unitData: any) {
    super(unitId, 'BloodUnit', unitData);
  }
}

export class BloodUnitExpiringEvent extends BaseDomainEvent {
  constructor(unitId: string, expiryData: any) {
    super(unitId, 'BloodUnit', expiryData);
  }
}

export class BloodUnitIssuedEvent extends BaseDomainEvent {
  constructor(unitId: string, issueData: any) {
    super(unitId, 'BloodUnit', issueData);
  }
}

// Event Handlers
export class DonorEventHandler implements IEventHandler<DonorRegisteredEvent> {
  async handle(event: DonorRegisteredEvent): Promise<void> {
    console.log(`New donor registered: ${event.aggregateId}`);
    
    // Send welcome email
    await this.sendWelcomeEmail(event.eventData);
    
    // Log audit trail
    await this.logAuditTrail(event);
    
    // Update statistics
    await this.updateDonorStatistics(event.eventData);
  }

  canHandle(eventType: string): boolean {
    return eventType === 'DonorRegisteredEvent';
  }

  private async sendWelcomeEmail(donorData: any): Promise<void> {
    // Email service integration
    console.log(`Sending welcome email to: ${donorData.email}`);
  }

  private async logAuditTrail(event: DonorRegisteredEvent): Promise<void> {
    // Audit logging
    console.log(`Audit: ${event.eventType} at ${event.occurredOn}`);
  }

  private async updateDonorStatistics(donorData: any): Promise<void> {
    // Statistics update
    console.log(`Updated statistics for blood group: ${donorData.bloodGroup}`);
  }
}

export class BiometricEventHandler implements IEventHandler<BiometricDataEnrolledEvent | BiometricVerificationAttemptedEvent> {
  async handle(event: BiometricDataEnrolledEvent | BiometricVerificationAttemptedEvent): Promise<void> {
    if (event.eventType === 'BiometricDataEnrolledEvent') {
      await this.handleEnrollment(event as BiometricDataEnrolledEvent);
    } else if (event.eventType === 'BiometricVerificationAttemptedEvent') {
      await this.handleVerification(event as BiometricVerificationAttemptedEvent);
    }
  }

  canHandle(eventType: string): boolean {
    return ['BiometricDataEnrolledEvent', 'BiometricVerificationAttemptedEvent'].includes(eventType);
  }

  private async handleEnrollment(event: BiometricDataEnrolledEvent): Promise<void> {
    console.log(`Biometric data enrolled for donor: ${event.aggregateId}`);
    
    // Send confirmation notification
    await this.sendBiometricConfirmation(event.eventData);
    
    // Log security event
    await this.logSecurityEvent(event);
  }

  private async handleVerification(event: BiometricVerificationAttemptedEvent): Promise<void> {
    console.log(`Biometric verification attempted for donor: ${event.aggregateId}`);
    
    // Update verification statistics
    await this.updateVerificationStats(event.eventData);
    
    // Check for suspicious activity
    await this.checkSuspiciousActivity(event);
  }

  private async sendBiometricConfirmation(eventData: any): Promise<void> {
    console.log('Sending biometric enrollment confirmation');
  }

  private async logSecurityEvent(event: IDomainEvent): Promise<void> {
    console.log(`Security log: ${event.eventType} at ${event.occurredOn}`);
  }

  private async updateVerificationStats(eventData: any): Promise<void> {
    console.log(`Updated verification stats - Success: ${eventData.success}`);
  }

  private async checkSuspiciousActivity(event: BiometricVerificationAttemptedEvent): Promise<void> {
    const { success, confidence } = event.eventData;
    
    if (!success && confidence < 0.3) {
      console.log(`Suspicious biometric activity detected for donor: ${event.aggregateId}`);
      // Trigger security alert
    }
  }
}

export class BloodUnitEventHandler implements IEventHandler<BloodUnitExpiringEvent> {
  async handle(event: BloodUnitExpiringEvent): Promise<void> {
    console.log(`Blood unit expiring: ${event.aggregateId}`);
    
    // Send expiry alert
    await this.sendExpiryAlert(event.eventData);
    
    // Update inventory status
    await this.updateInventoryStatus(event.eventData);
    
    // Notify blood banks
    await this.notifyBloodBanks(event.eventData);
  }

  canHandle(eventType: string): boolean {
    return eventType === 'BloodUnitExpiringEvent';
  }

  private async sendExpiryAlert(eventData: any): Promise<void> {
    console.log(`Expiry alert sent for unit: ${eventData.unitId}`);
  }

  private async updateInventoryStatus(eventData: any): Promise<void> {
    console.log(`Updated inventory status for expiring unit`);
  }

  private async notifyBloodBanks(eventData: any): Promise<void> {
    console.log(`Notified blood banks about expiring ${eventData.bloodGroup} unit`);
  }
}

// Event Bus Singleton
export class EventBusManager {
  private static instance: EventBus;

  public static getInstance(): EventBus {
    if (!EventBusManager.instance) {
      EventBusManager.instance = new EventBus();
      EventBusManager.setupDefaultHandlers();
    }
    return EventBusManager.instance;
  }

  private static setupDefaultHandlers(): void {
    const eventBus = EventBusManager.instance;
    
    // Register default handlers
    eventBus.subscribe('DonorRegisteredEvent', new DonorEventHandler());
    eventBus.subscribe('BiometricDataEnrolledEvent', new BiometricEventHandler());
    eventBus.subscribe('BiometricVerificationAttemptedEvent', new BiometricEventHandler());
    eventBus.subscribe('BloodUnitExpiringEvent', new BloodUnitEventHandler());
  }
}

// Decorators for automatic event publishing
export function PublishEvent<T extends IDomainEvent>(eventFactory: (...args: any[]) => T) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      
      // Create and publish event
      const event = eventFactory.apply(this, args);
      const eventBus = EventBusManager.getInstance();
      await eventBus.publish(event);
      
      return result;
    };
    
    return descriptor;
  };
}
