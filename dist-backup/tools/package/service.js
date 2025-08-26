export class PackageService {
    client;
    constructor(client) {
        this.client = client;
    }
    async listPackages(args = {}) {
        return await this.client.post('/packages', {
            action: 'list',
        });
    }
}
//# sourceMappingURL=service.js.map