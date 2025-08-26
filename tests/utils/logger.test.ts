// Simple logger test to verify it exists
describe('Logger', () => {
  it('should be mocked in tests', () => {
    const { logger } = require('../../src/utils/logger');
    
    expect(logger.info).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.debug).toBeDefined();
    
    expect(logger.info).toHaveBeenCalledTimes(0);
  });
});