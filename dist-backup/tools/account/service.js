import { cache, cacheKeys, cacheTTL } from '../../core/cache.js';
import { safeStringEquals } from '../../utils/type-safety.js';
import { processApiResponse, mapCwpAccount, safeArrayProcess } from '../../utils/defensive-queries.js';
export class AccountService {
    client;
    constructor(client) {
        this.client = client;
    }
    async createAccount(args) {
        const result = await this.client.post('/account', {
            action: 'add',
            domain: args.domain,
            username: args.username,
            password: args.password,
            email: args.email,
            package: args.package,
            server_ips: args.server_ips,
            inode: args.inode,
            limit_nproc: args.limit_nproc,
            limit_nofile: args.limit_nofile,
            autossl: (args.autossl ?? false) ? '1' : '0',
            backup: (args.backup ?? true) ? '1' : '0',
        });
        // Invalidate cache on create
        if (result.status === 'success') {
            cache.clearPattern(/^account:list:/);
        }
        return result;
    }
    async updateAccount(args) {
        const data = {
            action: 'udp',
            username: args.username,
        };
        // MCP Guide: Explicit type conversion
        if (args.package !== undefined)
            data.package = String(args.package);
        if (args.email !== undefined)
            data.email = String(args.email);
        if (args.quota !== undefined)
            data.quota = String(args.quota);
        if (args.bandwidth !== undefined)
            data.bandwidth = String(args.bandwidth);
        if (args.autossl !== undefined)
            data.autossl = String(args.autossl ? '1' : '0');
        if (args.backup !== undefined)
            data.backup = String(args.backup ? '1' : '0');
        const result = await this.client.post('/account', data);
        // Invalidate cache on update
        if (result.status === 'success') {
            cache.delete(cacheKeys.account(args.username));
            cache.clearPattern(/^account:list:/);
        }
        return result;
    }
    async deleteAccount(args) {
        const result = await this.client.post('/account', {
            action: 'del',
            username: args.username,
        });
        // Invalidate cache on delete
        if (result.status === 'success') {
            cache.delete(cacheKeys.account(args.username));
            cache.clearPattern(/^account:list:/);
        }
        return result;
    }
    async suspendAccount(args) {
        return await this.client.post('/account', {
            action: 'susp',
            username: args.username,
            reason: args.reason || 'Suspended via MCP',
        });
    }
    async unsuspendAccount(args) {
        return await this.client.post('/account', {
            action: 'unsp',
            username: args.username,
        });
    }
    async resetPassword(args) {
        return await this.client.post('/account', {
            action: 'changePassword',
            username: args.username,
            password: args.password,
        });
    }
    async getAccountInfo(args) {
        // Check cache first
        const cacheKey = cacheKeys.account(args.username);
        const cached = cache.get(cacheKey);
        if (cached) {
            return cached;
        }
        const result = await this.client.post('/account', {
            action: 'list',
            username: args.username,
        });
        // Cache successful results
        if (result.status === 'success') {
            cache.set(cacheKey, result, cacheTTL.medium);
        }
        return result;
    }
    async listAccounts(args = {}) {
        // Check cache first
        const cacheKey = cacheKeys.accountList(args);
        const cached = cache.get(cacheKey);
        if (cached) {
            return cached;
        }
        const params = {
            action: 'list',
        };
        // MCP Guide: Explicit type conversion for all comparisons
        if (args.limit !== undefined)
            params.limit = String(args.limit);
        if (args.offset !== undefined)
            params.offset = String(args.offset);
        if (args.search !== undefined)
            params.search = String(args.search);
        const rawResult = await this.client.post('/account', params);
        // MCP Guide CRITICAL RULE #4: Defensive processing
        const processedResponse = processApiResponse(rawResult);
        const safeData = safeArrayProcess(processedResponse.data, mapCwpAccount, []);
        const result = {
            ...rawResult,
            data: safeData
        };
        // Cache successful results
        if (safeStringEquals(result.status, 'success')) {
            cache.set(cacheKey, result, cacheTTL.short);
        }
        return result;
    }
}
//# sourceMappingURL=service.js.map