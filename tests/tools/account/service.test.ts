import { AccountService } from '../../../src/tools/account/service';
import { CwpClient } from '../../../src/core/client';

jest.mock('../../../src/core/client');
jest.mock('../../../src/core/cache');
jest.mock('../../../src/utils/type-safety');
jest.mock('../../../src/utils/defensive-queries', () => ({
  processApiResponse: jest.fn(),
  safeArrayProcess: jest.fn(),
  mapCwpAccount: jest.fn()
}));

describe('AccountService', () => {
  let service: AccountService;
  let mockClient: jest.Mocked<CwpClient>;

  beforeEach(() => {
    mockClient = {
      post: jest.fn(),
      get: jest.fn(),
    } as any;
    
    (CwpClient as jest.MockedClass<typeof CwpClient>).mockImplementation(() => mockClient);
    service = new AccountService(mockClient);
  });

  describe('listAccounts', () => {
    it('should return list of accounts with defensive processing', async () => {
      const mockRawAccounts = [
        { domain: 'example.com', username: 'user1' },
        { domain: 'test.com', username: 'user2' },
      ];

      const mockProcessedAccounts = [
        {
          username: 'user1',
          domain: 'example.com', 
          email: 'noemail@unknown.com',
          package: 'default',
          status: 'unknown',
          created: expect.any(String),
          suspended: false,
          quota_used: 0,
          quota_limit: 0,
          bandwidth_used: 0,
          bandwidth_limit: 0,
        },
        {
          username: 'user2',
          domain: 'test.com',
          email: 'noemail@unknown.com', 
          package: 'default',
          status: 'unknown',
          created: expect.any(String),
          suspended: false,
          quota_used: 0,
          quota_limit: 0,
          bandwidth_used: 0,
          bandwidth_limit: 0,
        },
      ];

      const { processApiResponse, safeArrayProcess } = require('../../../src/utils/defensive-queries');
      
      processApiResponse.mockReturnValue({
        status: 'success',
        message: 'Success',
        data: mockRawAccounts,
        errors: [],
        count: 2
      });
      
      safeArrayProcess.mockReturnValue(mockProcessedAccounts);

      mockClient.post.mockResolvedValue({
        status: 'success',
        data: mockRawAccounts,
      });

      const result = await service.listAccounts();

      expect(result.status).toBe('success');
      expect(result.data).toEqual(mockProcessedAccounts);
      expect(mockClient.post).toHaveBeenCalledWith('/account', { action: 'list' });
    });

    it('should handle errors gracefully with defensive processing', async () => {
      mockClient.post.mockRejectedValue(new Error('Network error'));

      await expect(service.listAccounts()).rejects.toThrow('Network error');
    });
  });

  describe('createAccount', () => {
    it('should create account successfully', async () => {
      const accountData = {
        domain: 'newdomain.com',
        username: 'newuser',
        password: 'securepassword123',
        email: 'user@newdomain.com',
        package: 'basic',
      };

      mockClient.post.mockResolvedValue({
        status: 'success',
        data: { id: 123, ...accountData },
      });

      const result = await service.createAccount(accountData);

      expect(result).toEqual({
        status: 'success',
        data: { id: 123, ...accountData },
      });
      expect(mockClient.post).toHaveBeenCalledWith('/account', {
        action: 'add',
        ...accountData,
        autossl: '0',
        backup: '1',
      });
    });
  });

  describe('suspendAccount', () => {
    it('should suspend account successfully', async () => {
      mockClient.post.mockResolvedValue({
        status: 'success',
        data: { message: 'Account suspended' },
      });

      const result = await service.suspendAccount({ username: 'testuser' });

      expect(result).toEqual({
        status: 'success',
        data: { message: 'Account suspended' },
      });
      expect(mockClient.post).toHaveBeenCalledWith('/account', {
        action: 'susp',
        username: 'testuser',
        reason: 'Suspended via MCP',
      });
    });
  });

  describe('unsuspendAccount', () => {
    it('should unsuspend account successfully', async () => {
      mockClient.post.mockResolvedValue({
        status: 'success',
        data: { message: 'Account unsuspended' },
      });

      const result = await service.unsuspendAccount({ username: 'testuser' });

      expect(result).toEqual({
        status: 'success',
        data: { message: 'Account unsuspended' },
      });
      expect(mockClient.post).toHaveBeenCalledWith('/account', {
        action: 'unsp',
        username: 'testuser',
      });
    });
  });

  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      mockClient.post.mockResolvedValue({
        status: 'success',
        data: { message: 'Account deleted' },
      });

      const result = await service.deleteAccount({ username: 'testuser' });

      expect(result).toEqual({
        status: 'success',
        data: { message: 'Account deleted' },
      });
      expect(mockClient.post).toHaveBeenCalledWith('/account', {
        action: 'del',
        username: 'testuser',
      });
    });

  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      mockClient.post.mockResolvedValue({
        status: 'success',
        data: { message: 'Password reset' },
      });

      const result = await service.resetPassword({ username: 'testuser', password: 'newpassword123' });

      expect(result).toEqual({
        status: 'success',
        data: { message: 'Password reset' },
      });
      expect(mockClient.post).toHaveBeenCalledWith('/account', {
        action: 'changePassword',
        username: 'testuser',
        password: 'newpassword123',
      });
    });
  });

  describe('updateAccount', () => {
    it('should update account successfully', async () => {
      const updateData = {
        username: 'testuser',
        email: 'newemail@example.com',
        package: 'premium',
      };

      mockClient.post.mockResolvedValue({
        status: 'success',
        data: { message: 'Account updated' },
      });

      const result = await service.updateAccount(updateData);

      expect(result).toEqual({
        status: 'success',
        data: { message: 'Account updated' },
      });
      expect(mockClient.post).toHaveBeenCalledWith('/account', {
        action: 'udp',
        ...updateData,
      });
    });
  });

  describe('getAccountInfo', () => {
    it('should return account info', async () => {
      const accountInfo = {
        domain: 'example.com',
        username: 'testuser',
        email: 'user@example.com',
        package: 'basic',
        status: 'active',
      };

      mockClient.post.mockResolvedValue({
        status: 'success',
        data: accountInfo,
      });

      const result = await service.getAccountInfo({ username: 'testuser' });

      expect(result).toEqual({
        status: 'success',
        data: accountInfo,
      });
      expect(mockClient.post).toHaveBeenCalledWith('/account', {
        action: 'list',
        username: 'testuser',
      });
    });
  });
});