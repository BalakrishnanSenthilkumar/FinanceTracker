// Feature Flag Module - Public API
export { FeatureFlagService } from './FeatureFlagService';
export { useFeatureFlag, useIsFeatureEnabled } from './useFeatureFlag';
export type {
  FeatureFlagsConfig,
  FeatureFlagSettings,
  FeatureFlagPath,
} from './types';

// Re-export defaults for reference
export {
  developmentFlags,
  stagingFlags,
  productionFlags,
  defaultSettings,
} from './defaults';
