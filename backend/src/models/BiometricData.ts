import crypto from 'crypto';

/**
 * BiometricData class handling fingerprint data with security measures
 * Demonstrates: Encapsulation, Security Patterns, Data Protection
 */
export class BiometricData {
  private _fingerprintHash!: string;
  private _fingerprintTemplate!: Buffer;
  private _confidence: number;
  private _enrollmentDate: Date;
  private _verificationCount: number;
  private _lastVerificationDate?: Date;
  private _isVerified: boolean;
  private _algorithm: string;

  constructor(data: BiometricDataInput) {
    this._confidence = data.confidence || 0;
    this._enrollmentDate = new Date();
    this._verificationCount = 0;
    this._isVerified = false;
    this._algorithm = 'SHA-256';

    if (data.rawFingerprintData) {
      this.processRawFingerprint(data.rawFingerprintData);
    } else if (data.fingerprintHash && data.fingerprintTemplate) {
      this._fingerprintHash = data.fingerprintHash;
      this._fingerprintTemplate = Buffer.from(data.fingerprintTemplate);
      this._isVerified = true;
    } else {
      throw new Error('Invalid biometric data provided');
    }
  }

  // Getters (Controlled access to sensitive data)
  public get fingerprintHash(): string {
    return this._fingerprintHash;
  }

  public get confidence(): number {
    return this._confidence;
  }

  public get enrollmentDate(): Date {
    return this._enrollmentDate;
  }

  public get verificationCount(): number {
    return this._verificationCount;
  }

  public get lastVerificationDate(): Date | undefined {
    return this._lastVerificationDate;
  }

  public get isVerified(): boolean {
    return this._isVerified;
  }

  public get algorithm(): string {
    return this._algorithm;
  }

  // Business methods
  public verifyFingerprint(inputFingerprintData: string, threshold: number = 0.8): boolean {
    const inputHash = this.hashFingerprint(inputFingerprintData);
    const isMatch = this.compareHashes(inputHash, this._fingerprintHash);
    
    if (isMatch && this._confidence >= threshold) {
      this.recordVerification();
      return true;
    }
    
    return false;
  }

  public updateConfidence(newConfidence: number): void {
    if (newConfidence < 0 || newConfidence > 1) {
      throw new Error('Confidence must be between 0 and 1');
    }
    this._confidence = newConfidence;
  }

  public getTemplate(): Buffer {
    // In production, this should be encrypted/protected
    return Buffer.from(this._fingerprintTemplate);
  }

  public isExpired(expirationDays: number = 365): boolean {
    const expirationDate = new Date(this._enrollmentDate);
    expirationDate.setDate(expirationDate.getDate() + expirationDays);
    return new Date() > expirationDate;
  }

  public toJSON(): object {
    return {
      fingerprintHash: this._fingerprintHash,
      confidence: this._confidence,
      enrollmentDate: this._enrollmentDate,
      verificationCount: this._verificationCount,
      lastVerificationDate: this._lastVerificationDate,
      isVerified: this._isVerified,
      algorithm: this._algorithm,
      isExpired: this.isExpired()
    };
  }

  // Private methods for internal processing
  private processRawFingerprint(rawData: string): void {
    this._fingerprintHash = this.hashFingerprint(rawData);
    this._fingerprintTemplate = this.generateTemplate(rawData);
    this._isVerified = true;
  }

  private hashFingerprint(fingerprintData: string): string {
    return crypto
      .createHash('sha256')
      .update(fingerprintData + process.env.BIOMETRIC_SALT || 'default-salt')
      .digest('hex');
  }

  private generateTemplate(rawData: string): Buffer {
    // Simplified template generation - in production use proper biometric SDK
    const hash = crypto.createHash('sha256').update(rawData).digest();
    
    // Add some randomization to template while maintaining consistency
    const template = Buffer.alloc(64);
    hash.copy(template, 0);
    
    // Fill remaining bytes with deterministic pattern
    for (let i = 32; i < 64; i++) {
      template[i] = hash[i % 32] ^ (i * 7);
    }
    
    return template;
  }

