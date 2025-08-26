export function setupAutosslTools() {
    return [
        {
            name: 'cwp_autossl_install',
            description: 'Install SSL certificate for a domain',
            inputSchema: {
                type: 'object',
                properties: {
                    domain: { type: 'string', description: 'Domain name' },
                    email: { type: 'string', description: 'Contact email for certificate' },
                    force: { type: 'boolean', description: 'Force renewal if exists', default: false },
                },
                required: ['domain', 'email'],
            },
        },
        {
            name: 'cwp_autossl_renew',
            description: 'Renew SSL certificate for a domain',
            inputSchema: {
                type: 'object',
                properties: {
                    domain: { type: 'string', description: 'Domain name' },
                },
                required: ['domain'],
            },
        },
        {
            name: 'cwp_autossl_list',
            description: 'List all SSL certificates',
            inputSchema: {
                type: 'object',
                properties: {
                    domain: { type: 'string', description: 'Filter by domain (optional)' },
                },
                required: [],
            },
        },
        {
            name: 'cwp_autossl_delete',
            description: 'Delete SSL certificate for a domain',
            inputSchema: {
                type: 'object',
                properties: {
                    domain: { type: 'string', description: 'Domain name' },
                },
                required: ['domain'],
            },
        },
    ];
}
export { handleAutosslTool } from './controller.js';
//# sourceMappingURL=index.js.map