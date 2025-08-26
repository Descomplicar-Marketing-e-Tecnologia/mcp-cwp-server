import { validateSchema } from '../../middleware/validation.js';
import { handleCwpError, handleValidationError } from '../../middleware/errorHandler.js';
import { PackageService } from './service.js';
import { PackageListArgsSchema } from './types.js';
export async function handlePackageTool(name, args, client) {
    const service = new PackageService(client);
    switch (name) {
        case 'cwp_package_list':
            return await handleListPackages(args, service);
        default:
            throw new Error(`Unknown Package tool: ${name}`);
    }
}
async function handleListPackages(args, service) {
    const validation = validateSchema(PackageListArgsSchema, args);
    if (!validation.success) {
        throw handleValidationError(validation.errors);
    }
    try {
        const response = await service.listPackages(validation.data);
        if (response.status === 'success') {
            const packages = Array.isArray(response.data) ? response.data : [];
            return {
                content: [
                    {
                        type: 'text',
                        text: `Found ${packages.length} hosting packages:\n${JSON.stringify(packages, null, 2)}`,
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
                        text: `Failed to list packages: ${response.message}`,
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