/**
 * Health Check System - Enterprise Feature
 * 
 * Provides continuous monitoring and automatic health checks
 * for the MCP CWP Server system components.
 */

import { logger } from '../utils/logger.js';
import { CwpClient } from './client.js';
import { cache } from './cache.js';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    cwp_api: HealthCheckResult;
    cache: HealthCheckResult;
    memory: HealthCheckResult;
  };
  metrics: {
    response_time_avg: number;
    error_rate: number;
    cache_hit_rate: number;
  };
}

export interface HealthCheckResult {
  status: 'pass' | 'fail' | 'warn';
  message: string;
  duration_ms: number;
  details?: Record<string, unknown>;
}

export class HealthChecker {
  private client: CwpClient;
  private startTime: number;
  private checkInterval: NodeJS.Timeout | null = null;
  private lastHealthStatus: HealthStatus | null = null;
  
  // Metrics tracking
  private responseTimeHistory: number[] = [];
  private errorCount = 0;
  private totalRequests = 0;
  private cacheHits = 0;
  private cacheMisses = 0;

  constructor(client: CwpClient) {
    this.client = client;
    this.startTime = Date.now();
  }

  /**
   * Start continuous health monitoring
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      try {
        const health = await this.performHealthCheck();
        this.lastHealthStatus = health;
        
        if (health.status !== 'healthy') {
          logger.warn('Health check failed', { health });
        } else {
          logger.debug('Health check passed', { 
            status: health.status,
            responseTime: health.metrics.response_time_avg 
          });
        }
      } catch (error) {
        logger.error('Health check error:', error);
      }
    }, intervalMs);

    logger.info('Health monitoring started', { intervalMs });
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      logger.info('Health monitoring stopped');
    }
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();
    const uptime = Date.now() - this.startTime;

    const [cwpCheck, cacheCheck, memoryCheck] = await Promise.allSettled([
      this.checkCwpApi(),
      this.checkCache(),
      this.checkMemory()
    ]);

    const checks = {
      cwp_api: cwpCheck.status === 'fulfilled' ? cwpCheck.value : this.createFailedCheck('CWP API check failed'),
      cache: cacheCheck.status === 'fulfilled' ? cacheCheck.value : this.createFailedCheck('Cache check failed'),
      memory: memoryCheck.status === 'fulfilled' ? memoryCheck.value : this.createFailedCheck('Memory check failed')
    };

    const metrics = this.calculateMetrics();
    const overallStatus = this.determineOverallStatus(checks);

    return {
      status: overallStatus,
      timestamp,
      uptime,
      checks,
      metrics
    };
  }

  /**
   * Get current health status
   */
  getCurrentHealth(): HealthStatus | null {
    return this.lastHealthStatus;
  }

  /**
   * Check CWP API connectivity
   */
  private async checkCwpApi(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Test basic API connectivity
      const result = await this.client.post('/account', { 
        action: 'list', 
        limit: '1' 
      }, 'health_check');
      
      const duration = Date.now() - startTime;
      this.recordResponseTime(duration);
      
      if (result.status === 'success' || result.status === 'error') {
        // Even error responses indicate API is reachable
        return {
          status: 'pass',
          message: 'CWP API is responding',
          duration_ms: duration,
          details: { response_status: result.status }
        };
      }
      
      return {
        status: 'warn',
        message: 'CWP API responded but with unexpected status',
        duration_ms: duration,
        details: { response_status: result.status }
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordError();
      
      return {
        status: 'fail',
        message: `CWP API unreachable: ${(error as Error).message}`,
        duration_ms: duration,
        details: { error: (error as Error).message }
      };
    }
  }

