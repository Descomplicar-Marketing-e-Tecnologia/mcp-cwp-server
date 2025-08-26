/**
 * Account Management Controller
 * 
 * Handles all account-related MCP tool calls including:
 * - Account creation, updates, and deletion
 * - Account suspension and reactivation
 * - Password management
 * - Account information retrieval
 */

import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { CwpClient } from '../../core/client.js';
import { validateSchema } from '../../middleware/validation.js';
import { handleCwpError, handleValidationError } from '../../middleware/errorHandler.js';
import { AccountService } from './service.js';
import {
  AccountCreateArgsSchema,
  AccountUpdateArgsSchema,
  AccountDeleteArgsSchema,
  AccountSuspendArgsSchema,
  AccountPasswordResetArgsSchema,
  AccountInfoArgsSchema,
  AccountListArgsSchema,
  AccountQuotaArgsSchema,
  AccountMetadataArgsSchema,
} from './types.js';

/**
 * Routes account tool calls to appropriate handlers
 * @param name - The tool name (e.g., 'cwp_account_create')
 * @param args - Tool arguments
 * @param client - CWP API client instance
 * @returns Tool execution result
 */
export async function handleAccountTool(
  name: string,
  args: any,
  client: CwpClient
): Promise<CallToolResult> {
  const service = new AccountService(client);

  switch (name) {
    case 'cwp_account_create':
      return await handleCreateAccount(args, service);
    
    case 'cwp_account_update':
      return await handleUpdateAccount(args, service);
    
    case 'cwp_account_delete':
      return await handleDeleteAccount(args, service);
    
    case 'cwp_account_suspend':
      return await handleSuspendAccount(args, service);
    
    case 'cwp_account_unsuspend':
      return await handleUnsuspendAccount(args, service);
    
    case 'cwp_account_reset_password':
      return await handleResetPassword(args, service);
    
    case 'cwp_account_info':
      return await handleGetAccountInfo(args, service);
    
    case 'cwp_account_list':
      return await handleListAccounts(args, service);

    case 'cwp_account_quota_check':
      return await handleGetAccountQuota(args, service);

    case 'cwp_account_metadata':
      return await handleGetAccountMetadata(args, service);

    default:
      throw new Error(`Unknown account tool: ${name}`);
  }
}

async function handleCreateAccount(args: any, service: AccountService): Promise<CallToolResult> {
  const validation = validateSchema(AccountCreateArgsSchema, args);
  if (!validation.success) {
    throw handleValidationError(validation.errors!);
  }

  try {
    const response = await service.createAccount({
      ...validation.data!,
      autossl: validation.data!.autossl ?? false,
      backup: validation.data!.backup ?? true,
    });
    
    if (response.status === 'success') {
      return {
        content: [
          {
            type: 'text',
            text: `Account created successfully: ${validation.data!.username}@${validation.data!.domain}`,
          },
        ],
        isError: false,
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to create account: ${response.message}`,
          },
        ],
        isError: true,
      };
    }
  } catch (error: any) {
    throw handleCwpError(error);
  }
}

async function handleUpdateAccount(args: any, service: AccountService): Promise<CallToolResult> {
  const validation = validateSchema(AccountUpdateArgsSchema, args);
  if (!validation.success) {
    throw handleValidationError(validation.errors!);
  }

  try {
    const response = await service.updateAccount(validation.data!);
    
    if (response.status === 'success') {
      return {
        content: [
          {
            type: 'text',
            text: `Account updated successfully: ${validation.data!.username}`,
          },
        ],
        isError: false,
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to update account: ${response.message}`,
          },
        ],
        isError: true,
      };
    }
  } catch (error: any) {
    throw handleCwpError(error);
  }
}

async function handleDeleteAccount(args: any, service: AccountService): Promise<CallToolResult> {
  const validation = validateSchema(AccountDeleteArgsSchema, args);
  if (!validation.success) {
    throw handleValidationError(validation.errors!);
  }

  try {
    const response = await service.deleteAccount(validation.data!);
    
    if (response.status === 'success') {
      return {
        content: [
          {
            type: 'text',
            text: `Account deleted successfully: ${validation.data!.username}`,
          },
        ],
        isError: false,
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to delete account: ${response.message}`,
          },
        ],
        isError: true,
      };
    }
  } catch (error: any) {
    throw handleCwpError(error);
  }
}

async function handleSuspendAccount(args: any, service: AccountService): Promise<CallToolResult> {
  const validation = validateSchema(AccountSuspendArgsSchema, args);
  if (!validation.success) {
    throw handleValidationError(validation.errors!);
  }

  try {
    const response = await service.suspendAccount(validation.data!);
    
    if (response.status === 'success') {
      return {
        content: [
          {
            type: 'text',
            text: `Account suspended successfully: ${validation.data!.username}`,
          },
        ],
        isError: false,
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to suspend account: ${response.message}`,
          },
        ],
        isError: true,
      };
    }
  } catch (error: any) {
    throw handleCwpError(error);
  }
}

