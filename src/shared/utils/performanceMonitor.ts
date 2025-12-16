/**
 * Performance Monitoring Utility
 * Track and log performance metrics for optimization
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private enabled: boolean = __DEV__; // Only enable in development

  /**
   * Start tracking a performance metric
   */
  start(metricName: string): void {
    if (!this.enabled) return;

    this.metrics.set(metricName, {
      name: metricName,
      startTime: Date.now(),
    });
  }

  /**
   * End tracking and log the duration
   */
  end(metricName: string): number | null {
    if (!this.enabled) return null;

    const metric = this.metrics.get(metricName);
    if (!metric) {
      console.warn(`[Performance] Metric "${metricName}" was not started`);
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    console.log(
      `[Performance] ${metricName}: ${duration}ms`,
    );

    // Warn if operation is slow
    if (duration > 1000) {
      console.warn(
        `[Performance] SLOW OPERATION: ${metricName} took ${duration}ms`,
      );
    }

    this.metrics.delete(metricName);
    return duration;
  }

  /**
   * Measure the execution time of an async function
   */
  async measure<T>(
    metricName: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    this.start(metricName);
    try {
      const result = await fn();
      this.end(metricName);
      return result;
    } catch (error) {
      this.end(metricName);
      throw error;
    }
  }

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

