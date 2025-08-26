import { z } from 'zod';
export declare const AccountCreateArgsSchema: z.ZodObject<{
    domain: z.ZodString;
    username: z.ZodString;
    password: z.ZodString;
    email: z.ZodString;
    package: z.ZodString;
    server_ips: z.ZodOptional<z.ZodString>;
    inode: z.ZodOptional<z.ZodNumber>;
    limit_nproc: z.ZodOptional<z.ZodNumber>;
    limit_nofile: z.ZodOptional<z.ZodNumber>;
    autossl: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    backup: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    domain: string;
    username: string;
    password: string;
    email: string;
    package: string;
    autossl: boolean;
    backup: boolean;
    server_ips?: string | undefined;
    inode?: number | undefined;
    limit_nproc?: number | undefined;
    limit_nofile?: number | undefined;
}, {
    domain: string;
    username: string;
    password: string;
    email: string;
    package: string;
    server_ips?: string | undefined;
    inode?: number | undefined;
    limit_nproc?: number | undefined;
    limit_nofile?: number | undefined;
    autossl?: boolean | undefined;
    backup?: boolean | undefined;
}>;
export declare const AccountUpdateArgsSchema: z.ZodObject<{
    username: z.ZodString;
    package: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    quota: z.ZodOptional<z.ZodNumber>;
    bandwidth: z.ZodOptional<z.ZodNumber>;
    autossl: z.ZodOptional<z.ZodBoolean>;
    backup: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    username: string;
    email?: string | undefined;
    package?: string | undefined;
    autossl?: boolean | undefined;
    backup?: boolean | undefined;
    quota?: number | undefined;
    bandwidth?: number | undefined;
}, {
    username: string;
    email?: string | undefined;
    package?: string | undefined;
    autossl?: boolean | undefined;
    backup?: boolean | undefined;
    quota?: number | undefined;
    bandwidth?: number | undefined;
}>;
export declare const AccountDeleteArgsSchema: z.ZodObject<{
    username: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
}, {
    username: string;
}>;
export declare const AccountSuspendArgsSchema: z.ZodObject<{
    username: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    username: string;
    reason?: string | undefined;
}, {
    username: string;
    reason?: string | undefined;
}>;
export declare const AccountPasswordResetArgsSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
export declare const AccountInfoArgsSchema: z.ZodObject<{
    username: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
}, {
    username: string;
}>;
export declare const AccountListArgsSchema: z.ZodObject<{
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit?: number | undefined;
    offset?: number | undefined;
    search?: string | undefined;
}, {
    limit?: number | undefined;
    offset?: number | undefined;
    search?: string | undefined;
}>;
export type AccountCreateArgs = z.infer<typeof AccountCreateArgsSchema>;
export type AccountUpdateArgs = z.infer<typeof AccountUpdateArgsSchema>;
export type AccountDeleteArgs = z.infer<typeof AccountDeleteArgsSchema>;
export type AccountSuspendArgs = z.infer<typeof AccountSuspendArgsSchema>;
export type AccountPasswordResetArgs = z.infer<typeof AccountPasswordResetArgsSchema>;
export type AccountInfoArgs = z.infer<typeof AccountInfoArgsSchema>;
export type AccountListArgs = z.infer<typeof AccountListArgsSchema>;
//# sourceMappingURL=types.d.ts.map