import {
  FeatureFlagsConfig,
  FeatureFlagSettings,
  FeatureFlagPath,
} from './types';
import { getDefaultFlags, defaultSettings } from './defaults';

/**
 * Feature Flag Service
 *
 * Singleton service for managing feature flags with:
 * - Runtime updates
 * - Type-safe access
 * - Observer pattern for React integration
 * - Remote config ready
 */
class FeatureFlagServiceClass {
  private flags: FeatureFlagsConfig;
  private settings: FeatureFlagSettings;
  private listeners: Set<() => void> = new Set();

  // Cached frozen snapshots for useSyncExternalStore
  // Must return the same reference if data hasn't changed to prevent infinite re-renders
  private cachedFlags: Readonly<FeatureFlagsConfig>;
  private cachedSettings: Readonly<FeatureFlagSettings>;

  constructor() {
    this.flags = getDefaultFlags();
    this.settings = defaultSettings;
    // Initialize cached snapshots
    this.cachedFlags = Object.freeze({ ...this.flags });
    this.cachedSettings = Object.freeze({ ...this.settings });
  }

  /**
   * Check if a feature is enabled
   * @param path - Dot notation path like 'features.aiChat' or 'aiSafety.inputSanitization'
   */
  isEnabled(path: FeatureFlagPath): boolean {
    const [category, key] = path.split('.') as [
      keyof FeatureFlagsConfig,
      string,
    ];
    const categoryFlags = this.flags[category] as Record<string, boolean>;
    return categoryFlags?.[key] ?? false;
  }

  /**
   * Get all flags (read-only)
   * Returns cached reference to prevent useSyncExternalStore infinite loops
   */
  getFlags(): Readonly<FeatureFlagsConfig> {
    return this.cachedFlags;
  }

  /**
   * Get settings (non-boolean config values)
   * Returns cached reference to prevent useSyncExternalStore infinite loops
   */
  getSettings(): Readonly<FeatureFlagSettings> {
    return this.cachedSettings;
  }

  /**
   * Update flags at runtime (useful for remote config)
   * @param updates - Partial flag updates to merge
   */
  updateFlags(updates: Partial<FeatureFlagsConfig>): void {
    this.flags = this.deepMerge(this.flags, updates);
    this.notifyListeners();
  }

  /**
   * Update settings at runtime
   */
  updateSettings(updates: Partial<FeatureFlagSettings>): void {
    this.settings = this.deepMerge(this.settings, updates);
    this.notifyListeners();
  }

  /**
   * Override a single flag (useful for testing/debugging)
   */
  setFlag(path: FeatureFlagPath, value: boolean): void {
    const [category, key] = path.split('.') as [
      keyof FeatureFlagsConfig,
      string,
    ];
    if (this.flags[category]) {
      (this.flags[category] as Record<string, boolean>)[key] = value;
      this.notifyListeners();
    }
  }

  /**
   * Reset all flags to defaults
   */
  resetToDefaults(): void {
    this.flags = getDefaultFlags();
    this.settings = defaultSettings;
    this.notifyListeners(); // This also updates the cached snapshots
  }

  /**
   * Subscribe to flag changes (for React integration)
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Load flags from remote config (placeholder for future implementation)
   */
  async loadFromRemote(): Promise<void> {
    // TODO: Implement remote config fetching
    // Example:
    // const remoteFlags = await fetch('https://api.yourapp.com/feature-flags');
    // this.updateFlags(remoteFlags);
    console.log('[FeatureFlags] Remote config not implemented yet');
  }

  private notifyListeners(): void {
    // Update cached snapshots before notifying - creates new references so useSyncExternalStore detects the change
    this.cachedFlags = Object.freeze({ ...this.flags });
    this.cachedSettings = Object.freeze({ ...this.settings });
    this.listeners.forEach(listener => listener());
  }

  private deepMerge<T extends object>(target: T, source: Partial<T>): T {
    const result = { ...target };
    for (const key in source) {
      if (source[key] !== undefined) {
        if (
          typeof source[key] === 'object' &&
          source[key] !== null &&
          !Array.isArray(source[key])
        ) {
          result[key] = this.deepMerge(
            target[key] as object,
            source[key] as object,
          ) as T[Extract<keyof T, string>];
        } else {
          result[key] = source[key] as T[Extract<keyof T, string>];
        }
      }
    }
    return result;
  }
}

// Singleton instance
export const FeatureFlagService = new FeatureFlagServiceClass();
