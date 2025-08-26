export class FtpService {
    client;
    constructor(client) {
        this.client = client;
    }
    async listFtpAccounts(args) {
        return await this.client.post('/ftp', {
            action: 'list',
            user: args.user,
        });
    }
    async createFtpAccount(args) {
        return await this.client.post('/ftp', {
            action: 'add',
            user: args.user,
            username: args.username,
            password: args.password,
            path: args.path,
            quota: args.quota,
        });
    }
    async deleteFtpAccount(args) {
        return await this.client.post('/ftp', {
            action: 'del',
            user: args.user,
            username: args.username,
        });
    }
}
//# sourceMappingURL=service.js.map