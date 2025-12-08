/**
 * Feature Flag Type Definitions
 * Centralized types for type-safe feature flag access
 */

export interface FeatureFlagsConfig {
  features: {
    aiChat: boolean;
    biometricAuth: boolean;
    dbEncryption: boolean;
  };
  aiSafety: {
    inputSanitization: boolean;
    outputFiltering: boolean;
    rateLimiting: boolean;
  };
  security: {
    jailbreakDetection: boolean;
    screenCaptureProtection: boolean;
  };
  debug: {
    logBlockedInputs: boolean;
    logAiResponses: boolean;
    verboseLogging: boolean;
  };
}

export interface FeatureFlagSettings {
  aiSafety: {
    maxRequestsPerMinute: number;
    maxInputLength: number;
  };
}

// Union type for all feature flag paths (dot notation)
export type FeatureFlagPath =
  | `features.${keyof FeatureFlagsConfig['features']}`
  | `aiSafety.${keyof FeatureFlagsConfig['aiSafety']}`
  | `security.${keyof FeatureFlagsConfig['security']}`
  | `debug.${keyof FeatureFlagsConfig['debug']}`;