async function handleUnsuspendAccount(args: any, service: AccountService): Promise<CallToolResult> {
  const validation = validateSchema(AccountSuspendArgsSchema, args);
  if (!validation.success) {
    throw handleValidationError(validation.errors!);
  }

  try {
    const response = await service.unsuspendAccount(validation.data!);
    
    if (response.status === 'success') {
      return {
        content: [
          {
            type: 'text',
            text: `Account unsuspended successfully: ${validation.data!.username}`,
          },
        ],
        isError: false,
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to unsuspend account: ${response.message}`,
          },
        ],
        isError: true,
      };
    }
  } catch (error: any) {
    throw handleCwpError(error);
  }
}

async function handleResetPassword(args: any, service: AccountService): Promise<CallToolResult> {
  const validation = validateSchema(AccountPasswordResetArgsSchema, args);
  if (!validation.success) {
    throw handleValidationError(validation.errors!);
  }

  try {
    const response = await service.resetPassword(validation.data!);
    
    if (response.status === 'success') {
      return {
        content: [
          {
            type: 'text',
            text: `Password reset successfully for account: ${validation.data!.username}`,
          },
        ],
        isError: false,
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to reset password: ${response.message}`,
          },
        ],
        isError: true,
      };
    }
  } catch (error: any) {
    throw handleCwpError(error);
  }
}

async function handleGetAccountInfo(args: any, service: AccountService): Promise<CallToolResult> {
  const validation = validateSchema(AccountInfoArgsSchema, args);
  if (!validation.success) {
    throw handleValidationError(validation.errors!);
  }

  try {
    const response = await service.getAccountInfo(validation.data!);
    
    if (response.status === 'success') {
      return {
        content: [
          {
            type: 'text',
            text: `Account information for ${validation.data!.username}:\n${JSON.stringify(response.data, null, 2)}`,
          },
        ],
        isError: false,
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to get account info: ${response.message}`,
          },
        ],
        isError: true,
      };
    }
  } catch (error: any) {
    throw handleCwpError(error);
  }
}

async function handleListAccounts(args: any, service: AccountService): Promise<CallToolResult> {
  const validation = validateSchema(AccountListArgsSchema, args);
  if (!validation.success) {
    throw handleValidationError(validation.errors!);
  }

  try {
    const response = await service.listAccounts(validation.data!);
    
    if (response.status === 'success') {
      const accounts = Array.isArray(response.data) ? response.data : [];
      return {
        content: [
          {
            type: 'text',
            text: `Found ${accounts.length} accounts:\n${JSON.stringify(accounts, null, 2)}`,
          },
        ],
        isError: false,
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to list accounts: ${response.message}`,
          },
        ],
        isError: true,
      };
    }
  } catch (error: any) {
    throw handleCwpError(error);
  }
}

async function handleGetAccountQuota(args: any, service: AccountService): Promise<CallToolResult> {
  const validation = validateSchema(AccountQuotaArgsSchema, args);
  if (!validation.success) {
    throw handleValidationError(validation.errors!);
  }

  try {
    const response = await service.getAccountInfo(validation.data!);
    
    if (response.status === 'success') {
      const data = Array.isArray(response.data) ? response.data : [];
      const account = data[0] || {};
      const quotaInfo = {
        disk_usage: account.disk_usage,
        disk_limit: account.disk_limit,
        bw_usage: account.bw_usage,
        bw_limit: account.bw_limit,
      };
      return {
        content: [
          {
            type: 'text',
            text: `Quota information for ${validation.data!.username}:\n${JSON.stringify(quotaInfo, null, 2)}`,
          },
        ],
        isError: false,
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to get account quota: ${response.message}`,
          },
        ],
        isError: true,
      };
    }
  } catch (error: any) {
    throw handleCwpError(error);
  }
}

async function handleGetAccountMetadata(args: any, service: AccountService): Promise<CallToolResult> {
  const validation = validateSchema(AccountMetadataArgsSchema, args);
  if (!validation.success) {
    throw handleValidationError(validation.errors!);
  }

  try {
    const response = await service.getAccountInfo(validation.data!);
    
    if (response.status === 'success') {
      const data = Array.isArray(response.data) ? response.data : [];
      const account = data[0] || {};
      const metadata = {
        id: account.id,
        username: account.username,
        domain: account.domain,
        email: account.email,
        package_id: account.package_id,
        status: account.status,
      };
      return {
        content: [
          {
            type: 'text',
            text: `Metadata for ${validation.data!.username}:\n${JSON.stringify(metadata, null, 2)}`,
          },
        ],
        isError: false,
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to get account metadata: ${response.message}`,
          },
        ],
        isError: true,
      };
    }
  } catch (error: any) {
    throw handleCwpError(error);
  }
}
