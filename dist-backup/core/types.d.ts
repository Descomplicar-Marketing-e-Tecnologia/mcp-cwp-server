import { z } from 'zod';
export declare const CwpConfigSchema: z.ZodObject<{
    apiUrl: z.ZodString;
    apiKey: z.ZodString;
    sslVerify: z.ZodDefault<z.ZodBoolean>;
    debug: z.ZodDefault<z.ZodBoolean>;
    port: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    apiUrl: string;
    apiKey: string;
    sslVerify: boolean;
    debug: boolean;
    port: number;
}, {
    apiUrl: string;
    apiKey: string;
    sslVerify?: boolean | undefined;
    debug?: boolean | undefined;
    port?: number | undefined;
}>;
export type CwpConfig = z.infer<typeof CwpConfigSchema>;
export interface CwpResponse<T = unknown> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
    errors?: string[];
}
export interface CwpApiError {
    code: string;
    message: string;
    details?: unknown;
}
export declare const AccountCreateSchema: z.ZodObject<{
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
export type AccountCreateRequest = z.infer<typeof AccountCreateSchema>;
export declare const DomainCreateSchema: z.ZodObject<{
    user: z.ZodString;
    type: z.ZodEnum<["addon", "subdomain", "parked"]>;
    name: z.ZodString;
    path: z.ZodOptional<z.ZodString>;
    autossl: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    type: "addon" | "subdomain" | "parked";
    autossl: boolean;
    user: string;
    name: string;
    path?: string | undefined;
}, {
    type: "addon" | "subdomain" | "parked";
    user: string;
    name: string;
    path?: string | undefined;
    autossl?: boolean | undefined;
}>;
export type DomainCreateRequest = z.infer<typeof DomainCreateSchema>;
export declare const EmailCreateSchema: z.ZodObject<{
    domain: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    quota: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    domain: string;
    password: string;
    email: string;
    quota?: number | undefined;
}, {
    domain: string;
    password: string;
    email: string;
    quota?: number | undefined;
}>;
export type EmailCreateRequest = z.infer<typeof EmailCreateSchema>;
export declare const FtpCreateSchema: z.ZodObject<{
    domain: z.ZodString;
    username: z.ZodString;
    password: z.ZodString;
    path: z.ZodOptional<z.ZodString>;
    quota: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    domain: string;
    username: string;
    password: string;
    path?: string | undefined;
    quota?: number | undefined;
}, {
    domain: string;
    username: string;
    password: string;
    path?: string | undefined;
    quota?: number | undefined;
}>;
export type FtpCreateRequest = z.infer<typeof FtpCreateSchema>;
export declare const MysqlCreateSchema: z.ZodObject<{
    domain: z.ZodString;
    database_name: z.ZodString;
    username: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    domain: string;
    database_name: string;
    username?: string | undefined;
    password?: string | undefined;
}, {
    domain: string;
    database_name: string;
    username?: string | undefined;
    password?: string | undefined;
}>;
export type MysqlCreateRequest = z.infer<typeof MysqlCreateSchema>;
export declare const CronjobCreateSchema: z.ZodObject<{
    domain: z.ZodString;
    minute: z.ZodDefault<z.ZodString>;
    hour: z.ZodDefault<z.ZodString>;
    day: z.ZodDefault<z.ZodString>;
    month: z.ZodDefault<z.ZodString>;
    weekday: z.ZodDefault<z.ZodString>;
    command: z.ZodString;
}, "strip", z.ZodTypeAny, {
    domain: string;
    minute: string;
    hour: string;
    day: string;
    month: string;
    weekday: string;
    command: string;
}, {
    domain: string;
    command: string;
    minute?: string | undefined;
    hour?: string | undefined;
    day?: string | undefined;
    month?: string | undefined;
    weekday?: string | undefined;
}>;
export type CronjobCreateRequest = z.infer<typeof CronjobCreateSchema>;
//# sourceMappingURL=types.d.ts.map