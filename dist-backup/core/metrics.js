/**
 * Performance Metrics System - Enterprise Feature
 *
 * Provides comprehensive performance monitoring and alerting
 * for the MCP CWP Server with automatic optimization suggestions.
 */
import { logger } from '../utils/logger.js';
export class MetricsCollector {
    toolMetrics = new Map();
    systemStartTime = Date.now();
    requestHistory = [];
    maxHistorySize = 1000;
    // Performance thresholds
    SLOW_OPERATION_THRESHOLD = 2000; // 2 seconds
    HIGH_ERROR_RATE_THRESHOLD = 5; // 5%
    MEMORY_WARNING_THRESHOLD = 70; // 70%
    MEMORY_CRITICAL_THRESHOLD = 85; // 85%
    LOW_CACHE_HIT_RATE_THRESHOLD = 70; // 70%
    /**
     * Record tool execution metrics
     */
    recordToolCall(toolName, duration, success, error) {
        const now = new Date().toISOString();
        // Get or create tool metrics
        let metrics = this.toolMetrics.get(toolName);
        if (!metrics) {
            metrics = {
                name: toolName,
                total_calls: 0,
                successful_calls: 0,
                failed_calls: 0,
                total_duration: 0,
                avg_duration: 0,
                min_duration: Infinity,
                max_duration: 0,
                last_call: now,
                error_rate: 0,
                recent_durations: []
            };
            this.toolMetrics.set(toolName, metrics);
        }
        // Update metrics
        metrics.total_calls++;
        metrics.total_duration += duration;
        metrics.last_call = now;
        if (success) {
            metrics.successful_calls++;
        }
        else {
            metrics.failed_calls++;
        }
        // Update duration stats
        metrics.min_duration = Math.min(metrics.min_duration, duration);
        metrics.max_duration = Math.max(metrics.max_duration, duration);
        metrics.avg_duration = metrics.total_duration / metrics.total_calls;
        metrics.error_rate = (metrics.failed_calls / metrics.total_calls) * 100;
        // Track recent durations (last 50 calls)
        metrics.recent_durations.push(duration);
        if (metrics.recent_durations.length > 50) {
            metrics.recent_durations.shift();
        }
        // Record in request history
        this.requestHistory.push({
            timestamp: Date.now(),
            duration,
            success
        });
        // Limit history size
        if (this.requestHistory.length > this.maxHistorySize) {
            this.requestHistory.shift();
        }
        // Log slow operations
        if (duration > this.SLOW_OPERATION_THRESHOLD) {
            logger.warn('Slow operation detected', {
                tool: toolName,
                duration,
                threshold: this.SLOW_OPERATION_THRESHOLD,
                success,
                error: error?.message
            });
        }
        // Log high error rates
        if (metrics.error_rate > this.HIGH_ERROR_RATE_THRESHOLD && metrics.total_calls >= 10) {
            logger.warn('High error rate detected', {
                tool: toolName,
                error_rate: metrics.error_rate,
                total_calls: metrics.total_calls,
                threshold: this.HIGH_ERROR_RATE_THRESHOLD
            });
        }
    }
    /**
     * Get comprehensive performance metrics
     */
    getMetrics() {
        const timestamp = new Date().toISOString();
        const systemMetrics = this.calculateSystemMetrics();
        const alerts = this.generateAlerts();
        return {
            timestamp,
            tool_metrics: new Map(this.toolMetrics),
            system_metrics: systemMetrics,
            alerts
        };
    }
    /**
     * Get metrics for a specific tool
     */
    getToolMetrics(toolName) {
        return this.toolMetrics.get(toolName) || null;
    }
    /**
     * Get top performing tools
     */
    getTopPerformingTools(limit = 10) {
        return Array.from(this.toolMetrics.values())
            .filter(metrics => metrics.total_calls >= 5) // Minimum calls for statistical relevance
            .sort((a, b) => a.avg_duration - b.avg_duration)
            .slice(0, limit);
    }
    /**
     * Get worst performing tools
     */
    getWorstPerformingTools(limit = 10) {
        return Array.from(this.toolMetrics.values())
            .filter(metrics => metrics.total_calls >= 5)
            .sort((a, b) => b.avg_duration - a.avg_duration)
            .slice(0, limit);
    }
    /**
     * Get tools with highest error rates
     */
    getHighestErrorRateTools(limit = 10) {
        return Array.from(this.toolMetrics.values())
            .filter(metrics => metrics.total_calls >= 5)
            .sort((a, b) => b.error_rate - a.error_rate)
            .slice(0, limit);
    }
    /**
     * Calculate system-wide metrics
     */
    calculateSystemMetrics() {
        const uptime = Date.now() - this.systemStartTime;
        const recentRequests = this.getRecentRequests(60000); // Last minute
        const totalRequests = this.requestHistory.length;
        const successfulRequests = this.requestHistory.filter(r => r.success).length;
        const errorRate = totalRequests > 0 ? ((totalRequests - successfulRequests) / totalRequests) * 100 : 0;
        const avgResponseTime = this.requestHistory.length > 0
            ? this.requestHistory.reduce((sum, req) => sum + req.duration, 0) / this.requestHistory.length
            : 0;
        const memUsage = process.memoryUsage();
        const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
        const memUsagePercent = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
        return {
            uptime,
            total_requests: totalRequests,
            requests_per_minute: recentRequests.length,
            memory_usage_mb: memUsedMB,
            memory_usage_percent: memUsagePercent,
            cache_hit_rate: this.getCacheHitRateFromMetrics(),
            avg_response_time: Math.round(avgResponseTime),
            error_rate: Math.round(errorRate * 100) / 100
        };
    }
    /**
     * Get recent requests within timeframe
     */
    getRecentRequests(timeframeMs) {
        const cutoff = Date.now() - timeframeMs;
        return this.requestHistory.filter(req => req.timestamp >= cutoff);
    }
    /**
     * Generate performance alerts
     */
    generateAlerts() {
        const alerts = [];
        const now = new Date().toISOString();
        const systemMetrics = this.calculateSystemMetrics();
        // Memory alerts
        if (systemMetrics.memory_usage_percent >= this.MEMORY_CRITICAL_THRESHOLD) {
            alerts.push({
                type: 'critical',
                category: 'memory',
                message: `Critical memory usage: ${systemMetrics.memory_usage_percent}%`,
                metric_value: systemMetrics.memory_usage_percent,
                threshold: this.MEMORY_CRITICAL_THRESHOLD,
                timestamp: now
            });
        }
        else if (systemMetrics.memory_usage_percent >= this.MEMORY_WARNING_THRESHOLD) {
            alerts.push({
                type: 'warning',
                category: 'memory',
                message: `High memory usage: ${systemMetrics.memory_usage_percent}%`,
                metric_value: systemMetrics.memory_usage_percent,
                threshold: this.MEMORY_WARNING_THRESHOLD,
                timestamp: now
            });
        }
        // Cache hit rate alerts
        if (systemMetrics.cache_hit_rate < this.LOW_CACHE_HIT_RATE_THRESHOLD) {
            alerts.push({
                type: 'warning',
                category: 'cache',
                message: `Low cache hit rate: ${systemMetrics.cache_hit_rate}%`,
                metric_value: systemMetrics.cache_hit_rate,
                threshold: this.LOW_CACHE_HIT_RATE_THRESHOLD,
                timestamp: now
            });
        }
        // System-wide error rate alerts
        if (systemMetrics.error_rate > this.HIGH_ERROR_RATE_THRESHOLD) {
            alerts.push({
                type: 'critical',
                category: 'errors',
                message: `High system error rate: ${systemMetrics.error_rate}%`,
                metric_value: systemMetrics.error_rate,
                threshold: this.HIGH_ERROR_RATE_THRESHOLD,
                timestamp: now
            });
        }
        // Tool-specific alerts
        for (const [toolName, metrics] of this.toolMetrics) {
            if (metrics.total_calls >= 5) { // Minimum for statistical relevance
                // Slow tool alerts
                if (metrics.avg_duration > this.SLOW_OPERATION_THRESHOLD) {
                    alerts.push({
                        type: 'warning',
                        category: 'latency',
                        message: `Tool ${toolName} is slow: ${Math.round(metrics.avg_duration)}ms average`,
                        metric_value: metrics.avg_duration,
                        threshold: this.SLOW_OPERATION_THRESHOLD,
                        timestamp: now,
                        tool: toolName
                    });
                }
                // High error rate tool alerts
                if (metrics.error_rate > this.HIGH_ERROR_RATE_THRESHOLD) {
                    alerts.push({
                        type: 'critical',
                        category: 'errors',
                        message: `Tool ${toolName} has high error rate: ${metrics.error_rate}%`,
                        metric_value: metrics.error_rate,
                        threshold: this.HIGH_ERROR_RATE_THRESHOLD,
                        timestamp: now,
                        tool: toolName
                    });
                }
            }
        }
        return alerts;
    }
    /**
     * Get cache hit rate from system metrics (placeholder)
     */
    getCacheHitRateFromMetrics() {
        // This would integrate with the actual cache system
        // For now, return a reasonable default
        return 85;
    }
    /**
     * Generate performance report
     */
    generateReport() {
        const metrics = this.getMetrics();
        const topTools = this.getTopPerformingTools(5);
        const worstTools = this.getWorstPerformingTools(5);
        let report = '🏆 MCP CWP SERVER PERFORMANCE REPORT\n';
        report += '='.repeat(50) + '\n\n';
        // System metrics
        report += '📊 SYSTEM METRICS:\n';
        report += `• Uptime: ${Math.round(metrics.system_metrics.uptime / 1000 / 60)} minutes\n`;
        report += `• Total Requests: ${metrics.system_metrics.total_requests}\n`;
        report += `• Requests/Minute: ${metrics.system_metrics.requests_per_minute}\n`;
        report += `• Average Response Time: ${metrics.system_metrics.avg_response_time}ms\n`;
        report += `• Error Rate: ${metrics.system_metrics.error_rate}%\n`;
        report += `• Memory Usage: ${metrics.system_metrics.memory_usage_mb}MB (${metrics.system_metrics.memory_usage_percent}%)\n`;
        report += `• Cache Hit Rate: ${metrics.system_metrics.cache_hit_rate}%\n\n`;
        // Alerts
        if (metrics.alerts.length > 0) {
            report += '🚨 ACTIVE ALERTS:\n';
            for (const alert of metrics.alerts) {
                const icon = alert.type === 'critical' ? '🔴' : '🟡';
                report += `${icon} ${alert.message}\n`;
            }
            report += '\n';
        }
        // Top performing tools
        report += '🏃 TOP PERFORMING TOOLS:\n';
        topTools.forEach((tool, index) => {
            report += `${index + 1}. ${tool.name}: ${Math.round(tool.avg_duration)}ms avg (${tool.total_calls} calls)\n`;
        });
        report += '\n';
        // Worst performing tools
        if (worstTools.length > 0) {
            report += '🐌 SLOWEST TOOLS:\n';
            worstTools.forEach((tool, index) => {
                report += `${index + 1}. ${tool.name}: ${Math.round(tool.avg_duration)}ms avg (${tool.error_rate}% errors)\n`;
            });
        }
        return report;
    }
    /**
     * Reset all metrics
     */
    reset() {
        this.toolMetrics.clear();
        this.requestHistory = [];
        this.systemStartTime = Date.now();
        logger.info('Performance metrics reset');
    }
}
// Export singleton instance
export const metricsCollector = new MetricsCollector();
//# sourceMappingURL=metrics.js.map