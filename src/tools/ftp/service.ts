import { CwpClient } from '../../core/client.js';
import { CwpResponse } from '../../core/types.js';
import { FtpListArgs, FtpCreateArgs, FtpDeleteArgs, FtpUpdatePermissionsArgs } from './types.js';

export class FtpService {
  constructor(private client: CwpClient) {}

  async listFtpAccounts(args: FtpListArgs): Promise<CwpResponse> {
    return await this.client.post('/ftp', {
      action: 'list',
      user: args.user,
    });
  }

  async createFtpAccount(args: FtpCreateArgs): Promise<CwpResponse> {
    return await this.client.post('/ftp', {
      action: 'add',
      user: args.user,
      username: args.username,
      password: args.password,
      path: args.path,
      quota: args.quota,
    });
  }

  async deleteFtpAccount(args: FtpDeleteArgs): Promise<CwpResponse> {
    return await this.client.post('/ftp', {
      action: 'del',
      user: args.user,
      username: args.username,
    });
  }

  async updateFtpPermissions(args: FtpUpdatePermissionsArgs): Promise<CwpResponse> {
    const data: Record<string, any> = {
      action: 'udp',
      user: args.user,
      username: args.username,
    };

    if (args.path !== undefined) data.path = args.path;
    if (args.quota !== undefined) data.quota = String(args.quota);

    return await this.client.post('/ftp', data);
  }
}