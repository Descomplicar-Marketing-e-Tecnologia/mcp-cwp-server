import { CwpClient } from '../../core/client.js';
import { CwpResponse } from '../../core/types.js';
import { UserMysqlListArgs } from './types.js';

export class UserMysqlService {
  constructor(private client: CwpClient) {}

  async listUserMysql(args: UserMysqlListArgs): Promise<CwpResponse> {
    return await this.client.post('/usermysql', {
      action: 'list',
      user: args.user,
    }, 'cwp_usermysql_list');
  }
}