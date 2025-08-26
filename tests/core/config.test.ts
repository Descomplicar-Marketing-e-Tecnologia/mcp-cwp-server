import { getCwpConfig } from '../../src/core/config';

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getCwpConfig', () => {
    it('should load configuration from environment variables', () => {
      process.env.CWP_API_URL = 'https://test.example.com';
      process.env.CWP_API_KEY = 'test-key-123';
      process.env.CWP_SSL_VERIFY = 'false';
      process.env.CWP_DEBUG = 'true';
      process.env.CWP_PORT = '2304';

      const config = getCwpConfig();

      expect(config).toEqual({
        apiUrl: 'https://test.example.com',
        apiKey: 'test-key-123',
        sslVerify: false,
        debug: true,
        port: 2304,
      });
    });

    it('should use default values when environment variables are missing', () => {
      process.env.CWP_API_URL = 'https://minimal.example.com';
      process.env.CWP_API_KEY = 'minimal-key';
      delete process.env.CWP_SSL_VERIFY;
      delete process.env.CWP_DEBUG;
      delete process.env.CWP_PORT;

      const config = getCwpConfig();

      expect(config).toEqual({
        apiUrl: 'https://minimal.example.com',
        apiKey: 'minimal-key',
        sslVerify: false,
        debug: false,
        port: 2304,
      });
    });

    it('should throw error when required environment variables are missing', () => {
      delete process.env.CWP_API_URL;
      delete process.env.CWP_API_KEY;

      expect(() => getCwpConfig()).toThrow();
    });
  });
});