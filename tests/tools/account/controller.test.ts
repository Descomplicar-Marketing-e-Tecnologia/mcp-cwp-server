import { handleAccountTool } from '../../../src/tools/account/controller';
import { AccountService } from '../../../src/tools/account/service';
import { CwpClient } from '../../../src/core/client';

jest.mock('../../../src/tools/account/service');

describe('handleAccountTool', () => {
  let mockService: jest.Mocked<AccountService>;
  let mockClient: jest.Mocked<CwpClient>;

  const mockAccount = {
    id: '123',
    username: 'testuser',
    domain: 'test.com',
    email: 'test@test.com',
    package_id: '456',
    disk_usage: '500',
    disk_limit: '1000',
    bw_usage: '2000',
    bw_limit: '5000',
    status: 'active',
  };

  beforeEach(() => {
    mockService = {
      getAccountInfo: jest.fn(),
    } as any;
    (AccountService as jest.MockedClass<typeof AccountService>).mockImplementation(() => mockService);
  });

  describe('cwp_account_quota_check', () => {
    it('should return formatted quota information', async () => {
      mockService.getAccountInfo.mockResolvedValue({
        status: 'success',
        data: [mockAccount],
      } as any);

      const result = await handleAccountTool('cwp_account_quota_check', { username: 'testuser' }, mockClient);

      const expectedQuota = {
        disk_usage: '500',
        disk_limit: '1000',
        bw_usage: '2000',
        bw_limit: '5000',
      };

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain(JSON.stringify(expectedQuota, null, 2));
      expect(mockService.getAccountInfo).toHaveBeenCalledWith({ username: 'testuser' });
    });
  });

  describe('cwp_account_metadata', () => {
    it('should return formatted metadata', async () => {
      mockService.getAccountInfo.mockResolvedValue({
        status: 'success',
        data: [mockAccount],
      } as any);

      const result = await handleAccountTool('cwp_account_metadata', { username: 'testuser' }, mockClient);

      const expectedMetadata = {
        id: '123',
        username: 'testuser',
        domain: 'test.com',
        email: 'test@test.com',
        package_id: '456',
        status: 'active',
      };

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain(JSON.stringify(expectedMetadata, null, 2));
      expect(mockService.getAccountInfo).toHaveBeenCalledWith({ username: 'testuser' });
    });
  });
});
