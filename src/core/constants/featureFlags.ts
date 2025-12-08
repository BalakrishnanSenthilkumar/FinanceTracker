/**
 * Feature Flags Configuration
 *
 * Toggle features on/off without changing code logic.
 * Useful for:
 * - A/B testing
 * - Gradual rollouts
 * - Debugging
 * - Environment-specific features
 */

export const FeatureFlags = {
  FEATURE_ENABLED: {
    IS_AI_CHAT_ENABLED: true,
  },
  /**
   * AI Safety Controls
   */
  AI_SAFETY: {
    /** Enable input sanitization (blocks prompt injection & malicious requests) */
    INPUT_SANITIZATION_ENABLED: true,

    /** Enable output filtering (redacts sensitive data from AI responses) */
    OUTPUT_FILTERING_ENABLED: true,

    /** Enable rate limiting for AI requests */
    RATE_LIMITING_ENABLED: true,

    /** Max requests per minute (only applies if RATE_LIMITING_ENABLED is true) */
    MAX_REQUESTS_PER_MINUTE: 10,
  },

  /**
   * Security Features
   */
  SECURITY: {
    /** Enable biometric authentication */
    BIOMETRIC_AUTH_ENABLED: false,

    /** Enable jailbreak/root detection */
    JAILBREAK_DETECTION_ENABLED: false,

    /** Enable screen capture protection */
    SCREEN_CAPTURE_PROTECTION_ENABLED: false,
  },

  /**
   * Data Protection
   */
  DATA_PROTECTION: {
    /** Enable database encryption */
    DB_ENCRYPTION_ENABLED: false,

    /** Enable secure logging (redacts sensitive data from logs) */
    SECURE_LOGGING_ENABLED: true,
  },

  /**
   * Debug/Development
   */
  DEBUG: {
    /** Log blocked inputs to console (for debugging) */
    LOG_BLOCKED_INPUTS: __DEV__,

    /** Log AI responses to console */
    LOG_AI_RESPONSES: __DEV__,
  },
} as const;

// Type for feature flag keys (useful for type-safe access)
export type FeatureFlagKey = keyof typeof FeatureFlags;
