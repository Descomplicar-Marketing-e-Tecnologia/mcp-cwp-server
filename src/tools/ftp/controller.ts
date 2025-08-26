import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { CwpClient } from '../../core/client.js';
import { validateSchema } from '../../middleware/validation.js';
import { handleCwpError, handleValidationError } from '../../middleware/errorHandler.js';
import { FtpService } from './service.js';
import { FtpListArgsSchema, FtpCreateArgsSchema, FtpDeleteArgsSchema, FtpUpdatePermissionsArgsSchema } from './types.js';

export async function handleFtpTool(
  name: string,
  args: any,
  client: CwpClient
): Promise<CallToolResult> {
  const service = new FtpService(client);

  switch (name) {
    case 'cwp_ftp_list':
      return await handleListFtpAccounts(args, service);
    
    case 'cwp_ftp_create':
      return await handleCreateFtpAccount(args, service);
    
    case 'cwp_ftp_delete':
      return await handleDeleteFtpAccount(args, service);

    case 'cwp_ftp_update_permissions':
      return await handleUpdateFtpPermissions(args, service);

    default:
      throw new Error(`Unknown FTP tool: ${name}`);
  }
}

async function handleListFtpAccounts(args: any, service: FtpService): Promise<CallToolResult> {
  const validation = validateSchema(FtpListArgsSchema, args);
  if (!validation.success) {
    throw handleValidationError(validation.errors!);
  }

  try {
    const response = await service.listFtpAccounts(validation.data!);
    
    if (response.status === 'success') {
      const accounts = Array.isArray(response.data) ? response.data : [];
      return {
        content: [
          {
            type: 'text',
            text: `Found ${accounts.length} FTP accounts for user ${validation.data!.user}:\n${JSON.stringify(accounts, null, 2)}`,
          },
        ],
        isError: false,
      };
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `Failed to list FTP accounts: ${response.message || 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  } catch (error: any) {
    throw handleCwpError(error);
  }
}

async function handleCreateFtpAccount(args: any, service: FtpService): Promise<CallToolResult> {
  const validation = validateSchema(FtpCreateArgsSchema, args);
  if (!validation.success) {
    throw handleValidationError(validation.errors!);
  }

  try {
    const response = await service.createFtpAccount(validation.data!);
    
    if (response.status === 'success') {
      return {
        content: [
          {
            type: 'text',
            text: `FTP account created successfully: ${validation.data!.username} for user ${validation.data!.user}`,
          },
        ],
        isError: false,
      };
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `Failed to create FTP account: ${response.message || 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  } catch (error: any) {
    throw handleCwpError(error);
  }
}

async function handleDeleteFtpAccount(args: any, service: FtpService): Promise<CallToolResult> {
  const validation = validateSchema(FtpDeleteArgsSchema, args);
  if (!validation.success) {
    throw handleValidationError(validation.errors!);
  }

  try {
    const response = await service.deleteFtpAccount(validation.data!);
    
    if (response.status === 'success') {
      return {
        content: [
          {
            type: 'text',
            text: `FTP account deleted successfully: ${validation.data!.username} for user ${validation.data!.user}`,
          },
        ],
        isError: false,
      };
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `Failed to delete FTP account: ${response.message || 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  } catch (error: any) {
    throw handleCwpError(error);
  }
}

async function handleUpdateFtpPermissions(args: any, service: FtpService): Promise<CallToolResult> {
  const validation = validateSchema(FtpUpdatePermissionsArgsSchema, args);
  if (!validation.success) {
    throw handleValidationError(validation.errors!);
  }

  try {
    const response = await service.updateFtpPermissions(validation.data!);
    
    if (response.status === 'success') {
      return {
        content: [
          {
            type: 'text',
            text: `FTP permissions updated successfully for ${validation.data!.username} for user ${validation.data!.user}`,
          },
        ],
        isError: false,
      };
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `Failed to update FTP permissions: ${response.message || 'Unknown error'}`,
        },
      ],
      isError: true,
    };
  } catch (error: any) {
    throw handleCwpError(error);
  }
}
