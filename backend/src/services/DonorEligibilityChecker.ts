import { Donor } from '../models/Donor';

/**
 * Strategy Pattern for Donor Eligibility Checking
 * Demonstrates: Strategy Pattern, Single Responsibility Principle, Open/Closed Principle
 */
export interface IDonorEligibilityStrategy {
  checkEligibility(donor: Donor): boolean;
  getReasons(donor: Donor): string[];
}

export class DonorEligibilityChecker {
  private strategies: IDonorEligibilityStrategy[];

  constructor(strategies?: IDonorEligibilityStrategy[]) {
    this.strategies = strategies || [
      new AgeEligibilityStrategy(),
      new WeightEligibilityStrategy(),
      new MedicalHistoryEligibilityStrategy(),
      new BloodTypeEligibilityStrategy(),
      new LastDonationEligibilityStrategy()
    ];
  }

  public checkEligibility(donor: Donor): boolean {
    return this.strategies.every(strategy => strategy.checkEligibility(donor));
  }

  public getEligibilityReasons(donor: Donor): EligibilityResult {
    const results: StrategyResult[] = [];
    let overallEligible = true;

    for (const strategy of this.strategies) {
      const isEligible = strategy.checkEligibility(donor);
      const reasons = strategy.getReasons(donor);
      
      results.push({
        strategyName: strategy.constructor.name,
        isEligible,
        reasons
      });

      if (!isEligible) {
        overallEligible = false;
      }
    }

    return {
      isEligible: overallEligible,
      strategyResults: results,
      summary: this.generateSummary(results)
    };
  }

  public addStrategy(strategy: IDonorEligibilityStrategy): void {
    this.strategies.push(strategy);
  }

  public removeStrategy(strategyType: new() => IDonorEligibilityStrategy): void {
    this.strategies = this.strategies.filter(s => !(s instanceof strategyType));
  }

  private generateSummary(results: StrategyResult[]): string {
    const failedStrategies = results.filter(r => !r.isEligible);
    
    if (failedStrategies.length === 0) {
      return 'Donor is eligible for blood donation';
    }

    const reasons = failedStrategies.flatMap(r => r.reasons);
    return `Donor is not eligible: ${reasons.join(', ')}`;
  }
}

// Concrete Strategy Implementations
class AgeEligibilityStrategy implements IDonorEligibilityStrategy {
  private static readonly MIN_AGE = 18;
  private static readonly MAX_AGE = 65;

  checkEligibility(donor: Donor): boolean {
    const age = donor.age;
    return age >= AgeEligibilityStrategy.MIN_AGE && age <= AgeEligibilityStrategy.MAX_AGE;
  }

  getReasons(donor: Donor): string[] {
    const reasons: string[] = [];
    const age = donor.age;

    if (age < AgeEligibilityStrategy.MIN_AGE) {
      reasons.push(`Age ${age} is below minimum requirement of ${AgeEligibilityStrategy.MIN_AGE}`);
    }

    if (age > AgeEligibilityStrategy.MAX_AGE) {
      reasons.push(`Age ${age} is above maximum limit of ${AgeEligibilityStrategy.MAX_AGE}`);
    }

    return reasons;
  }
}

class WeightEligibilityStrategy implements IDonorEligibilityStrategy {
  private static readonly MIN_WEIGHT = 50; // kg

  checkEligibility(donor: Donor): boolean {
    return donor.weight >= WeightEligibilityStrategy.MIN_WEIGHT;
  }

  getReasons(donor: Donor): string[] {
    const reasons: string[] = [];

    if (donor.weight < WeightEligibilityStrategy.MIN_WEIGHT) {
      reasons.push(`Weight ${donor.weight}kg is below minimum requirement of ${WeightEligibilityStrategy.MIN_WEIGHT}kg`);
    }

    return reasons;
  }
}

class MedicalHistoryEligibilityStrategy implements IDonorEligibilityStrategy {
  checkEligibility(donor: Donor): boolean {
    const medicalHistory = donor.medicalHistory;
    
    return !medicalHistory.hasChronicDisease && 
           !medicalHistory.recentMedication && 
           !medicalHistory.isPregnant;
  }

  getReasons(donor: Donor): string[] {
    const reasons: string[] = [];
    const medicalHistory = donor.medicalHistory;

    if (medicalHistory.hasChronicDisease) {
      reasons.push('Has chronic disease');
    }

    if (medicalHistory.recentMedication) {
      reasons.push('Currently taking medication');
    }

    if (medicalHistory.isPregnant) {
      reasons.push('Currently pregnant');
    }

    return reasons;
  }
}

class BloodTypeEligibilityStrategy implements IDonorEligibilityStrategy {
  private static readonly VALID_BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  checkEligibility(donor: Donor): boolean {
    return BloodTypeEligibilityStrategy.VALID_BLOOD_TYPES.includes(donor.bloodGroup);
  }

