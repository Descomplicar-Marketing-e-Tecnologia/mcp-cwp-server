import { CwpClient } from '../../core/client.js';
import { CwpResponse } from '../../core/types.js';
import { AccountCreateArgs, AccountUpdateArgs, AccountDeleteArgs, AccountSuspendArgs, AccountPasswordResetArgs, AccountInfoArgs, AccountListArgs } from './types.js';
export declare class AccountService {
    private client;
    constructor(client: CwpClient);
    createAccount(args: AccountCreateArgs): Promise<CwpResponse>;
    updateAccount(args: AccountUpdateArgs): Promise<CwpResponse>;
    deleteAccount(args: AccountDeleteArgs): Promise<CwpResponse>;
    suspendAccount(args: AccountSuspendArgs): Promise<CwpResponse>;
    unsuspendAccount(args: AccountSuspendArgs): Promise<CwpResponse>;
    resetPassword(args: AccountPasswordResetArgs): Promise<CwpResponse>;
    getAccountInfo(args: AccountInfoArgs): Promise<CwpResponse>;
    listAccounts(args?: AccountListArgs): Promise<CwpResponse>;
}
//# sourceMappingURL=service.d.ts.map