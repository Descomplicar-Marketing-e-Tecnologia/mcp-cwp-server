/**
 * Account Management Controller
 *
 * Handles all account-related MCP tool calls including:
 * - Account creation, updates, and deletion
 * - Account suspension and reactivation
 * - Password management
 * - Account information retrieval
 */
import { validateSchema } from '../../middleware/validation.js';
import { handleCwpError, handleValidationError } from '../../middleware/errorHandler.js';
import { AccountService } from './service.js';
import { AccountCreateArgsSchema, AccountUpdateArgsSchema, AccountDeleteArgsSchema, AccountSuspendArgsSchema, AccountPasswordResetArgsSchema, AccountInfoArgsSchema, AccountListArgsSchema, } from './types.js';
/**
 * Routes account tool calls to appropriate handlers
 * @param name - The tool name (e.g., 'cwp:account:create')
 * @param args - Tool arguments
 * @param client - CWP API client instance
 * @returns Tool execution result
 */
export async function handleAccountTool(name, args, client) {
    const service = new AccountService(client);
    switch (name) {
        case 'cwp:account:create':
            return await handleCreateAccount(args, service);
        case 'cwp:account:update':
            return await handleUpdateAccount(args, service);
        case 'cwp:account:delete':
            return await handleDeleteAccount(args, service);
        case 'cwp:account:suspend':
            return await handleSuspendAccount(args, service);
        case 'cwp:account:unsuspend':
            return await handleUnsuspendAccount(args, service);
        case 'cwp:account:reset-password':
            return await handleResetPassword(args, service);
        case 'cwp:account:info':
            return await handleGetAccountInfo(args, service);
        case 'cwp:account:list':
            return await handleListAccounts(args, service);
        default:
            throw new Error(`Unknown account tool: ${name}`);
    }
}
async function handleCreateAccount(args, service) {
    const validation = validateSchema(AccountCreateArgsSchema, args);
    if (!validation.success) {
        throw handleValidationError(validation.errors);
    }
    try {
        const response = await service.createAccount({
            ...validation.data,
            autossl: validation.data.autossl ?? false,
            backup: validation.data.backup ?? true,
        });
        if (response.status === 'success') {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Account created successfully: ${validation.data.username}@${validation.data.domain}`,
                    },
                ],
                isError: false,
            };
        }
        else {
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
    }
    catch (error) {
        throw handleCwpError(error);
    }
}
async function handleUpdateAccount(args, service) {
    const validation = validateSchema(AccountUpdateArgsSchema, args);
    if (!validation.success) {
        throw handleValidationError(validation.errors);
    }
    try {
        const response = await service.updateAccount(validation.data);
        if (response.status === 'success') {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Account updated successfully: ${validation.data.username}`,
                    },
                ],
                isError: false,
            };
        }
        else {
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
    }
    catch (error) {
        throw handleCwpError(error);
    }
}
async function handleDeleteAccount(args, service) {
    const validation = validateSchema(AccountDeleteArgsSchema, args);
    if (!validation.success) {
        throw handleValidationError(validation.errors);
    }
    try {
        const response = await service.deleteAccount(validation.data);
        if (response.status === 'success') {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Account deleted successfully: ${validation.data.username}`,
                    },
                ],
                isError: false,
            };
        }
        else {
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
    }
    catch (error) {
        throw handleCwpError(error);
    }
}
async function handleSuspendAccount(args, service) {
    const validation = validateSchema(AccountSuspendArgsSchema, args);
    if (!validation.success) {
        throw handleValidationError(validation.errors);
    }
    try {
        const response = await service.suspendAccount(validation.data);
        if (response.status === 'success') {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Account suspended successfully: ${validation.data.username}`,
                    },
                ],
                isError: false,
            };
        }
        else {
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
    }
    catch (error) {
        throw handleCwpError(error);
    }
}
async function handleUnsuspendAccount(args, service) {
    const validation = validateSchema(AccountSuspendArgsSchema, args);
    if (!validation.success) {
        throw handleValidationError(validation.errors);
    }
    try {
        const response = await service.unsuspendAccount(validation.data);
        if (response.status === 'success') {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Account unsuspended successfully: ${validation.data.username}`,
                    },
                ],
                isError: false,
            };
        }
        else {
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
    }
    catch (error) {
        throw handleCwpError(error);
    }
}
async function handleResetPassword(args, service) {
    const validation = validateSchema(AccountPasswordResetArgsSchema, args);
    if (!validation.success) {
        throw handleValidationError(validation.errors);
    }
    try {
        const response = await service.resetPassword(validation.data);
        if (response.status === 'success') {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Password reset successfully for account: ${validation.data.username}`,
                    },
                ],
                isError: false,
            };
        }
        else {
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
    }
    catch (error) {
        throw handleCwpError(error);
    }
}
async function handleGetAccountInfo(args, service) {
    const validation = validateSchema(AccountInfoArgsSchema, args);
    if (!validation.success) {
        throw handleValidationError(validation.errors);
    }
    try {
        const response = await service.getAccountInfo(validation.data);
        if (response.status === 'success') {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Account information for ${validation.data.username}:\n${JSON.stringify(response.data, null, 2)}`,
                    },
                ],
                isError: false,
            };
        }
        else {
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
    }
    catch (error) {
        throw handleCwpError(error);
    }
}
async function handleListAccounts(args, service) {
    const validation = validateSchema(AccountListArgsSchema, args);
    if (!validation.success) {
        throw handleValidationError(validation.errors);
    }
    try {
        const response = await service.listAccounts(validation.data);
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
        }
        else {
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
    }
    catch (error) {
        throw handleCwpError(error);
    }
}
//# sourceMappingURL=controller.js.map