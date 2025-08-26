export function setupFtpTools() {
    return [
        {
            name: 'cwp:ftp:list',
            description: 'List all FTP accounts for a specific user',
            inputSchema: {
                type: 'object',
                properties: {
                    user: {
                        type: 'string',
                        description: 'Username of the account to list FTP accounts for',
                    },
                },
                required: ['user'],
            },
        },
        {
            name: 'cwp:ftp:create',
            description: 'Create a new FTP account for a user',
            inputSchema: {
                type: 'object',
                properties: {
                    user: {
                        type: 'string',
                        description: 'Username of the account',
                    },
                    username: {
                        type: 'string',
                        description: 'FTP username to create',
                    },
                    password: {
                        type: 'string',
                        description: 'FTP password (minimum 6 characters)',
                    },
                    path: {
                        type: 'string',
                        description: 'FTP root path (optional)',
                    },
                    quota: {
                        type: 'number',
                        description: 'Quota in MB (optional)',
                    },
                },
                required: ['user', 'username', 'password'],
            },
        },
        {
            name: 'cwp:ftp:delete',
            description: 'Delete an FTP account for a user',
            inputSchema: {
                type: 'object',
                properties: {
                    user: {
                        type: 'string',
                        description: 'Username of the account',
                    },
                    username: {
                        type: 'string',
                        description: 'FTP username to delete',
                    },
                },
                required: ['user', 'username'],
            },
        },
    ];
}
export { handleFtpTool } from './controller.js';
//# sourceMappingURL=index.js.map