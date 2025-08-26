export function setupAutosslTools() {
    return [
        {
            name: 'cwp:autossl:install',
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
            name: 'cwp:autossl:renew',
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
            name: 'cwp:autossl:list',
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
            name: 'cwp:autossl:delete',
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