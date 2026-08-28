/**
 * Performance monitoring hook
 * Tracks and logs performance metrics
 */

import { useEffect } from 'react';

interface PerformanceMetrics {
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
        pageLoadTime: 0,
        domReadyTime: 0,
        resourcesCount: 0,
        totalResourceSize: 0,
      };

      // Modern Navigation Timing API
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      
      if (navEntries.length > 0) {
        const navEntry = navEntries[0];
        metrics.pageLoadTime = navEntry.loadEventEnd;
        metrics.domReadyTime = navEntry.domContentLoadedEventEnd;
      } else {
        // Fallback for older browsers
        const navigationStart = performance.timing.navigationStart;
        metrics.pageLoadTime = performance.timing.loadEventEnd - navigationStart;
        metrics.domReadyTime = performance.timing.domContentLoadedEventEnd - navigationStart;
      }

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
        console.log('Page Load Time:', `${Math.round(metrics.pageLoadTime)}ms`);
        console.log('DOM Ready Time:', `${Math.round(metrics.domReadyTime)}ms`);
        console.log('Resources Count:', metrics.resourcesCount);
        console.log('Total Resource Size:', `${(metrics.totalResourceSize / 1024).toFixed(2)}KB`);
        if (metrics.usedMemory) {
          console.log('Memory Used:', `${(metrics.usedMemory / 1024 / 1024).toFixed(2)}MB`);
        }
        console.groupEnd();
      }
    };

    // Ensure loadEventEnd is fully populated before logging
    const handleLoad = () => {
      setTimeout(logPerformance, 0);
    };

    // Log after page is fully loaded
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [componentName]);
}

export default usePerformanceMonitor;