export class UserMysqlService {
    client;
    constructor(client) {
        this.client = client;
    }
    async listUserMysql(args) {
        return await this.client.post('/usermysql', {
            action: 'list',
            user: args.user,
        });
    }
}
//# sourceMappingURL=service.js.map