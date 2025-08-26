export function setupPackageTools() {
    return [
        {
            name: 'cwp:package:list',
            description: 'List all hosting package templates',
            inputSchema: {
                type: 'object',
                properties: {},
                required: [],
            },
        },
    ];
}
export { handlePackageTool } from './controller.js';
//# sourceMappingURL=index.js.map