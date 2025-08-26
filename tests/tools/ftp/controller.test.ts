import { handleFtpTool } from '../../../src/tools/ftp/controller';
import { FtpService } from '../../../src/tools/ftp/service';
import { CwpClient } from '../../../src/core/client';

jest.mock('../../../src/tools/ftp/service');

describe('handleFtpTool', () => {
  let mockService: jest.Mocked<FtpService>;
  let mockClient: jest.Mocked<CwpClient>;

  beforeEach(() => {
    mockService = {
      updateFtpPermissions: jest.fn(),
    } as any;
    (FtpService as jest.MockedClass<typeof FtpService>).mockImplementation(() => mockService);
  });

  describe('cwp_ftp_update_permissions', () => {
    it('should return success message on successful update', async () => {
      mockService.updateFtpPermissions.mockResolvedValue({
        status: 'success',
        message: 'FTP permissions updated',
      } as any);

      const result = await handleFtpTool(
        'cwp_ftp_update_permissions',
        { user: 'testuser', username: 'ftpuser', path: '/new/path', quota: 100 },
        mockClient
      );

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain('FTP permissions updated successfully');
      expect(mockService.updateFtpPermissions).toHaveBeenCalledWith({
        user: 'testuser',
        username: 'ftpuser',
        path: '/new/path',
        quota: 100,
      });
    });

    it('should return error message on failed update', async () => {
      mockService.updateFtpPermissions.mockResolvedValue({
        status: 'error',
        message: 'Failed to update FTP permissions',
      } as any);

      const result = await handleFtpTool(
        'cwp_ftp_update_permissions',
        { user: 'testuser', username: 'ftpuser' },
        mockClient
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Failed to update FTP permissions');
    });
  });
});
