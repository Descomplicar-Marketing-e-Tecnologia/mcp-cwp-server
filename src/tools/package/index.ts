import { Tool } from '@modelcontextprotocol/sdk/types.js';

export function setupPackageTools(): Tool[] {
  return [
    {
      name: 'cwp_package_list',
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