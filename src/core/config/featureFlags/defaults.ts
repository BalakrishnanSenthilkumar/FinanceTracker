import { FeatureFlagsConfig, FeatureFlagSettings } from './types';

/**
 * Default Feature Flags by Environment
 *
 * These are compile-time defaults. Can be overridden at runtime
 * via remote config or local storage (for testing).
 */

const baseFlags: FeatureFlagsConfig = {
  features: {
    aiChat: true,
    biometricAuth: false,
    dbEncryption: false,
  },
  aiSafety: {
    inputSanitization: true,
    outputFiltering: true,
    rateLimiting: true,
    topicFiltering: true, // Only allow finance-related questions
  },
  security: {
    jailbreakDetection: false,
    screenCaptureProtection: false,
  },
  debug: {
    logBlockedInputs: false,
    logAiResponses: false,
    verboseLogging: false,
  },
};

/**
 * Development environment flags
 * More permissive, debug logging enabled
 */
export const developmentFlags: FeatureFlagsConfig = {
  ...baseFlags,
  debug: {
    logBlockedInputs: true,
    logAiResponses: true,
    verboseLogging: true,
  },
};

/**
 * Staging environment flags
 * Similar to production but with some debug capabilities
 */
export const stagingFlags: FeatureFlagsConfig = {
  ...baseFlags,
  security: {
    ...baseFlags.security,
    jailbreakDetection: true,
  },
  debug: {
    logBlockedInputs: true,
    logAiResponses: false,
    verboseLogging: false,
  },
};

/**
 * Production environment flags
 * Most restrictive, all security enabled
 */
export const productionFlags: FeatureFlagsConfig = {
  ...baseFlags,
  security: {
    jailbreakDetection: true,
    screenCaptureProtection: true,
  },
  debug: {
    logBlockedInputs: false,
    logAiResponses: false,
    verboseLogging: false,
  },
};

/**
 * Feature Flag Settings (non-boolean configuration values)
 */
export const defaultSettings: FeatureFlagSettings = {
  aiSafety: {
    maxRequestsPerMinute: 10,
    maxInputLength: 2000,
  },
};

/**
 * Get flags for current environment
 */
export const getDefaultFlags = (): FeatureFlagsConfig => {
  if (__DEV__) {
    return developmentFlags;
  }
  // You can add staging detection here if needed
  // e.g., if (Config.ENV === 'staging') return stagingFlags;
  return productionFlags;
};