  getReasons(donor: Donor): string[] {
    const reasons: string[] = [];

    if (!BloodTypeEligibilityStrategy.VALID_BLOOD_TYPES.includes(donor.bloodGroup)) {
      reasons.push(`Invalid blood type: ${donor.bloodGroup}`);
    }

    return reasons;
  }
}

class LastDonationEligibilityStrategy implements IDonorEligibilityStrategy {
  private static readonly MIN_DAYS_BETWEEN_DONATIONS = 56;

  checkEligibility(donor: Donor): boolean {
    const lastDonationDate = donor.medicalHistory.lastDonationDate;
    
    if (!lastDonationDate) {
      return true; // First-time donor
    }

    const daysSinceLastDonation = Math.floor(
      (new Date().getTime() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceLastDonation >= LastDonationEligibilityStrategy.MIN_DAYS_BETWEEN_DONATIONS;
  }

  getReasons(donor: Donor): string[] {
    const reasons: string[] = [];
    const lastDonationDate = donor.medicalHistory.lastDonationDate;

    if (lastDonationDate) {
      const daysSinceLastDonation = Math.floor(
        (new Date().getTime() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastDonation < LastDonationEligibilityStrategy.MIN_DAYS_BETWEEN_DONATIONS) {
        const remainingDays = LastDonationEligibilityStrategy.MIN_DAYS_BETWEEN_DONATIONS - daysSinceLastDonation;
        reasons.push(`Must wait ${remainingDays} more days since last donation`);
      }
    }

    return reasons;
  }
}

// Specialized strategies for different scenarios
export class EmergencyDonationEligibilityStrategy implements IDonorEligibilityStrategy {
  private static readonly EMERGENCY_MIN_DAYS = 28; // Reduced waiting period for emergencies

  checkEligibility(donor: Donor): boolean {
    if (!donor.preferences.emergencyDonor) {
      return false;
    }

    const lastDonationDate = donor.medicalHistory.lastDonationDate;
    
    if (!lastDonationDate) {
      return true;
    }

    const daysSinceLastDonation = Math.floor(
      (new Date().getTime() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceLastDonation >= EmergencyDonationEligibilityStrategy.EMERGENCY_MIN_DAYS;
  }

  getReasons(donor: Donor): string[] {
    const reasons: string[] = [];

    if (!donor.preferences.emergencyDonor) {
      reasons.push('Not registered as emergency donor');
    }

    const lastDonationDate = donor.medicalHistory.lastDonationDate;
    if (lastDonationDate) {
      const daysSinceLastDonation = Math.floor(
        (new Date().getTime() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastDonation < EmergencyDonationEligibilityStrategy.EMERGENCY_MIN_DAYS) {
        const remainingDays = EmergencyDonationEligibilityStrategy.EMERGENCY_MIN_DAYS - daysSinceLastDonation;
        reasons.push(`Must wait ${remainingDays} more days for emergency donation`);
      }
    }

    return reasons;
  }
}

export class PlasmadonationEligibilityStrategy implements IDonorEligibilityStrategy {
  private static readonly MIN_DAYS_BETWEEN_PLASMA = 14;
  private static readonly MIN_WEIGHT_PLASMA = 55;

  checkEligibility(donor: Donor): boolean {
    if (donor.weight < PlasmadonationEligibilityStrategy.MIN_WEIGHT_PLASMA) {
      return false;
    }

    // Additional plasma-specific checks can be added here
    return true;
  }

  getReasons(donor: Donor): string[] {
    const reasons: string[] = [];

    if (donor.weight < PlasmadonationEligibilityStrategy.MIN_WEIGHT_PLASMA) {
      reasons.push(`Weight ${donor.weight}kg is below plasma donation requirement of ${PlasmadonationEligibilityStrategy.MIN_WEIGHT_PLASMA}kg`);
    }

    return reasons;
  }
}

// Type definitions
export interface EligibilityResult {
  isEligible: boolean;
  strategyResults: StrategyResult[];
  summary: string;
}

export interface StrategyResult {
  strategyName: string;
  isEligible: boolean;
  reasons: string[];
}

// Factory for creating eligibility checkers for different donation types
export class EligibilityCheckerFactory {
  public static createStandardChecker(): DonorEligibilityChecker {
    return new DonorEligibilityChecker();
  }

  public static createEmergencyChecker(): DonorEligibilityChecker {
    return new DonorEligibilityChecker([
      new AgeEligibilityStrategy(),
      new WeightEligibilityStrategy(),
      new MedicalHistoryEligibilityStrategy(),
      new BloodTypeEligibilityStrategy(),
      new EmergencyDonationEligibilityStrategy()
    ]);
  }

  public static createPlasmaChecker(): DonorEligibilityChecker {
    return new DonorEligibilityChecker([
      new AgeEligibilityStrategy(),
      new PlasmadonationEligibilityStrategy(),
      new MedicalHistoryEligibilityStrategy(),
      new BloodTypeEligibilityStrategy(),
      new LastDonationEligibilityStrategy()
    ]);
  }
}
