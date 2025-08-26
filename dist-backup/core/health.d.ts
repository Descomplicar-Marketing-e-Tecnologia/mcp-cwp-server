/**
 * Health Check System - Enterprise Feature
 *
 * Provides continuous monitoring and automatic health checks
 * for the MCP CWP Server system components.
 */
import { CwpClient } from './client.js';
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
export declare class HealthChecker {
    private client;
    private startTime;
    private checkInterval;
    private lastHealthStatus;
    private responseTimeHistory;
    private errorCount;
    private totalRequests;
    private cacheHits;
    private cacheMisses;
    constructor(client: CwpClient);
    /**
     * Start continuous health monitoring
     */
    startMonitoring(intervalMs?: number): void;
    /**
     * Stop health monitoring
     */
    stopMonitoring(): void;
    /**
     * Perform comprehensive health check
     */
    performHealthCheck(): Promise<HealthStatus>;
    /**
     * Get current health status
     */
    getCurrentHealth(): HealthStatus | null;
    /**
     * Check CWP API connectivity
     */
    private checkCwpApi;
    /**
     * Check cache system health
     */
    private checkCache;
    /**
     * Check memory usage
     */
    private checkMemory;
    /**
     * Record response time for metrics
     */
    recordResponseTime(duration: number): void;
    /**
     * Record error for metrics
     */
    recordError(): void;
    /**
     * Record cache hit
     */
    recordCacheHit(): void;
    /**
     * Record cache miss
     */
    recordCacheMiss(): void;
    /**
     * Calculate performance metrics
     */
    private calculateMetrics;
    /**
     * Get cache hit rate
     */
    private getCacheHitRate;
    /**
     * Determine overall system status
     */
    private determineOverallStatus;
    /**
     * Create a failed health check result
     */
    private createFailedCheck;
}
export declare let healthChecker: HealthChecker | null;
export declare function initializeHealthChecker(client: CwpClient): HealthChecker;
export declare function getHealthChecker(): HealthChecker | null;
//# sourceMappingURL=health.d.ts.map