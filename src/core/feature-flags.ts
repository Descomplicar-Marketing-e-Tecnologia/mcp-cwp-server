/**
 * Feature Flags System - Enterprise Feature
 * 
 * Provides dynamic feature control and rollback capabilities
 * for safe deployment and A/B testing in the MCP CWP Server.
 */

import { logger } from '../utils/logger.js';

export type FeatureFlagValue = boolean | string | number | object;

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  value?: FeatureFlagValue;
  description: string;
  environment?: string[];
  rollout_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface FeatureFlagConfig {
  flags: Record<string, Omit<FeatureFlag, 'name' | 'created_at' | 'updated_at'>>;
  default_environment?: string;
}

export class FeatureFlagManager {
  private flags = new Map<string, FeatureFlag>();
  private environment: string;
  private userId?: string;

  constructor(config?: FeatureFlagConfig, environment: string = 'development') {
    this.environment = environment;
    
    if (config) {
      this.loadFlags(config);
    } else {
      this.loadDefaultFlags();
    }
    
    logger.info('Feature flags initialized', { 
      environment: this.environment,
      flagCount: this.flags.size 
    });
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(flagName: string, userId?: string): boolean {
    const flag = this.flags.get(flagName);
    
    if (!flag) {
      logger.warn('Unknown feature flag requested', { flagName });
      return false;
    }

    // Check environment restrictions
    if (flag.environment && !flag.environment.includes(this.environment)) {
      return false;
    }

    // Simple enabled/disabled check
    if (!flag.enabled) {
      return false;
    }

    // Rollout percentage check
    if (flag.rollout_percentage !== undefined && flag.rollout_percentage < 100) {
      const userHash = this.hashString(userId || this.userId || 'anonymous');
      const percentage = userHash % 100;
      return percentage < flag.rollout_percentage;
    }

    return true;
  }

  /**
   * Get feature flag value
   */
  getValue<T extends FeatureFlagValue>(flagName: string, defaultValue: T, userId?: string): T {
    if (!this.isEnabled(flagName, userId)) {
      return defaultValue;
    }

    const flag = this.flags.get(flagName);
    return (flag?.value as T) ?? defaultValue;
  }

  /**
   * Enable a feature flag
   */
  enable(flagName: string): void {
    const flag = this.flags.get(flagName);
    if (flag) {
      flag.enabled = true;
      flag.updated_at = new Date().toISOString();
      logger.info('Feature flag enabled', { flagName });
    }
  }

  /**
   * Disable a feature flag
   */
  disable(flagName: string): void {
    const flag = this.flags.get(flagName);
    if (flag) {
      flag.enabled = false;
      flag.updated_at = new Date().toISOString();
      logger.info('Feature flag disabled', { flagName });
    }
  }

  /**
   * Set rollout percentage for gradual rollout
   */
  setRolloutPercentage(flagName: string, percentage: number): void {
    const flag = this.flags.get(flagName);
    if (flag) {
      flag.rollout_percentage = Math.max(0, Math.min(100, percentage));
      flag.updated_at = new Date().toISOString();
      logger.info('Feature flag rollout percentage updated', { 
        flagName, 
        percentage: flag.rollout_percentage 
      });
    }
  }

  /**
   * Set feature flag value
   */
  setValue(flagName: string, value: FeatureFlagValue): void {
    const flag = this.flags.get(flagName);
    if (flag) {
      flag.value = value;
      flag.updated_at = new Date().toISOString();
      logger.info('Feature flag value updated', { flagName, value });
    }
  }

  /**
   * Create a new feature flag
   */
  createFlag(
    name: string, 
    enabled: boolean, 
    description: string, 
    options?: {
      value?: FeatureFlagValue;
      environment?: string[];
      rolloutPercentage?: number;
    }
  ): void {
    const flag: FeatureFlag = {
      name,
      enabled,
      description,
      value: options?.value,
      environment: options?.environment,
      rollout_percentage: options?.rolloutPercentage,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.flags.set(name, flag);
    logger.info('Feature flag created', { name, enabled, description });
  }

  /**
   * Get all feature flags
   */
  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  /**
   * Get feature flag by name
   */
  getFlag(name: string): FeatureFlag | undefined {
    return this.flags.get(name);
  }

  /**
   * Load flags from configuration
   */
  private loadFlags(config: FeatureFlagConfig): void {
    const now = new Date().toISOString();
    
    for (const [name, flagConfig] of Object.entries(config.flags)) {
      const flag: FeatureFlag = {
        name,
        ...flagConfig,
        created_at: now,
        updated_at: now
      };
      
      this.flags.set(name, flag);
    }
  }

  /**
   * Load default feature flags for MCP CWP Server
   */
  private loadDefaultFlags(): void {
    const defaultFlags: Array<Omit<FeatureFlag, 'created_at' | 'updated_at'>> = [
      {
        name: 'enhanced_logging',
        enabled: true,
        description: 'Enable enhanced logging with detailed request/response tracking',
        environment: ['development', 'staging']
      },
      {
        name: 'cache_optimization',
        enabled: true,
        description: 'Enable advanced caching strategies',
        rollout_percentage: 100
      },
      {
        name: 'mock_mode',
        enabled: false,
        description: 'Enable mock responses when CWP API is unavailable',
        value: 'auto'
      },
      {
        name: 'performance_monitoring',
        enabled: false, // DISABLED: Evita consumo excessivo de recursos
        description: 'Enable detailed performance metrics collection',
        rollout_percentage: 90,
        value: { reportInterval: 600000 } // 10 min se ativado
      },
      {
        name: 'health_checks',
        enabled: false, // DISABLED: Evita consumo excessivo de recursos  
        description: 'Enable automatic health checks',
        value: { interval: 120000, timeout: 5000 } // 2 min se ativado
      },
      {
        name: 'retry_optimization',
        enabled: true,
        description: 'Enable intelligent retry logic optimization',
        value: { max_retries: 3, backoff: 'exponential' }
      },
      {
        name: 'defensive_queries',
        enabled: true,
        description: 'Enable defensive query processing',
        rollout_percentage: 100
      },
      {
        name: 'rate_limiting',
        enabled: false,
        description: 'Enable request rate limiting',
        value: { requests_per_minute: 60 }
      }
    ];

    const now = new Date().toISOString();
    
    for (const flagConfig of defaultFlags) {
      const flag: FeatureFlag = {
        ...flagConfig,
        created_at: now,
        updated_at: now
      };
      
      this.flags.set(flag.name, flag);
    }
  }

  /**
   * Simple string hashing for consistent user-based rollouts
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get feature flags status report
   */
  getStatusReport(): string {
    const flags = this.getAllFlags();
    const enabledCount = flags.filter(f => f.enabled).length;
    
    let report = '🏁 FEATURE FLAGS STATUS REPORT\n';
    report += '='.repeat(50) + '\n\n';
    report += `Environment: ${this.environment}\n`;
    report += `Total Flags: ${flags.length}\n`;
    report += `Enabled: ${enabledCount}\n`;
    report += `Disabled: ${flags.length - enabledCount}\n\n`;
    
    report += 'FLAGS DETAIL:\n';
    for (const flag of flags.sort((a, b) => a.name.localeCompare(b.name))) {
      const status = flag.enabled ? '✅' : '❌';
      const rollout = flag.rollout_percentage !== undefined ? ` (${flag.rollout_percentage}%)` : '';
      const envs = flag.environment ? ` [${flag.environment.join(', ')}]` : '';
      
      report += `${status} ${flag.name}${rollout}${envs}\n`;
      report += `   ${flag.description}\n`;
      
      if (flag.value !== undefined) {
        report += `   Value: ${JSON.stringify(flag.value)}\n`;
      }
      
      report += '\n';
    }
    
    return report;
  }
}

// Export singleton instance
export let featureFlagManager: FeatureFlagManager | null = null;

export function initializeFeatureFlags(
  config?: FeatureFlagConfig, 
  environment?: string
): FeatureFlagManager {
  const env = environment || process.env.NODE_ENV || 'development';
  featureFlagManager = new FeatureFlagManager(config, env);
  return featureFlagManager;
}

export function getFeatureFlags(): FeatureFlagManager | null {
  return featureFlagManager;
}

/**
 * Convenience function to check if a feature is enabled
 */
export function isFeatureEnabled(flagName: string, userId?: string): boolean {
  return featureFlagManager?.isEnabled(flagName, userId) ?? false;
}

/**
 * Convenience function to get a feature flag value
 */
export function getFeatureValue<T extends FeatureFlagValue>(
  flagName: string, 
  defaultValue: T, 
  userId?: string
): T {
  return featureFlagManager?.getValue(flagName, defaultValue, userId) ?? defaultValue;
}