/**
 * Feature Flags System - Enterprise Feature
 *
 * Provides dynamic feature control and rollback capabilities
 * for safe deployment and A/B testing in the MCP CWP Server.
 */
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
export declare class FeatureFlagManager {
    private flags;
    private environment;
    private userId?;
    constructor(config?: FeatureFlagConfig, environment?: string);
    /**
     * Check if a feature is enabled
     */
    isEnabled(flagName: string, userId?: string): boolean;
    /**
     * Get feature flag value
     */
    getValue<T extends FeatureFlagValue>(flagName: string, defaultValue: T, userId?: string): T;
    /**
     * Enable a feature flag
     */
    enable(flagName: string): void;
    /**
     * Disable a feature flag
     */
    disable(flagName: string): void;
    /**
     * Set rollout percentage for gradual rollout
     */
    setRolloutPercentage(flagName: string, percentage: number): void;
    /**
     * Set feature flag value
     */
    setValue(flagName: string, value: FeatureFlagValue): void;
    /**
     * Create a new feature flag
     */
    createFlag(name: string, enabled: boolean, description: string, options?: {
        value?: FeatureFlagValue;
        environment?: string[];
        rolloutPercentage?: number;
    }): void;
    /**
     * Get all feature flags
     */
    getAllFlags(): FeatureFlag[];
    /**
     * Get feature flag by name
     */
    getFlag(name: string): FeatureFlag | undefined;
    /**
     * Load flags from configuration
     */
    private loadFlags;
    /**
     * Load default feature flags for MCP CWP Server
     */
    private loadDefaultFlags;
    /**
     * Simple string hashing for consistent user-based rollouts
     */
    private hashString;
    /**
     * Get feature flags status report
     */
    getStatusReport(): string;
}
export declare let featureFlagManager: FeatureFlagManager | null;
export declare function initializeFeatureFlags(config?: FeatureFlagConfig, environment?: string): FeatureFlagManager;
export declare function getFeatureFlags(): FeatureFlagManager | null;
/**
 * Convenience function to check if a feature is enabled
 */
export declare function isFeatureEnabled(flagName: string, userId?: string): boolean;
/**
 * Convenience function to get a feature flag value
 */
export declare function getFeatureValue<T extends FeatureFlagValue>(flagName: string, defaultValue: T, userId?: string): T;
//# sourceMappingURL=feature-flags.d.ts.map