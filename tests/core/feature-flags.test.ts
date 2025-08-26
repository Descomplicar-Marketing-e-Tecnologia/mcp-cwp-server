import { 
  FeatureFlagManager, 
  initializeFeatureFlags, 
  isFeatureEnabled, 
  getFeatureValue 
} from '../../src/core/feature-flags';

jest.mock('../../src/utils/logger');

describe('FeatureFlagManager', () => {
  let manager: FeatureFlagManager;

  beforeEach(() => {
    manager = new FeatureFlagManager();
  });

  describe('basic flag operations', () => {
    it('should create flag correctly', () => {
      manager.createFlag('test_flag', true, 'Test flag for testing');

      const flag = manager.getFlag('test_flag');
      
      expect(flag).not.toBeUndefined();
      expect(flag!.name).toBe('test_flag');
      expect(flag!.enabled).toBe(true);
      expect(flag!.description).toBe('Test flag for testing');
    });

    it('should check if flag is enabled', () => {
      manager.createFlag('enabled_flag', true, 'Enabled flag');
      manager.createFlag('disabled_flag', false, 'Disabled flag');

      expect(manager.isEnabled('enabled_flag')).toBe(true);
      expect(manager.isEnabled('disabled_flag')).toBe(false);
      expect(manager.isEnabled('nonexistent_flag')).toBe(false);
    });

    it('should enable and disable flags', () => {
      manager.createFlag('toggle_flag', false, 'Toggle flag');
      
      expect(manager.isEnabled('toggle_flag')).toBe(false);
      
      manager.enable('toggle_flag');
      expect(manager.isEnabled('toggle_flag')).toBe(true);
      
      manager.disable('toggle_flag');
      expect(manager.isEnabled('toggle_flag')).toBe(false);
    });

    it('should get flag values', () => {
      manager.createFlag('value_flag', true, 'Flag with value', {
        value: { timeout: 5000, retries: 3 }
      });

      const value = manager.getValue('value_flag', { timeout: 1000, retries: 1 });
      
      expect(value).toEqual({ timeout: 5000, retries: 3 });
    });

    it('should return default value for disabled flags', () => {
      manager.createFlag('disabled_value_flag', false, 'Disabled flag', {
        value: 'should_not_get_this'
      });

      const value = manager.getValue('disabled_value_flag', 'default_value');
      
      expect(value).toBe('default_value');
    });
  });

  describe('environment restrictions', () => {
    it('should respect environment restrictions', () => {
      manager = new FeatureFlagManager(undefined, 'production');
      
      manager.createFlag('dev_only_flag', true, 'Development only flag', {
        environment: ['development', 'staging']
      });

      expect(manager.isEnabled('dev_only_flag')).toBe(false);
    });

    it('should allow flags in correct environment', () => {
      manager = new FeatureFlagManager(undefined, 'development');
      
      manager.createFlag('dev_flag', true, 'Development flag', {
        environment: ['development', 'staging']
      });

      expect(manager.isEnabled('dev_flag')).toBe(true);
    });
  });

  describe('rollout percentage', () => {
    it('should respect rollout percentage', () => {
      manager.createFlag('rollout_flag', true, 'Rollout flag', {
        rolloutPercentage: 0
      });

      // With 0% rollout, should always be false
      expect(manager.isEnabled('rollout_flag', 'user1')).toBe(false);
      expect(manager.isEnabled('rollout_flag', 'user2')).toBe(false);
    });

    it('should allow 100% rollout', () => {
      manager.createFlag('full_rollout_flag', true, 'Full rollout flag', {
        rolloutPercentage: 100
      });

      expect(manager.isEnabled('full_rollout_flag', 'user1')).toBe(true);
      expect(manager.isEnabled('full_rollout_flag', 'user2')).toBe(true);
    });

    it('should set rollout percentage', () => {
      manager.createFlag('percentage_flag', true, 'Percentage flag');
      
      manager.setRolloutPercentage('percentage_flag', 50);
      
      const flag = manager.getFlag('percentage_flag');
      expect(flag!.rollout_percentage).toBe(50);
    });

    it('should clamp rollout percentage to valid range', () => {
      manager.createFlag('clamp_flag', true, 'Clamp flag');
      
      manager.setRolloutPercentage('clamp_flag', 150);
      expect(manager.getFlag('clamp_flag')!.rollout_percentage).toBe(100);
      
      manager.setRolloutPercentage('clamp_flag', -10);
      expect(manager.getFlag('clamp_flag')!.rollout_percentage).toBe(0);
    });
  });

  describe('setValue', () => {
    it('should update flag value', () => {
      manager.createFlag('config_flag', true, 'Config flag', {
        value: { setting: 'old_value' }
      });

      manager.setValue('config_flag', { setting: 'new_value' });

      const value = manager.getValue('config_flag', {});
      expect(value).toEqual({ setting: 'new_value' });
    });
  });

  describe('getAllFlags', () => {
    it('should return all flags', () => {
      manager.createFlag('flag1', true, 'First flag');
      manager.createFlag('flag2', false, 'Second flag');

      const flags = manager.getAllFlags();

      expect(flags).toHaveLength(10); // 8 default + 2 created
      expect(flags.some(f => f.name === 'flag1')).toBe(true);
      expect(flags.some(f => f.name === 'flag2')).toBe(true);
    });
  });

  describe('default flags', () => {
    it('should load default flags', () => {
      const flags = manager.getAllFlags();

      expect(flags.some(f => f.name === 'enhanced_logging')).toBe(true);
      expect(flags.some(f => f.name === 'cache_optimization')).toBe(true);
      expect(flags.some(f => f.name === 'performance_monitoring')).toBe(true);
      expect(flags.some(f => f.name === 'health_checks')).toBe(true);
    });

    it('should have correct default flag states', () => {
      expect(manager.isEnabled('cache_optimization')).toBe(true);
      expect(manager.isEnabled('performance_monitoring')).toBe(true);
      expect(manager.isEnabled('health_checks')).toBe(true);
      expect(manager.isEnabled('mock_mode')).toBe(false);
    });
  });

  describe('status report', () => {
    it('should generate status report', () => {
      manager.createFlag('test_flag', true, 'Test flag');

      const report = manager.getStatusReport();

      expect(typeof report).toBe('string');
      expect(report).toContain('FEATURE FLAGS STATUS REPORT');
      expect(report).toContain('test_flag');
      expect(report).toMatch(/Total Flags: \d+/);
      expect(report).toMatch(/Enabled: \d+/);
      expect(report).toMatch(/Disabled: \d+/);
    });
  });

  describe('configuration loading', () => {
    it('should load flags from configuration', () => {
      const config = {
        flags: {
          'custom_flag': {
            enabled: true,
            description: 'Custom flag from config',
            value: 'custom_value'
          }
        }
      };

      manager = new FeatureFlagManager(config);

      expect(manager.isEnabled('custom_flag')).toBe(true);
      expect(manager.getValue('custom_flag', 'default')).toBe('custom_value');
    });
  });
});

describe('global functions', () => {
  beforeEach(() => {
    initializeFeatureFlags();
  });

  it('should initialize feature flags globally', () => {
    expect(isFeatureEnabled('cache_optimization')).toBe(true);
    // Mock mode flag is disabled by default, so should return default value
    const mockValue = getFeatureValue('mock_mode', 'default');
    expect(mockValue).toBe('default');
  });

  it('should return false/default when not initialized', () => {
    // Reset global instance
    require('../../src/core/feature-flags').featureFlagManager = null;

    expect(isFeatureEnabled('any_flag')).toBe(false);
    expect(getFeatureValue('any_flag', 'default_value')).toBe('default_value');
  });
});