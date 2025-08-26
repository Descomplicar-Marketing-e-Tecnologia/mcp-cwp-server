import { CwpClient } from '../../core/client.js';
import { CwpResponse } from '../../core/types.js';
import { PackageListArgs } from './types.js';
export declare class PackageService {
    private client;
    constructor(client: CwpClient);
    listPackages(args?: PackageListArgs): Promise<CwpResponse>;
}
//# sourceMappingURL=service.d.ts.map