import { Tool } from '@modelcontextprotocol/sdk/types.js';

export function setupFtpTools(): Tool[] {
  return [
    {
      name: 'cwp_ftp_list',
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
      name: 'cwp_ftp_create',
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
      name: 'cwp_ftp_delete',
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
    {
      name: 'cwp_ftp_update_permissions',
      description: 'Update FTP account permissions (path or quota)',
      inputSchema: {
        type: 'object',
        properties: {
          user: {
            type: 'string',
            description: 'Username of the account',
          },
          username: {
            type: 'string',
            description: 'FTP username to update',
          },
          path: {
            type: 'string',
            description: 'New FTP root path (optional)',
          },
          quota: {
            type: 'number',
            description: 'New quota in MB (optional)',
          },
        },
        required: ['user', 'username'],
      },
    },
  ];
}

export { handleFtpTool } from './controller.js';