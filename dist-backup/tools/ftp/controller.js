import { validateSchema } from '../../middleware/validation.js';
import { handleCwpError, handleValidationError } from '../../middleware/errorHandler.js';
import { FtpService } from './service.js';
import { FtpListArgsSchema, FtpCreateArgsSchema, FtpDeleteArgsSchema } from './types.js';
export async function handleFtpTool(name, args, client) {
    const service = new FtpService(client);
    switch (name) {
        case 'cwp_ftp_list':
            return await handleListFtpAccounts(args, service);
        case 'cwp_ftp_create':
            return await handleCreateFtpAccount(args, service);
        case 'cwp_ftp_delete':
            return await handleDeleteFtpAccount(args, service);
        default:
            throw new Error(`Unknown FTP tool: ${name}`);
    }
}
async function handleListFtpAccounts(args, service) {
    const validation = validateSchema(FtpListArgsSchema, args);
    if (!validation.success) {
        throw handleValidationError(validation.errors);
    }
    try {
        const response = await service.listFtpAccounts(validation.data);
        if (response.status === 'success') {
            const accounts = Array.isArray(response.data) ? response.data : [];
            return {
                content: [
                    {
                        type: 'text',
                        text: `Found ${accounts.length} FTP accounts for user ${validation.data.user}:\n${JSON.stringify(accounts, null, 2)}`,
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
                        text: `Failed to list FTP accounts: ${response.message}`,
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
async function handleCreateFtpAccount(args, service) {
    const validation = validateSchema(FtpCreateArgsSchema, args);
    if (!validation.success) {
        throw handleValidationError(validation.errors);
    }
    try {
        const response = await service.createFtpAccount(validation.data);
        if (response.status === 'success') {
            return {
                content: [
                    {
                        type: 'text',
                        text: `FTP account created successfully: ${validation.data.username} for user ${validation.data.user}`,
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
                        text: `Failed to create FTP account: ${response.message}`,
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
async function handleDeleteFtpAccount(args, service) {
    const validation = validateSchema(FtpDeleteArgsSchema, args);
    if (!validation.success) {
        throw handleValidationError(validation.errors);
    }
    try {
        const response = await service.deleteFtpAccount(validation.data);
        if (response.status === 'success') {
            return {
                content: [
                    {
                        type: 'text',
                        text: `FTP account deleted successfully: ${validation.data.username} for user ${validation.data.user}`,
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
                        text: `Failed to delete FTP account: ${response.message}`,
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