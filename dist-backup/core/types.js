import { z } from 'zod';
export const CwpConfigSchema = z.object({
    apiUrl: z.string().url(),
    apiKey: z.string().min(1),
    sslVerify: z.boolean().default(false),
    debug: z.boolean().default(false),
    port: z.number().default(2304),
});
export const AccountCreateSchema = z.object({
    domain: z.string().min(1),
    username: z.string().min(1),
    password: z.string().min(8),
    email: z.string().email(),
    package: z.string().min(1),
    server_ips: z.string().optional(),
    inode: z.number().optional(),
    limit_nproc: z.number().optional(),
    limit_nofile: z.number().optional(),
    autossl: z.boolean().optional().default(false),
    backup: z.boolean().optional().default(true),
});
export const DomainCreateSchema = z.object({
    user: z.string().min(1),
    type: z.enum(['addon', 'subdomain', 'parked']),
    name: z.string().min(1),
    path: z.string().optional(),
    autossl: z.boolean().optional().default(false),
});
export const EmailCreateSchema = z.object({
    domain: z.string().min(1),
    email: z.string().min(1),
    password: z.string().min(6),
    quota: z.number().optional(),
});
export const FtpCreateSchema = z.object({
    domain: z.string().min(1),
    username: z.string().min(1),
    password: z.string().min(6),
    path: z.string().optional(),
    quota: z.number().optional(),
});
export const MysqlCreateSchema = z.object({
    domain: z.string().min(1),
    database_name: z.string().min(1),
    username: z.string().min(1).optional(),
    password: z.string().min(6).optional(),
});
export const CronjobCreateSchema = z.object({
    domain: z.string().min(1),
    minute: z.string().default('*'),
    hour: z.string().default('*'),
    day: z.string().default('*'),
    month: z.string().default('*'),
    weekday: z.string().default('*'),
    command: z.string().min(1),
});
//# sourceMappingURL=types.js.map