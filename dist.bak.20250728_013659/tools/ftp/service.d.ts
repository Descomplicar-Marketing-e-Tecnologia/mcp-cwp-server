import { CwpClient } from '../../core/client.js';
import { CwpResponse } from '../../core/types.js';
import { FtpListArgs, FtpCreateArgs, FtpDeleteArgs } from './types.js';
export declare class FtpService {
    private client;
    constructor(client: CwpClient);
    listFtpAccounts(args: FtpListArgs): Promise<CwpResponse>;
    createFtpAccount(args: FtpCreateArgs): Promise<CwpResponse>;
    deleteFtpAccount(args: FtpDeleteArgs): Promise<CwpResponse>;
}
//# sourceMappingURL=service.d.ts.map