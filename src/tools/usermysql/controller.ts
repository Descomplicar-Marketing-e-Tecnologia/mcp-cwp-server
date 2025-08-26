import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { CwpClient } from '../../core/client.js';
import { validateSchema } from '../../middleware/validation.js';
import { handleCwpError, handleValidationError } from '../../middleware/errorHandler.js';
import { UserMysqlService } from './service.js';
import { UserMysqlListArgsSchema } from './types.js';

export async function handleUserMysqlTool(
  name: string,
  args: any,
  client: CwpClient
): Promise<CallToolResult> {
  const service = new UserMysqlService(client);

  switch (name) {
    case 'cwp_usermysql_list':
      return await handleListUserMysql(args, service);

    default:
      throw new Error(`Unknown UserMySQL tool: ${name}`);
  }
}

async function handleListUserMysql(args: any, service: UserMysqlService): Promise<CallToolResult> {
  const validation = validateSchema(UserMysqlListArgsSchema, args);
  if (!validation.success) {
    throw handleValidationError(validation.errors!);
  }

  try {
    const response = await service.listUserMysql(validation.data!);
    
    if (response.status === 'success') {
      const databases = response.data || {};
      const dbCount = Object.keys(databases).length;
      return {
        content: [
          {
            type: 'text',
            text: `Found ${dbCount} MySQL databases for user ${validation.data!.user}:\n${JSON.stringify(databases, null, 2)}`,
          },
        ],
        isError: false,
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to list MySQL databases: ${response.message}`,
          },
        ],
        isError: true,
      };
    }
  } catch (error: any) {
    throw handleCwpError(error);
  }
}