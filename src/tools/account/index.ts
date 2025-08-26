import { Tool } from '@modelcontextprotocol/sdk/types.js';

export function setupAccountTools(): Tool[] {
  return [
    {
      name: 'cwp_account_create',
      description: 'Create a new CWP account with domain, username, and package',
      inputSchema: {
        type: 'object',
        properties: {
          domain: {
            type: 'string',
            description: 'Primary domain for the account',
          },
          username: {
            type: 'string',
            description: 'Username for the account',
          },
          password: {
            type: 'string',
            description: 'Password for the account (minimum 8 characters)',
          },
          email: {
            type: 'string',
            description: 'Email address for the account',
          },
          package: {
            type: 'string',
            description: 'Hosting package name',
          },
          server_ips: {
            type: 'string',
            description: 'Server IPs (optional)',
          },
          inode: {
            type: 'number',
            description: 'Inode limit (optional)',
          },
          limit_nproc: {
            type: 'number',
            description: 'Process limit (optional)',
          },
          limit_nofile: {
            type: 'number',
            description: 'File limit (optional)',
          },
          autossl: {
            type: 'boolean',
            description: 'Enable AutoSSL (default: false)',
            default: false,
          },
          backup: {
            type: 'boolean',
            description: 'Enable backup (default: true)',
            default: true,
          },
        },
        required: ['domain', 'username', 'password', 'email', 'package'],
      },
    },
    {
      name: 'cwp_account_update',
      description: 'Update an existing CWP account',
      inputSchema: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            description: 'Username of the account to update',
          },
          package: {
            type: 'string',
            description: 'New hosting package name (optional)',
          },
          email: {
            type: 'string',
            description: 'New email address (optional)',
          },
          quota: {
            type: 'number',
            description: 'Disk quota in MB (optional)',
          },
          bandwidth: {
            type: 'number',
            description: 'Bandwidth limit in MB (optional)',
          },
          autossl: {
            type: 'boolean',
            description: 'Enable/disable AutoSSL (optional)',
          },
          backup: {
            type: 'boolean',
            description: 'Enable/disable backup (optional)',
          },
        },
        required: ['username'],
      },
    },
    {
      name: 'cwp_account_delete',
      description: 'Delete a CWP account permanently',
      inputSchema: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            description: 'Username of the account to delete',
          },
        },
        required: ['username'],
      },
    },
    {
      name: 'cwp_account_suspend',
      description: 'Suspend a CWP account',
      inputSchema: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            description: 'Username of the account to suspend',
          },
          reason: {
            type: 'string',
            description: 'Reason for suspension (optional)',
          },
        },
        required: ['username'],
      },
    },
    {
      name: 'cwp_account_unsuspend',
      description: 'Unsuspend a CWP account',
      inputSchema: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            description: 'Username of the account to unsuspend',
          },
        },
        required: ['username'],
      },
    },
    {
      name: 'cwp_account_reset_password',
      description: 'Reset password for a CWP account',
      inputSchema: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            description: 'Username of the account',
          },
          password: {
            type: 'string',
            description: 'New password (minimum 8 characters)',
          },
        },
        required: ['username', 'password'],
      },
    },
    {
      name: 'cwp_account_info',
      description: 'Get detailed information about a CWP account',
      inputSchema: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            description: 'Username of the account',
          },
        },
        required: ['username'],
      },
    },
    {
      name: 'cwp_account_list',
      description: 'List all CWP accounts with optional filtering',
      inputSchema: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Maximum number of accounts to return (optional)',
          },
          offset: {
            type: 'number',
            description: 'Number of accounts to skip (optional)',
          },
          search: {
            type: 'string',
            description: 'Search term to filter accounts (optional)',
          },
        },
        required: [],
      },
    },
    {
      name: 'cwp_account_quota_check',
      description: 'Check disk and bandwidth quota for a CWP account',
      inputSchema: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            description: 'Username of the account to check',
          },
        },
        required: ['username'],
      },
    },
    {
      name: 'cwp_account_metadata',
      description: 'Get metadata for a CWP account (domain, email, status, etc.)',
      inputSchema: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            description: 'Username of the account to get metadata for',
          },
        },
        required: ['username'],
      },
    },
  ];
}

export { handleAccountTool } from './controller.js';