  private compareHashes(hash1: string, hash2: string): boolean {
    // Constant-time comparison to prevent timing attacks
    if (hash1.length !== hash2.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < hash1.length; i++) {
      result |= hash1.charCodeAt(i) ^ hash2.charCodeAt(i);
    }
    
    return result === 0;
  }

  private recordVerification(): void {
    this._verificationCount++;
    this._lastVerificationDate = new Date();
  }
}

// Biometric matcher interface for different algorithms
export interface IBiometricMatcher {
  match(template1: Buffer, template2: Buffer): number;
  generateTemplate(rawData: string): Buffer;
}

// Factory for creating biometric matchers
export class BiometricMatcherFactory {
  public static createMatcher(algorithm: string): IBiometricMatcher {
    switch (algorithm.toLowerCase()) {
      case 'minutiae':
        return new MinutiaeBasedMatcher();
      case 'pattern':
        return new PatternBasedMatcher();
      default:
        return new DefaultBiometricMatcher();
    }
  }
}

// Concrete implementations of biometric matchers
class DefaultBiometricMatcher implements IBiometricMatcher {
  match(template1: Buffer, template2: Buffer): number {
    if (template1.length !== template2.length) {
      return 0;
    }
    
    let matchingBytes = 0;
    for (let i = 0; i < template1.length; i++) {
      if (template1[i] === template2[i]) {
        matchingBytes++;
      }
    }
    
    return matchingBytes / template1.length;
  }

  generateTemplate(rawData: string): Buffer {
    return crypto.createHash('sha256').update(rawData).digest();
  }
}

class MinutiaeBasedMatcher implements IBiometricMatcher {
  match(template1: Buffer, template2: Buffer): number {
    // Simplified minutiae-based matching logic
    return this.calculateMinutiaeScore(template1, template2);
  }

  generateTemplate(rawData: string): Buffer {
    // Generate minutiae-based template
    return this.extractMinutiae(rawData);
  }

  private calculateMinutiaeScore(template1: Buffer, template2: Buffer): number {
    // Simplified minutiae matching algorithm
    let score = 0;
    const minLength = Math.min(template1.length, template2.length);
    
    for (let i = 0; i < minLength; i += 4) {
      const point1 = template1.readUInt32BE(i);
      const point2 = template2.readUInt32BE(i);
      
      // Simple distance calculation
      const distance = Math.abs(point1 - point2);
      if (distance < 1000) { // Threshold
        score += (1000 - distance) / 1000;
      }
    }
    
    return score / (minLength / 4);
  }

  private extractMinutiae(rawData: string): Buffer {
    // Simplified minutiae extraction
    const buffer = Buffer.alloc(64);
    const hash = crypto.createHash('sha256').update(rawData).digest();
    
    // Convert hash to minutiae points
    for (let i = 0; i < 16; i++) {
      const offset = i * 4;
      buffer.writeUInt32BE(hash.readUInt32BE(i * 2) % 65536, offset);
    }
    
    return buffer;
  }
}

class PatternBasedMatcher implements IBiometricMatcher {
  match(template1: Buffer, template2: Buffer): number {
    // Pattern-based matching using correlation
    return this.calculateCorrelation(template1, template2);
  }

  generateTemplate(rawData: string): Buffer {
    // Generate pattern-based template
    return this.extractPatterns(rawData);
  }

  private calculateCorrelation(template1: Buffer, template2: Buffer): number {
    let correlation = 0;
    const length = Math.min(template1.length, template2.length);
    
    for (let i = 0; i < length; i++) {
      correlation += (template1[i] * template2[i]) / 255;
    }
    
    return correlation / length;
  }

  private extractPatterns(rawData: string): Buffer {
    // Extract ridge patterns and orientations
    const buffer = Buffer.alloc(128);
    const hash = crypto.createHash('sha512').update(rawData).digest();
    
    hash.copy(buffer);
    return buffer;
  }
}

// Type definitions
export interface BiometricDataInput {
  rawFingerprintData?: string;
  fingerprintHash?: string;
  fingerprintTemplate?: Buffer | Uint8Array;
  confidence?: number;
}
