/**
 * Performance Metrics System - Enterprise Feature
 *
 * Provides comprehensive performance monitoring and alerting
 * for the MCP CWP Server with automatic optimization suggestions.
 */
export interface PerformanceMetrics {
    timestamp: string;
    tool_metrics: Map<string, ToolMetrics>;
    system_metrics: SystemMetrics;
    alerts: PerformanceAlert[];
}
export interface ToolMetrics {
    name: string;
    total_calls: number;
    successful_calls: number;
    failed_calls: number;
    total_duration: number;
    avg_duration: number;
    min_duration: number;
    max_duration: number;
    last_call: string;
    error_rate: number;
    recent_durations: number[];
}
export interface SystemMetrics {
    uptime: number;
    total_requests: number;
    requests_per_minute: number;
    memory_usage_mb: number;
    memory_usage_percent: number;
    cache_hit_rate: number;
    avg_response_time: number;
    error_rate: number;
}
export interface PerformanceAlert {
    type: 'warning' | 'critical';
    category: 'latency' | 'errors' | 'memory' | 'cache';
    message: string;
    metric_value: number;
    threshold: number;
    timestamp: string;
    tool?: string;
}
export declare class MetricsCollector {
    private toolMetrics;
    private systemStartTime;
    private requestHistory;
    private maxHistorySize;
    private readonly SLOW_OPERATION_THRESHOLD;
    private readonly HIGH_ERROR_RATE_THRESHOLD;
    private readonly MEMORY_WARNING_THRESHOLD;
    private readonly MEMORY_CRITICAL_THRESHOLD;
    private readonly LOW_CACHE_HIT_RATE_THRESHOLD;
    /**
     * Record tool execution metrics
     */
    recordToolCall(toolName: string, duration: number, success: boolean, error?: Error): void;
    /**
     * Get comprehensive performance metrics
     */
    getMetrics(): PerformanceMetrics;
    /**
     * Get metrics for a specific tool
     */
    getToolMetrics(toolName: string): ToolMetrics | null;
    /**
     * Get top performing tools
     */
    getTopPerformingTools(limit?: number): ToolMetrics[];
    /**
     * Get worst performing tools
     */
    getWorstPerformingTools(limit?: number): ToolMetrics[];
    /**
     * Get tools with highest error rates
     */
    getHighestErrorRateTools(limit?: number): ToolMetrics[];
    /**
     * Calculate system-wide metrics
     */
    private calculateSystemMetrics;
    /**
     * Get recent requests within timeframe
     */
    private getRecentRequests;
    /**
     * Generate performance alerts
     */
    private generateAlerts;
    /**
     * Get cache hit rate from system metrics (placeholder)
     */
    private getCacheHitRateFromMetrics;
    /**
     * Generate performance report
     */
    generateReport(): string;
    /**
     * Reset all metrics
     */
    reset(): void;
}
export declare const metricsCollector: MetricsCollector;
//# sourceMappingURL=metrics.d.ts.map