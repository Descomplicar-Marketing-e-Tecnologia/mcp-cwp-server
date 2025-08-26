export class AutosslService {
    client;
    constructor(client) {
        this.client = client;
    }
    async listSslCertificates(args = {}) {
        return await this.client.post('/autossl', {
            action: 'list',
        });
    }
    async installSslCertificate(args) {
        return await this.client.post('/autossl', {
            action: 'add',
            user: args.user,
            domain: args.domain,
        });
    }
    async deleteSslCertificate(args) {
        return await this.client.post('/autossl', {
            action: 'del',
            domain: args.domain,
        });
    }
    async renewSslCertificate(args) {
        return await this.client.post('/autossl', {
            action: 'renew',
            domain: args.domain,
        });
    }
}
//# sourceMappingURL=service.js.map