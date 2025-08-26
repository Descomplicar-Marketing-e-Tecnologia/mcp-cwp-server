import { AccountService } from '../../../src/tools/account/service.js';
import { CwpClient } from '../../../src/core/client.js';
import { cache, cacheKeys } from '../../../src/core/cache.js';

// Mock dependencies
jest.mock('../../../src/core/client.js');
jest.mock('../../../src/core/cache.js');

const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  clearPattern: jest.fn(),
} as any;

(cache as any) = mockCache;

describe('AccountService', () => {
  let service: AccountService;
  let mockClient: jest.Mocked<CwpClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      post: jest.fn(),
    } as any;
    service = new AccountService(mockClient);
  });

  describe('createAccount', () => {
    it('should create account with required fields', async () => {
      const mockResponse = { status: 'success', data: { id: 1 } };
      mockClient.post.mockResolvedValue(mockResponse);

      const args = {
        domain: 'example.com',
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        package: 'basic',
      };

      const result = await service.createAccount(args);

      expect(mockClient.post).toHaveBeenCalledWith('/account', {
        action: 'add',
        domain: 'example.com',
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        package: 'basic',
        server_ips: undefined,
        inode: undefined,
        limit_nproc: undefined,
        limit_nofile: undefined,
        autossl: '0',
        backup: '1',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should invalidate cache on successful create', async () => {
      const mockResponse = { status: 'success', data: { id: 1 } };
      mockClient.post.mockResolvedValue(mockResponse);

      await service.createAccount({
        domain: 'example.com',
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        package: 'basic',
      });

      expect(cache.clearPattern).toHaveBeenCalledWith(/^account:list:/);
    });
  });

  describe('listAccounts', () => {
    it('should return cached data if available', async () => {
      const cachedData = { status: 'success', data: [] };
      (cache.get as jest.Mock).mockReturnValue(cachedData);

      const result = await service.listAccounts();

      expect(cache.get).toHaveBeenCalled();
      expect(mockClient.post).not.toHaveBeenCalled();
      expect(result).toEqual(cachedData);
    });

    it('should fetch and cache data if not cached', async () => {
      const mockResponse = { status: 'success', data: [] };
      (cache.get as jest.Mock).mockReturnValue(null);
      mockClient.post.mockResolvedValue(mockResponse);

      const result = await service.listAccounts({ limit: 10 });

      expect(mockClient.post).toHaveBeenCalledWith('/account', {
        action: 'list',
        limit: '10',
      });
      expect(cache.set).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should use explicit type conversion for parameters', async () => {
      (cache.get as jest.Mock).mockReturnValue(null);
      mockClient.post.mockResolvedValue({ status: 'success', data: [] });

      await service.listAccounts({
        limit: 10,
        offset: 20,
        search: 'test',
      });

      expect(mockClient.post).toHaveBeenCalledWith('/account', {
        action: 'list',
        limit: '10',
        offset: '20',
        search: 'test',
      });
    });
  });

  describe('updateAccount', () => {
    it('should convert all fields to strings', async () => {
      const mockResponse = { status: 'success' };
      mockClient.post.mockResolvedValue(mockResponse);

      await service.updateAccount({
        username: 'testuser',
        quota: 1000,
        bandwidth: 2000,
        autossl: true,
        backup: false,
      });

      expect(mockClient.post).toHaveBeenCalledWith('/account', {
        action: 'udp',
        username: 'testuser',
        quota: '1000',
        bandwidth: '2000',
        autossl: '1',
        backup: '0',
      });
    });

    it('should invalidate cache on successful update', async () => {
      const mockResponse = { status: 'success' };
      mockClient.post.mockResolvedValue(mockResponse);

      await service.updateAccount({ username: 'testuser' });

      expect(mockCache.delete).toHaveBeenCalledWith(cacheKeys.account('testuser'));
      expect(mockCache.clearPattern).toHaveBeenCalledWith(/^account:list:/);
    });
  });

  describe('deleteAccount', () => {
    it('should delete account and invalidate cache', async () => {
      const mockResponse = { status: 'success' };
      mockClient.post.mockResolvedValue(mockResponse);

      await service.deleteAccount({ username: 'testuser' });

      expect(mockClient.post).toHaveBeenCalledWith('/account', {
        action: 'del',
        username: 'testuser',
      });
      expect(mockCache.delete).toHaveBeenCalledWith(cacheKeys.account('testuser'));
      expect(mockCache.clearPattern).toHaveBeenCalledWith(/^account:list:/);
    });
  });
});