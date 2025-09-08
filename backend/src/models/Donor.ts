import { BaseEntity } from './BaseEntity';
import { BiometricData } from './BiometricData';
import { DonorEligibilityChecker } from '../services/DonorEligibilityChecker';

/**
 * Donor Entity implementing business logic and validation
 * Demonstrates: Inheritance, Composition, Single Responsibility Principle
 */
export class Donor extends BaseEntity {
  private _tenantId: string;
  private _donorId: string;
  private _firstName: string;
  private _lastName: string;
  private _email: string;
  private _phone: string;
  private _dateOfBirth: Date;
  private _gender: 'Male' | 'Female' | 'Other';
  private _bloodGroup: string;
  private _weight: number;
  private _address: string;
  private _occupation: string;
  private _emergencyContact: string;
  private _medicalHistory: MedicalHistory;
  private _preferences: DonorPreferences;
  private _biometricData?: BiometricData;
  private _isEligible: boolean;
  private _eligibilityChecker: DonorEligibilityChecker;

  constructor(data: DonorConstructorData) {
    super(data.id);
    
    this._tenantId = data.tenantId;
    this._donorId = data.donorId || this.generateDonorId();
    this._firstName = data.firstName;
    this._lastName = data.lastName;
    this._email = data.email;
    this._phone = data.phone;
    this._dateOfBirth = new Date(data.dateOfBirth);
    this._gender = data.gender;
    this._bloodGroup = data.bloodGroup;
    this._weight = data.weight;
    this._address = data.address;
    this._occupation = data.occupation;
    this._emergencyContact = data.emergencyContact;
    
    // Composition - Complex objects
    this._medicalHistory = new MedicalHistory(data.medicalHistory);
    this._preferences = new DonorPreferences(data.preferences);
    
    if (data.biometricData) {
      this._biometricData = new BiometricData(data.biometricData);
    }
    
    // Strategy Pattern - Eligibility checking
    this._eligibilityChecker = new DonorEligibilityChecker();
    this._isEligible = this._eligibilityChecker.checkEligibility(this);
  }

