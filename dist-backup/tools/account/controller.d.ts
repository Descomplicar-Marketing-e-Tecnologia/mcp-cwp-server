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
/**
 * Routes account tool calls to appropriate handlers
 * @param name - The tool name (e.g., 'cwp_account_create')
 * @param args - Tool arguments
 * @param client - CWP API client instance
 * @returns Tool execution result
 */
export declare function handleAccountTool(name: string, args: any, client: CwpClient): Promise<CallToolResult>;
//# sourceMappingURL=controller.d.ts.map