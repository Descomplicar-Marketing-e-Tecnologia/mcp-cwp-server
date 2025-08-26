export function setupUserMysqlTools() {
    return [
        {
            name: 'cwp:usermysql:list',
            description: 'List all MySQL databases for a specific user',
            inputSchema: {
                type: 'object',
                properties: {
                    user: {
                        type: 'string',
                        description: 'Username of the account to list MySQL databases for',
                    },
                },
                required: ['user'],
            },
        },
    ];
}
export { handleUserMysqlTool } from './controller.js';
//# sourceMappingURL=index.js.map