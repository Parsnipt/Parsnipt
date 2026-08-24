/**
 * Performance monitoring hook
 * Tracks and logs performance metrics
 */

import { useEffect } from 'react';

interface PerformanceMetrics {
  // Navigation Timing
  navigationStart: number;
  pageLoadTime: number;
  domReadyTime: number;
  
  // Resource Timing
  resourcesCount: number;
  totalResourceSize: number;
  
  // Memory (if available)
  usedMemory?: number;
  totalMemory?: number;
}

export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.performance) return;

    const logPerformance = () => {
      const metrics: PerformanceMetrics = {
        navigationStart: 0,
        pageLoadTime: 0,
        domReadyTime: 0,
        resourcesCount: 0,
        totalResourceSize: 0,
      };

      // Navigation timing
      const navigationStart = performance.timing.navigationStart;
      const pageLoadTime = performance.timing.loadEventEnd - navigationStart;
      const domReadyTime = performance.timing.domContentLoadedEventEnd - navigationStart;

      metrics.navigationStart = navigationStart;
      metrics.pageLoadTime = pageLoadTime;
      metrics.domReadyTime = domReadyTime;

      // Resource timing
      const resources = performance.getEntriesByType('resource');
      metrics.resourcesCount = resources.length;
      metrics.totalResourceSize = resources.reduce(
        (sum, resource: any) => sum + (resource.transferSize || 0),
        0
      );

      // Memory (Chrome only)
      if ((performance as any).memory) {
        metrics.usedMemory = (performance as any).memory.usedJSHeapSize;
        metrics.totalMemory = (performance as any).memory.totalJSHeapSize;
      }

      // Log metrics via Vite's import.meta.env
      if (import.meta.env.DEV) {
        console.group(`Performance Metrics - ${componentName}`);
        console.log('Page Load Time:', `${metrics.pageLoadTime}ms`);
        console.log('DOM Ready Time:', `${metrics.domReadyTime}ms`);
        console.log('Resources Count:', metrics.resourcesCount);
        console.log('Total Resource Size:', `${(metrics.totalResourceSize / 1024).toFixed(2)}KB`);
        if (metrics.usedMemory) {
          console.log('Memory Used:', `${(metrics.usedMemory / 1024 / 1024).toFixed(2)}MB`);
        }
        console.groupEnd();
      }
    };

    // Log after page is fully loaded
    if (document.readyState === 'complete') {
      logPerformance();
    } else {
      window.addEventListener('load', logPerformance);
      return () => window.removeEventListener('load', logPerformance);
    }
  }, [componentName]);
}

export default usePerformanceMonitor;