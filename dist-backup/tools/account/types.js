import { z } from 'zod';
export const AccountCreateArgsSchema = z.object({
    domain: z.string().min(1, 'Domain is required'),
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    email: z.string().email('Valid email is required'),
    package: z.string().min(1, 'Package is required'),
    server_ips: z.string().optional(),
    inode: z.number().positive().optional(),
    limit_nproc: z.number().positive().optional(),
    limit_nofile: z.number().positive().optional(),
    autossl: z.boolean().optional().default(false),
    backup: z.boolean().optional().default(true),
});
export const AccountUpdateArgsSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    package: z.string().optional(),
    email: z.string().email().optional(),
    quota: z.number().positive().optional(),
    bandwidth: z.number().positive().optional(),
    autossl: z.boolean().optional(),
    backup: z.boolean().optional(),
});
export const AccountDeleteArgsSchema = z.object({
    username: z.string().min(1, 'Username is required'),
});
export const AccountSuspendArgsSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    reason: z.string().optional(),
});
export const AccountPasswordResetArgsSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});
export const AccountInfoArgsSchema = z.object({
    username: z.string().min(1, 'Username is required'),
});
export const AccountListArgsSchema = z.object({
    limit: z.number().positive().optional(),
    offset: z.number().nonnegative().optional(),
    search: z.string().optional(),
});
//# sourceMappingURL=types.js.map