import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

interface BiometricData {
  fingerprintHash?: string;
  template?: string;
  confidence?: number;
}

export const verifyFingerprint = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip biometric auth if disabled
    if (process.env.BIOMETRIC_ENABLED !== 'true') {
      return next();
    }

    const biometricData: BiometricData = req.body.biometric || req.headers['x-biometric-data'];
    
    if (!biometricData || !biometricData.fingerprintHash) {
      return res.status(400).json({ 
        error: 'Biometric data required',
        code: 'BIOMETRIC_REQUIRED'
      });
    }

    // Find donor by fingerprint
    const donor = await prisma.donor.findFirst({
      where: {
        tenantId: req.tenantId!,
        fingerprintHash: biometricData.fingerprintHash,
        biometricVerified: true,
        isActive: true
      }
    });

    if (!donor) {
      // Log failed attempt
      await prisma.biometricLog.create({
        data: {
          tenantId: req.tenantId!,
          donorId: 'unknown',
          action: 'FINGERPRINT_VERIFICATION',
          success: false,
          confidence: biometricData.confidence || 0,
          metadata: {
            fingerprintHash: biometricData.fingerprintHash,
            timestamp: new Date().toISOString()
          }
        }
      });

      return res.status(401).json({ 
        error: 'Biometric verification failed',
        code: 'BIOMETRIC_VERIFICATION_FAILED'
      });
    }

    // Log successful attempt
    await prisma.biometricLog.create({
      data: {
        tenantId: req.tenantId!,
        donorId: donor.id,
        action: 'FINGERPRINT_VERIFICATION',
        success: true,
        confidence: biometricData.confidence || 1,
        metadata: {
          fingerprintHash: biometricData.fingerprintHash,
          timestamp: new Date().toISOString()
        }
      }
    });

    // Add donor info to request
    req.body.verifiedDonor = donor;
    next();

  } catch (error) {
    console.error('Biometric auth error:', error);
    res.status(500).json({ error: 'Biometric verification error' });
  }
};

export const hashFingerprint = (fingerprintData: string): string => {
  return crypto.createHash('sha256').update(fingerprintData).digest('hex');
};

export const generateFingerprintTemplate = (rawFingerprintData: string): Buffer => {
  // This is a simplified example - in production, use a proper biometric SDK
  const hash = crypto.createHash('sha256').update(rawFingerprintData).digest();
  return hash;
};

export default verifyFingerprint;
