import { Request, Response, NextFunction } from 'express';

// Feature flags mapping
const FEATURE_FLAGS = {
  DONOR_REGISTRATION: 'FEATURE_DONOR_REGISTRATION',
  INVENTORY_MANAGEMENT: 'FEATURE_INVENTORY_MANAGEMENT',
  COLLECTION_PROCESSING: 'FEATURE_COLLECTION_PROCESSING',
  DISTRIBUTION: 'FEATURE_DISTRIBUTION',
  HOSPITAL_INTEGRATION: 'FEATURE_HOSPITAL_INTEGRATION',
  REPORTS: 'FEATURE_REPORTS',
  BIOMETRIC_AUTH: 'FEATURE_BIOMETRIC_AUTH',
  MULTI_TENANT: 'FEATURE_MULTI_TENANT'
};

/**
 * Middleware to check if a feature is enabled
 * @param featureName - The name of the feature to check
 * @returns Express middleware function
 */
export const checkFeature = (featureName: keyof typeof FEATURE_FLAGS) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const envVar = FEATURE_FLAGS[featureName];
    const isEnabled = process.env[envVar] === 'true';
    
    if (!isEnabled) {
      return res.status(403).json({
        error: 'Feature not enabled',
        feature: featureName,
        code: 'FEATURE_DISABLED'
      });
    }
    
    next();
  };
};

/**
 * Check if a feature is enabled (utility function)
 * @param featureName - The name of the feature to check
 * @returns boolean indicating if feature is enabled
 */
export const isFeatureEnabled = (featureName: keyof typeof FEATURE_FLAGS): boolean => {
  const envVar = FEATURE_FLAGS[featureName];
  return process.env[envVar] === 'true';
};

/**
 * Get all enabled features
 * @returns Object with feature names and their status
 */
export const getEnabledFeatures = () => {
  const features: Record<string, boolean> = {};
  
  Object.entries(FEATURE_FLAGS).forEach(([feature, envVar]) => {
    features[feature] = process.env[envVar] === 'true';
  });
  
  return features;
};

export default checkFeature;