  // Getters (Encapsulation)
  public get tenantId(): string { return this._tenantId; }
  public get donorId(): string { return this._donorId; }
  public get firstName(): string { return this._firstName; }
  public get lastName(): string { return this._lastName; }
  public get fullName(): string { return `${this._firstName} ${this._lastName}`; }
  public get email(): string { return this._email; }
  public get phone(): string { return this._phone; }
  public get dateOfBirth(): Date { return this._dateOfBirth; }
  public get age(): number {
    const today = new Date();
    const birthDate = new Date(this._dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  public get gender(): string { return this._gender; }
  public get bloodGroup(): string { return this._bloodGroup; }
  public get weight(): number { return this._weight; }
  public get address(): string { return this._address; }
  public get occupation(): string { return this._occupation; }
  public get emergencyContact(): string { return this._emergencyContact; }
  public get medicalHistory(): MedicalHistory { return this._medicalHistory; }
  public get preferences(): DonorPreferences { return this._preferences; }
  public get biometricData(): BiometricData | undefined { return this._biometricData; }
  public get isEligible(): boolean { return this._isEligible; }

  // Business methods
  public updateContactInfo(email: string, phone: string, address: string): void {
    this._email = email;
    this._phone = phone;
    this._address = address;
    this.markAsUpdated();
  }

  public updateWeight(newWeight: number): void {
    if (newWeight < 45 || newWeight > 200) {
      throw new Error('Weight must be between 45-200 kg');
    }
    this._weight = newWeight;
    this._isEligible = this._eligibilityChecker.checkEligibility(this);
    this.markAsUpdated();
  }

  public setBiometricData(biometricData: BiometricData): void {
    this._biometricData = biometricData;
    this.markAsUpdated();
  }

  public updateMedicalHistory(medicalHistory: Partial<MedicalHistoryData>): void {
    this._medicalHistory.update(medicalHistory);
    this._isEligible = this._eligibilityChecker.checkEligibility(this);
    this.markAsUpdated();
  }

  public canDonate(): boolean {
    return this._isEligible && this.isActive && this._medicalHistory.canDonate();
  }

  // Implementation of abstract methods
  public validate(): boolean {
    if (!this._firstName || !this._lastName) return false;
    if (!this._email || !this.isValidEmail(this._email)) return false;
    if (!this._phone || this._phone.length < 10) return false;
    if (this.age < 18 || this.age > 65) return false;
    if (this._weight < 45) return false;
    if (!['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(this._bloodGroup)) return false;
    
    return true;
  }

  public toJSON(): object {
    return {
      id: this.id,
      tenantId: this._tenantId,
      donorId: this._donorId,
      firstName: this._firstName,
      lastName: this._lastName,
      fullName: this.fullName,
      email: this._email,
      phone: this._phone,
      dateOfBirth: this._dateOfBirth,
      age: this.age,
      gender: this._gender,
      bloodGroup: this._bloodGroup,
      weight: this._weight,
      address: this._address,
      occupation: this._occupation,
      emergencyContact: this._emergencyContact,
      medicalHistory: this._medicalHistory.toJSON(),
      preferences: this._preferences.toJSON(),
      biometricData: this._biometricData?.toJSON(),
      isEligible: this._isEligible,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  protected performSave(): boolean {
    // This would typically interact with repository
    // Implementation delegated to repository pattern
    return true;
  }

  private generateDonorId(): string {
    const timestamp = Date.now().toString();
    return `D${timestamp}`;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Supporting classes demonstrating composition
export class MedicalHistory {
  private _hasChronicDisease: boolean;
  private _chronicDiseaseDetails?: string;
  private _recentMedication: boolean;
  private _medicationDetails?: string;
  private _isPregnant: boolean;
  private _lastDonationDate?: Date;
  private _allergies: string[];
  private _surgeries: string[];

  constructor(data: MedicalHistoryData) {
    this._hasChronicDisease = data.hasChronicDisease || false;
    this._chronicDiseaseDetails = data.chronicDiseaseDetails;
    this._recentMedication = data.recentMedication || false;
    this._medicationDetails = data.medicationDetails;
    this._isPregnant = data.isPregnant || false;
    this._lastDonationDate = data.lastDonationDate ? new Date(data.lastDonationDate) : undefined;
    this._allergies = data.allergies || [];
    this._surgeries = data.surgeries || [];
  }

  // Getters
  public get hasChronicDisease(): boolean { return this._hasChronicDisease; }
  public get chronicDiseaseDetails(): string | undefined { return this._chronicDiseaseDetails; }
  public get recentMedication(): boolean { return this._recentMedication; }
  public get medicationDetails(): string | undefined { return this._medicationDetails; }
  public get isPregnant(): boolean { return this._isPregnant; }
  public get lastDonationDate(): Date | undefined { return this._lastDonationDate; }
  public get allergies(): string[] { return [...this._allergies]; }
  public get surgeries(): string[] { return [...this._surgeries]; }

  public canDonate(): boolean {
    if (this._hasChronicDisease) return false;
    if (this._recentMedication) return false;
    if (this._isPregnant) return false;
    
    // Check last donation date (minimum 56 days between donations)
    if (this._lastDonationDate) {
      const daysSinceLastDonation = Math.floor(
        (new Date().getTime() - this._lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceLastDonation >= 56;
    }
    
    return true;
  }

  public update(data: Partial<MedicalHistoryData>): void {
    if (data.hasChronicDisease !== undefined) this._hasChronicDisease = data.hasChronicDisease;
    if (data.chronicDiseaseDetails !== undefined) this._chronicDiseaseDetails = data.chronicDiseaseDetails;
    if (data.recentMedication !== undefined) this._recentMedication = data.recentMedication;
    if (data.medicationDetails !== undefined) this._medicationDetails = data.medicationDetails;
    if (data.isPregnant !== undefined) this._isPregnant = data.isPregnant;
    if (data.lastDonationDate !== undefined) {
      this._lastDonationDate = data.lastDonationDate ? new Date(data.lastDonationDate) : undefined;
    }
    if (data.allergies !== undefined) this._allergies = [...data.allergies];
    if (data.surgeries !== undefined) this._surgeries = [...data.surgeries];
  }

  public toJSON(): object {
    return {
      hasChronicDisease: this._hasChronicDisease,
      chronicDiseaseDetails: this._chronicDiseaseDetails,
      recentMedication: this._recentMedication,
      medicationDetails: this._medicationDetails,
      isPregnant: this._isPregnant,
      lastDonationDate: this._lastDonationDate,
      allergies: this._allergies,
      surgeries: this._surgeries
    };
  }
}

export class DonorPreferences {
  private _preferredDonationTime: 'morning' | 'afternoon' | 'evening' | 'anytime';
  private _notifications: boolean;
  private _emergencyDonor: boolean;
  private _consent: boolean;
  private _communicationLanguage: string;
  private _preferredLocation: string;

  constructor(data: DonorPreferencesData) {
    this._preferredDonationTime = data.preferredDonationTime || 'anytime';
    this._notifications = data.notifications !== false;
    this._emergencyDonor = data.emergencyDonor || false;
    this._consent = data.consent || false;
    this._communicationLanguage = data.communicationLanguage || 'en';
    this._preferredLocation = data.preferredLocation || '';
  }

  // Getters
  public get preferredDonationTime(): string { return this._preferredDonationTime; }
  public get notifications(): boolean { return this._notifications; }
  public get emergencyDonor(): boolean { return this._emergencyDonor; }
  public get consent(): boolean { return this._consent; }
  public get communicationLanguage(): string { return this._communicationLanguage; }
  public get preferredLocation(): string { return this._preferredLocation; }

  public updatePreferences(data: Partial<DonorPreferencesData>): void {
    if (data.preferredDonationTime !== undefined) this._preferredDonationTime = data.preferredDonationTime;
    if (data.notifications !== undefined) this._notifications = data.notifications;
    if (data.emergencyDonor !== undefined) this._emergencyDonor = data.emergencyDonor;
    if (data.consent !== undefined) this._consent = data.consent;
    if (data.communicationLanguage !== undefined) this._communicationLanguage = data.communicationLanguage;
    if (data.preferredLocation !== undefined) this._preferredLocation = data.preferredLocation;
  }

  public toJSON(): object {
    return {
      preferredDonationTime: this._preferredDonationTime,
      notifications: this._notifications,
      emergencyDonor: this._emergencyDonor,
      consent: this._consent,
      communicationLanguage: this._communicationLanguage,
      preferredLocation: this._preferredLocation
    };
  }
}

// Type definitions
export interface DonorConstructorData {
  id?: string;
  tenantId: string;
  donorId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string | Date;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  weight: number;
  address: string;
  occupation: string;
  emergencyContact: string;
  medicalHistory: MedicalHistoryData;
  preferences: DonorPreferencesData;
  biometricData?: any;
}

export interface MedicalHistoryData {
  hasChronicDisease?: boolean;
  chronicDiseaseDetails?: string;
  recentMedication?: boolean;
  medicationDetails?: string;
  isPregnant?: boolean;
  lastDonationDate?: string | Date;
  allergies?: string[];
  surgeries?: string[];
}

export interface DonorPreferencesData {
  preferredDonationTime?: 'morning' | 'afternoon' | 'evening' | 'anytime';
  notifications?: boolean;
  emergencyDonor?: boolean;
  consent?: boolean;
  communicationLanguage?: string;
  preferredLocation?: string;
}
