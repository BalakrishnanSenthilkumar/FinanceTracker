import { useCallback, useSyncExternalStore } from 'react';
import { FeatureFlagService } from './FeatureFlagService';
import {
  FeatureFlagPath,
  FeatureFlagsConfig,
  FeatureFlagSettings,
} from './types';

/**
 * React Hook for Feature Flags
 *
 * Provides reactive access to feature flags.
 * Components using this hook will re-render when flags change.
 *
 * @example
 * const { isEnabled } = useFeatureFlag();
 *
 * if (isEnabled('features.aiChat')) {
 *   return <ChatScreen />;
 * }
 */
export const useFeatureFlag = () => {
  // Subscribe to flag changes for reactivity
  const flags = useSyncExternalStore(
    useCallback(
      (callback: () => void) => FeatureFlagService.subscribe(callback),
      [],
    ),
    () => FeatureFlagService.getFlags(),
    () => FeatureFlagService.getFlags(),
  );

  const settings = useSyncExternalStore(
    useCallback(
      (callback: () => void) => FeatureFlagService.subscribe(callback),
      [],
    ),
    () => FeatureFlagService.getSettings(),
    () => FeatureFlagService.getSettings(),
  );

  /**
   * Check if a feature is enabled
   */
  const isEnabled = useCallback((path: FeatureFlagPath): boolean => {
    return FeatureFlagService.isEnabled(path);
  }, []);

  /**
   * Set a flag value (for testing/admin panels)
   */
  const setFlag = useCallback((path: FeatureFlagPath, value: boolean): void => {
    FeatureFlagService.setFlag(path, value);
  }, []);

  return {
    flags,
    settings,
    isEnabled,
    setFlag,
  };
};

/**
 * Simple hook to check a single flag
 *
 * @example
 * const isChatEnabled = useIsFeatureEnabled('features.aiChat');
 */
export const useIsFeatureEnabled = (path: FeatureFlagPath): boolean => {
  return useSyncExternalStore(
    useCallback(
      (callback: () => void) => FeatureFlagService.subscribe(callback),
      [],
    ),
    () => FeatureFlagService.isEnabled(path),
    () => FeatureFlagService.isEnabled(path),
  );
};
