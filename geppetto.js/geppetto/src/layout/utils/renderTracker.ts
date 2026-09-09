/**
 * Performance monitoring utilities for debugging widget re-renders
 */

export class WidgetRenderTracker {
  private static renderCounts = new Map<string, number>();
  private static lastRenderTime = new Map<string, number>();

  /**
   * Track when a widget renders and log excessive re-renders
   */
  static trackRender(widgetId: string, reason?: string) {
    if (process.env.NODE_ENV === "development") {
      const now = Date.now();
      const count = this.renderCounts.get(widgetId) || 0;
      const lastTime = this.lastRenderTime.get(widgetId) || 0;
      const timeSinceLastRender = now - lastTime;

      this.renderCounts.set(widgetId, count + 1);
      this.lastRenderTime.set(widgetId, now);

      // Log if widget is re-rendering too frequently (within 100ms)
      if (count > 0 && timeSinceLastRender < 100) {
        console.warn(
          `🔄 Widget ${widgetId} re-rendered quickly (${timeSinceLastRender}ms) - Count: ${count + 1}${reason ? ` - ${reason}` : ""}`,
        );
      }

      // Log every 10th render to track render frequency
      if ((count + 1) % 10 === 0) {
        console.info(`📊 Widget ${widgetId} has rendered ${count + 1} times`);
      }
    }
  }

  /**
   * Track when FlexLayout itself re-renders (indicates layout-wide re-render)
   */
  static trackLayoutRender(reason?: string) {
    if (process.env.NODE_ENV === "development") {
      const now = Date.now();
      const lastTime = this.lastRenderTime.get("__LAYOUT__") || 0;
      const timeSinceLastRender = now - lastTime;

      this.lastRenderTime.set("__LAYOUT__", now);

      if (timeSinceLastRender < 100 && lastTime > 0) {
        console.warn(
          `🔄 LAYOUT re-rendered quickly (${timeSinceLastRender}ms)${reason ? ` - ${reason}` : ""}`,
        );
        console.trace("Layout re-render trace");
      } else if (lastTime > 0) {
        console.info(`🏗️  LAYOUT re-rendered${reason ? ` - ${reason}` : ""}`);
      }
    }
  }

  /**
   * Get rendering statistics for all widgets
   */
  static getStats() {
    if (process.env.NODE_ENV === "development") {
      const stats = Array.from(this.renderCounts.entries())
        .map(([widgetId, count]) => ({
          widgetId,
          renderCount: count,
          lastRenderTime: this.lastRenderTime.get(widgetId),
        }))
        .sort((a, b) => b.renderCount - a.renderCount);

      return stats;
    }
    return [];
  }

  /**
   * Clear all tracking data
   */
  static reset() {
    this.renderCounts.clear();
    this.lastRenderTime.clear();
  }

  /**
   * Log current stats to console
   */
  static logStats() {
    if (process.env.NODE_ENV === "development") {
      const stats = this.getStats();
      if (stats.length > 0) {
        console.table(stats);
      } else {
        console.log("No widget render stats available");
      }
    }
  }
}

// Global methods for easy debugging
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).logWidgetStats = () => WidgetRenderTracker.logStats();
  (window as any).resetWidgetStats = () => WidgetRenderTracker.reset();
}
