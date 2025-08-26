import { CwpAuth } from '../../src/core/auth';
import { CwpClient } from '../../src/core/client';
import { CwpConfig } from '../../src/core/types';

jest.mock('../../src/core/client');

describe('CwpAuth', () => {
  let auth: CwpAuth;
  let mockClient: jest.Mocked<CwpClient>;
  const mockConfig: CwpConfig = {
    apiUrl: 'https://test.cwp.com',
    apiKey: 'test-api-key',
    sslVerify: false,
    debug: false,
    port: 2304,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      post: jest.fn(),
      get: jest.fn(),
    } as any;
    (CwpClient as jest.MockedClass<typeof CwpClient>).mockImplementation(() => mockClient);
    auth = new CwpAuth(mockConfig);
  });

  describe('validateApiKey', () => {
    it('should return true when API key is valid', async () => {
      mockClient.post.mockResolvedValue({
        status: 'success',
        data: { accounts: [] },
      });

      const result = await auth.validateApiKey();

      expect(result).toBe(true);
      expect(mockClient.post).toHaveBeenCalledWith('/account', { action: 'list' });
    });

    it('should return false when API key is invalid', async () => {
      mockClient.post.mockResolvedValue({
        status: 'error',
        message: 'Invalid API key',
      });

      const result = await auth.validateApiKey();

      expect(result).toBe(false);
    });

    it('should return false when request fails', async () => {
      mockClient.post.mockRejectedValue(new Error('Network error'));

      const result = await auth.validateApiKey();

      expect(result).toBe(false);
    });
  });

  describe('testConnection', () => {
    it('should return connected true when connection succeeds', async () => {
      mockClient.post.mockResolvedValue({
        status: 'success',
        data: { version: '1.0.0', accounts: [] },
      });

      const result = await auth.testConnection();

      expect(result).toEqual({
        connected: true,
        version: '1.0.0',
      });
    });

    it('should return connected false with error when request fails', async () => {
      mockClient.post.mockResolvedValue({
        status: 'error',
        message: 'Authentication failed',
      });

      const result = await auth.testConnection();

      expect(result).toEqual({
        connected: false,
        error: 'Authentication failed',
      });
    });

    it('should handle exceptions gracefully', async () => {
      const error = new Error('Connection timeout');
      mockClient.post.mockRejectedValue(error);

      const result = await auth.testConnection();

      expect(result).toEqual({
        connected: false,
        error: 'Connection timeout',
      });
    });
  });

  describe('getClient', () => {
    it('should return the CwpClient instance', () => {
      const client = auth.getClient();
      expect(client).toBe(mockClient);
    });
  });
});