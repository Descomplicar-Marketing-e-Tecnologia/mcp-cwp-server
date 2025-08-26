import { validateSchema } from '../../middleware/validation.js';
import { handleCwpError, handleValidationError } from '../../middleware/errorHandler.js';
import { AutosslService } from './service.js';
import { AutosslListArgsSchema, AutosslInstallArgsSchema, AutosslRenewArgsSchema, AutosslDeleteArgsSchema, } from './types.js';
export async function handleAutosslTool(name, args, client) {
    const service = new AutosslService(client);
    switch (name) {
        case 'cwp:autossl:list':
            return await handleListSslCertificates(args, service);
        case 'cwp:autossl:install':
            return await handleInstallSslCertificate(args, service);
        case 'cwp:autossl:delete':
            return await handleDeleteSslCertificate(args, service);
        case 'cwp:autossl:renew':
            return await handleRenewSslCertificate(args, service);
        default:
            throw new Error(`Unknown AutoSSL tool: ${name}`);
    }
}
async function handleListSslCertificates(args, service) {
    const validation = validateSchema(AutosslListArgsSchema, args);
    if (!validation.success) {
        throw handleValidationError(validation.errors);
    }
    try {
        const response = await service.listSslCertificates(validation.data);
        if (response.status === 'success') {
            const certificates = Array.isArray(response.data) ? response.data : [];
            let filteredCerts = certificates;
            if (validation.data.domain) {
                filteredCerts = certificates.filter((cert) => cert.ssl && cert.ssl.includes(validation.data.domain));
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: `Found ${filteredCerts.length} SSL certificates:\n${JSON.stringify(filteredCerts, null, 2)}`,
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
                        text: `Failed to list SSL certificates: ${response.message}`,
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
async function handleInstallSslCertificate(args, service) {
    const validation = validateSchema(AutosslInstallArgsSchema, args);
    if (!validation.success) {
        throw handleValidationError(validation.errors);
    }
    try {
        const response = await service.installSslCertificate(validation.data);
        if (response.status === 'success') {
            return {
                content: [
                    {
                        type: 'text',
                        text: `SSL certificate installed successfully for domain: ${validation.data.domain}`,
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
                        text: `Failed to install SSL certificate: ${response.message}`,
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
async function handleDeleteSslCertificate(args, service) {
    const validation = validateSchema(AutosslDeleteArgsSchema, args);
    if (!validation.success) {
        throw handleValidationError(validation.errors);
    }
    try {
        const response = await service.deleteSslCertificate(validation.data);
        if (response.status === 'success') {
            return {
                content: [
                    {
                        type: 'text',
                        text: `SSL certificate deleted successfully for domain: ${validation.data.domain}`,
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
                        text: `Failed to delete SSL certificate: ${response.message}`,
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
async function handleRenewSslCertificate(args, service) {
    const validation = validateSchema(AutosslRenewArgsSchema, args);
    if (!validation.success) {
        throw handleValidationError(validation.errors);
    }
    try {
        const response = await service.renewSslCertificate(validation.data);
        if (response.status === 'success') {
            return {
                content: [
                    {
                        type: 'text',
                        text: `SSL certificate renewed successfully for domain: ${validation.data.domain}`,
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
                        text: `Failed to renew SSL certificate: ${response.message}`,
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