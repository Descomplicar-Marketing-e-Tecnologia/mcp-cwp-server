import { z } from 'zod';
export declare const FtpListArgsSchema: z.ZodObject<{
    user: z.ZodString;
}, "strip", z.ZodTypeAny, {
    user: string;
}, {
    user: string;
}>;
export declare const FtpCreateArgsSchema: z.ZodObject<{
    user: z.ZodString;
    username: z.ZodString;
    password: z.ZodString;
    path: z.ZodOptional<z.ZodString>;
    quota: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
    user: string;
    path?: string | undefined;
    quota?: number | undefined;
}, {
    username: string;
    password: string;
    user: string;
    path?: string | undefined;
    quota?: number | undefined;
}>;
export declare const FtpDeleteArgsSchema: z.ZodObject<{
    user: z.ZodString;
    username: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    user: string;
}, {
    username: string;
    user: string;
}>;
export type FtpListArgs = z.infer<typeof FtpListArgsSchema>;
export type FtpCreateArgs = z.infer<typeof FtpCreateArgsSchema>;
export type FtpDeleteArgs = z.infer<typeof FtpDeleteArgsSchema>;
//# sourceMappingURL=types.d.ts.map