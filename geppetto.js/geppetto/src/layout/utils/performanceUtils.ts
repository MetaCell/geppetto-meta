import * as React from "react";

/**
 * Performance monitoring utilities for layout manager
 */

export class LayoutPerformanceMonitor {
  private static renderCount = new Map<string, number>();
  private static lastRenderTime = new Map<string, number>();

  /**
   * Track widget renders for debugging
   */
  static trackRender(widgetId: string, reason?: string) {
    if (process.env.NODE_ENV === "development") {
      const now = Date.now();
      const count = this.renderCount.get(widgetId) || 0;
      const lastTime = this.lastRenderTime.get(widgetId) || 0;
      const timeSinceLastRender = now - lastTime;

      this.renderCount.set(widgetId, count + 1);
      this.lastRenderTime.set(widgetId, now);

      // Log excessive re-renders
      if (count > 0 && timeSinceLastRender < 100) {
        console.warn(
          `Widget ${widgetId} re-rendered quickly (${timeSinceLastRender}ms since last render) - Render count: ${count + 1}${reason ? ` - Reason: ${reason}` : ""}`,
        );
      }
    }
  }

  /**
   * Get render statistics for debugging
   */
  static getRenderStats() {
    if (process.env.NODE_ENV === "development") {
      const stats = Array.from(this.renderCount.entries()).map(([widgetId, count]) => ({
        widgetId,
        renderCount: count,
        lastRender: this.lastRenderTime.get(widgetId),
      }));

      return stats.sort((a, b) => b.renderCount - a.renderCount);
    }
    return [];
  }

  /**
   * Clear performance tracking data
   */
  static clearStats() {
    this.renderCount.clear();
    this.lastRenderTime.clear();
  }
}

/**
 * HOC to wrap widgets with performance tracking
 */
export function withPerformanceTracking<T extends object>(
  Component: React.ComponentType<T>,
  widgetId: string,
): React.ComponentType<T> {
  const WrappedComponent = React.memo((props: T) => {
    LayoutPerformanceMonitor.trackRender(widgetId);
    return React.createElement(Component, props);
  }) as React.ComponentType<T>;

  WrappedComponent.displayName = `WithPerformanceTracking(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
