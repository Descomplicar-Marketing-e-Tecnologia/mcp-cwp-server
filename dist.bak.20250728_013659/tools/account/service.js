export class AccountService {
    client;
    constructor(client) {
        this.client = client;
    }
    async createAccount(args) {
        return await this.client.post('/account', {
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
    }
    async updateAccount(args) {
        const data = {
            action: 'udp',
            username: args.username,
        };
        if (args.package)
            data.package = args.package;
        if (args.email)
            data.email = args.email;
        if (args.quota)
            data.quota = args.quota;
        if (args.bandwidth)
            data.bandwidth = args.bandwidth;
        if (args.autossl !== undefined)
            data.autossl = args.autossl ? '1' : '0';
        if (args.backup !== undefined)
            data.backup = args.backup ? '1' : '0';
        return await this.client.post('/account', data);
    }
    async deleteAccount(args) {
        return await this.client.post('/account', {
            action: 'del',
            username: args.username,
        });
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
        return await this.client.post('/account', {
            action: 'list',
            username: args.username,
        });
    }
    async listAccounts(args = {}) {
        const params = {
            action: 'list',
        };
        if (args.limit)
            params.limit = args.limit;
        if (args.offset)
            params.offset = args.offset;
        if (args.search)
            params.search = args.search;
        return await this.client.post('/account', params);
    }
}
//# sourceMappingURL=service.js.map