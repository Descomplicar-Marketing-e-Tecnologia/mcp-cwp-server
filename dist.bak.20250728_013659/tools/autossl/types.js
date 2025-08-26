import { z } from 'zod';
export const AutosslListArgsSchema = z.object({
    domain: z.string().optional(),
});
export const AutosslInstallArgsSchema = z.object({
    user: z.string().min(1, 'User is required'),
    domain: z.string().min(1, 'Domain is required'),
});
export const AutosslRenewArgsSchema = z.object({
    domain: z.string().min(1, 'Domain is required'),
});
export const AutosslDeleteArgsSchema = z.object({
    domain: z.string().min(1, 'Domain is required'),
});
//# sourceMappingURL=types.js.map