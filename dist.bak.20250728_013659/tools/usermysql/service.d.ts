import { CwpClient } from '../../core/client.js';
import { CwpResponse } from '../../core/types.js';
import { UserMysqlListArgs } from './types.js';
export declare class UserMysqlService {
    private client;
    constructor(client: CwpClient);
    listUserMysql(args: UserMysqlListArgs): Promise<CwpResponse>;
}
//# sourceMappingURL=service.d.ts.map