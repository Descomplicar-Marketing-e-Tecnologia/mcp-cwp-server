import { CwpClient } from '../../core/client.js';
import { CwpResponse } from '../../core/types.js';
import { AutosslListArgs, AutosslInstallArgs, AutosslRenewArgs, AutosslDeleteArgs } from './types.js';
export declare class AutosslService {
    private client;
    constructor(client: CwpClient);
    listSslCertificates(args?: AutosslListArgs): Promise<CwpResponse>;
    installSslCertificate(args: AutosslInstallArgs): Promise<CwpResponse>;
    deleteSslCertificate(args: AutosslDeleteArgs): Promise<CwpResponse>;
    renewSslCertificate(args: AutosslRenewArgs): Promise<CwpResponse>;
}
//# sourceMappingURL=service.d.ts.map