  /**
   * Check cache system health
   */
  private async checkCache(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const testKey = 'health_check_' + Date.now();
      const testValue = { test: true, timestamp: Date.now() };
      
      // Test cache write
      cache.set(testKey, testValue, 60);
      
      // Test cache read
      const retrieved = cache.get(testKey);
      
      // Test cache delete
      cache.delete(testKey);
      
      const duration = Date.now() - startTime;
      
      if (retrieved && (retrieved as any).test === true) {
        return {
          status: 'pass',
          message: 'Cache system is working',
          duration_ms: duration,
          details: { 
            write: true, 
            read: true, 
            delete: true,
            hit_rate: this.getCacheHitRate()
          }
        };
      }
      
      return {
        status: 'fail',
        message: 'Cache read/write test failed',
        duration_ms: duration
      };
      
    } catch (error) {
      return {
        status: 'fail',
        message: `Cache system error: ${(error as Error).message}`,
        duration_ms: Date.now() - startTime,
        details: { error: (error as Error).message }
      };
    }
  }

  /**
   * Check memory usage
   */
  private async checkMemory(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const memUsage = process.memoryUsage();
      const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const memTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      const memUsagePercent = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
      
      const duration = Date.now() - startTime;
      
      let status: 'pass' | 'warn' | 'fail' = 'pass';
      let message = `Memory usage: ${memUsedMB}MB (${memUsagePercent}%)`;
      
      if (memUsagePercent > 85) {
        status = 'fail';
        message = `High memory usage: ${memUsedMB}MB (${memUsagePercent}%)`;
      } else if (memUsagePercent > 70) {
        status = 'warn';
        message = `Elevated memory usage: ${memUsedMB}MB (${memUsagePercent}%)`;
      }
      
      return {
        status,
        message,
        duration_ms: duration,
        details: {
          heap_used_mb: memUsedMB,
          heap_total_mb: memTotalMB,
          usage_percent: memUsagePercent,
          rss_mb: Math.round(memUsage.rss / 1024 / 1024)
        }
      };
      
    } catch (error) {
      return {
        status: 'fail',
        message: `Memory check failed: ${(error as Error).message}`,
        duration_ms: Date.now() - startTime
      };
    }
  }

  /**
   * Record response time for metrics
   */
  recordResponseTime(duration: number): void {
    this.responseTimeHistory.push(duration);
    if (this.responseTimeHistory.length > 100) {
      this.responseTimeHistory.shift();
    }
    this.totalRequests++;
  }

  /**
   * Record error for metrics
   */
  recordError(): void {
    this.errorCount++;
    this.totalRequests++;
  }

  /**
   * Record cache hit
   */
  recordCacheHit(): void {
    this.cacheHits++;
  }

  /**
   * Record cache miss
   */
  recordCacheMiss(): void {
    this.cacheMisses++;
  }

  /**
   * Calculate performance metrics
   */
  private calculateMetrics() {
    const avgResponseTime = this.responseTimeHistory.length > 0
      ? this.responseTimeHistory.reduce((a, b) => a + b, 0) / this.responseTimeHistory.length
      : 0;
    
    const errorRate = this.totalRequests > 0
      ? (this.errorCount / this.totalRequests) * 100
      : 0;
    
    const cacheHitRate = this.getCacheHitRate();
    
    return {
      response_time_avg: Math.round(avgResponseTime),
      error_rate: Math.round(errorRate * 100) / 100,
      cache_hit_rate: Math.round(cacheHitRate * 100) / 100
    };
  }

  /**
   * Get cache hit rate
   */
  private getCacheHitRate(): number {
    const totalCacheRequests = this.cacheHits + this.cacheMisses;
    return totalCacheRequests > 0 ? (this.cacheHits / totalCacheRequests) * 100 : 0;
  }

  /**
   * Determine overall system status
   */
  private determineOverallStatus(checks: HealthStatus['checks']): 'healthy' | 'degraded' | 'unhealthy' {
    const checkResults = Object.values(checks);
    
    if (checkResults.every(check => check.status === 'pass')) {
      return 'healthy';
    }
    
    if (checkResults.some(check => check.status === 'fail')) {
      return 'unhealthy';
    }
    
    return 'degraded';
  }

  /**
   * Create a failed health check result
   */
  private createFailedCheck(message: string): HealthCheckResult {
    return {
      status: 'fail',
      message,
      duration_ms: 0
    };
  }
}

// Export singleton instance
export let healthChecker: HealthChecker | null = null;

export function initializeHealthChecker(client: CwpClient): HealthChecker {
  healthChecker = new HealthChecker(client);
  return healthChecker;
}

export function getHealthChecker(): HealthChecker | null {
  return healthChecker;
}