import { z } from 'zod';
export const FtpListArgsSchema = z.object({
    user: z.string().min(1, 'User is required'),
});
export const FtpCreateArgsSchema = z.object({
    user: z.string().min(1, 'User is required'),
    username: z.string().min(1, 'FTP username is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    path: z.string().optional(),
    quota: z.number().positive().optional(),
});
export const FtpDeleteArgsSchema = z.object({
    user: z.string().min(1, 'User is required'),
    username: z.string().min(1, 'FTP username is required'),
});
//# sourceMappingURL=types.js.map