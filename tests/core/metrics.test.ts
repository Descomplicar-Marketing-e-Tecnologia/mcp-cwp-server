import { MetricsCollector, metricsCollector } from '../../src/core/metrics';

jest.mock('../../src/utils/logger');

describe('MetricsCollector', () => {
  let collector: MetricsCollector;

  beforeEach(() => {
    collector = new MetricsCollector();
  });

  afterEach(() => {
    collector.reset();
  });

  describe('recordToolCall', () => {
    it('should record successful tool call', () => {
      collector.recordToolCall('cwp_account_list', 150, true);

      const metrics = collector.getToolMetrics('cwp_account_list');
      
      expect(metrics).not.toBeNull();
      expect(metrics!.name).toBe('cwp_account_list');
      expect(metrics!.total_calls).toBe(1);
      expect(metrics!.successful_calls).toBe(1);
      expect(metrics!.failed_calls).toBe(0);
      expect(metrics!.avg_duration).toBe(150);
      expect(metrics!.error_rate).toBe(0);
    });

    it('should record failed tool call', () => {
      const error = new Error('API Error');
      collector.recordToolCall('cwp_account_create', 500, false, error);

      const metrics = collector.getToolMetrics('cwp_account_create');
      
      expect(metrics).not.toBeNull();
      expect(metrics!.total_calls).toBe(1);
      expect(metrics!.successful_calls).toBe(0);
      expect(metrics!.failed_calls).toBe(1);
      expect(metrics!.error_rate).toBe(100);
    });

    it('should calculate metrics correctly for multiple calls', () => {
      collector.recordToolCall('cwp_account_list', 100, true);
      collector.recordToolCall('cwp_account_list', 200, true);
      collector.recordToolCall('cwp_account_list', 300, false);

      const metrics = collector.getToolMetrics('cwp_account_list');
      
      expect(metrics!.total_calls).toBe(3);
      expect(metrics!.successful_calls).toBe(2);
      expect(metrics!.failed_calls).toBe(1);
      expect(metrics!.avg_duration).toBe(200); // (100+200+300)/3
      expect(metrics!.error_rate).toBeCloseTo(33.33, 1);
      expect(metrics!.min_duration).toBe(100);
      expect(metrics!.max_duration).toBe(300);
    });

    it('should track recent durations', () => {
      for (let i = 0; i < 60; i++) {
        collector.recordToolCall('test_tool', i * 10, true);
      }

      const metrics = collector.getToolMetrics('test_tool');
      
      expect(metrics!.recent_durations).toHaveLength(50); // Limited to 50
      expect(metrics!.recent_durations[0]).toBe(100); // Should start from call 10 (first 10 dropped)
    });
  });

  describe('getMetrics', () => {
    it('should return comprehensive metrics', () => {
      collector.recordToolCall('tool1', 100, true);
      collector.recordToolCall('tool2', 200, false);

      const metrics = collector.getMetrics();

      expect(metrics).toHaveProperty('timestamp');
      expect(metrics).toHaveProperty('tool_metrics');
      expect(metrics).toHaveProperty('system_metrics');
      expect(metrics).toHaveProperty('alerts');

      expect(metrics.tool_metrics.size).toBe(2);
      expect(metrics.system_metrics).toHaveProperty('uptime');
      expect(metrics.system_metrics).toHaveProperty('total_requests');
      expect(metrics.system_metrics).toHaveProperty('avg_response_time');
      expect(metrics.system_metrics).toHaveProperty('error_rate');
    });
  });

  describe('performance rankings', () => {
    beforeEach(() => {
      // Create tools with different performance characteristics
      collector.recordToolCall('fast_tool', 50, true);
      collector.recordToolCall('fast_tool', 60, true);
      collector.recordToolCall('fast_tool', 70, true);
      collector.recordToolCall('fast_tool', 80, true);
      collector.recordToolCall('fast_tool', 90, true);

      collector.recordToolCall('slow_tool', 500, true);
      collector.recordToolCall('slow_tool', 600, true);
      collector.recordToolCall('slow_tool', 700, true);
      collector.recordToolCall('slow_tool', 800, true);
      collector.recordToolCall('slow_tool', 900, true);

      collector.recordToolCall('error_tool', 100, false);
      collector.recordToolCall('error_tool', 200, false);
      collector.recordToolCall('error_tool', 300, false);
      collector.recordToolCall('error_tool', 400, true);
      collector.recordToolCall('error_tool', 500, true);
    });

    it('should return top performing tools', () => {
      const topTools = collector.getTopPerformingTools(2);

      expect(topTools).toHaveLength(2);
      expect(topTools[0].name).toBe('fast_tool');
      expect(topTools[0].avg_duration).toBe(70);
    });

    it('should return worst performing tools', () => {
      const worstTools = collector.getWorstPerformingTools(2);

      expect(worstTools).toHaveLength(2);
      expect(worstTools[0].name).toBe('slow_tool');
      expect(worstTools[0].avg_duration).toBe(700);
    });

    it('should return highest error rate tools', () => {
      const errorTools = collector.getHighestErrorRateTools(1);

      expect(errorTools).toHaveLength(1);
      expect(errorTools[0].name).toBe('error_tool');
      expect(errorTools[0].error_rate).toBe(60); // 3 failures out of 5 calls
    });
  });

  describe('alerts generation', () => {
    it('should generate memory alerts for high usage', () => {
      // Mock high memory usage
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn().mockReturnValue({
        heapUsed: 900 * 1024 * 1024, // 900MB
        heapTotal: 1000 * 1024 * 1024, // 1GB
        rss: 1200 * 1024 * 1024
      });

      const metrics = collector.getMetrics();

      expect(metrics.alerts.some(alert => 
        alert.category === 'memory' && alert.type === 'critical'
      )).toBe(true);

      process.memoryUsage = originalMemoryUsage;
    });

    it('should generate latency alerts for slow tools', () => {
      // Create a slow tool
      for (let i = 0; i < 10; i++) {
        collector.recordToolCall('very_slow_tool', 3000, true); // 3 seconds
      }

      const metrics = collector.getMetrics();

      expect(metrics.alerts.some(alert => 
        alert.category === 'latency' && alert.tool === 'very_slow_tool'
      )).toBe(true);
    });

    it('should generate error alerts for high error rates', () => {
      // Create a tool with high error rate
      for (let i = 0; i < 10; i++) {
        collector.recordToolCall('failing_tool', 100, false);
      }

      const metrics = collector.getMetrics();

      expect(metrics.alerts.some(alert => 
        alert.category === 'errors' && alert.tool === 'failing_tool'
      )).toBe(true);
    });
  });

  describe('generateReport', () => {
    it('should generate comprehensive performance report', () => {
      collector.recordToolCall('test_tool', 100, true);
      collector.recordToolCall('test_tool', 200, false);

      const report = collector.generateReport();

      expect(typeof report).toBe('string');
      expect(report).toContain('MCP CWP SERVER PERFORMANCE REPORT');
      expect(report).toContain('SYSTEM METRICS');
      expect(report).toContain('Total Requests');
      expect(report).toContain('Average Response Time');
      expect(report).toContain('Error Rate');
    });
  });

  describe('reset', () => {
    it('should reset all metrics', () => {
      collector.recordToolCall('test_tool', 100, true);
      
      expect(collector.getToolMetrics('test_tool')).not.toBeNull();
      
      collector.reset();
      
      expect(collector.getToolMetrics('test_tool')).toBeNull();
      
      const metrics = collector.getMetrics();
      expect(metrics.system_metrics.total_requests).toBe(0);
    });
  });

  describe('singleton instance', () => {
    it('should export working singleton instance', () => {
      expect(metricsCollector).toBeInstanceOf(MetricsCollector);
      
      metricsCollector.recordToolCall('singleton_test', 123, true);
      const metrics = metricsCollector.getToolMetrics('singleton_test');
      
      expect(metrics).not.toBeNull();
      expect(metrics!.avg_duration).toBe(123);
    });
  });
});