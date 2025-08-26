import { z } from 'zod';
export declare const AutosslListArgsSchema: z.ZodObject<{
    domain: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    domain?: string | undefined;
}, {
    domain?: string | undefined;
}>;
export declare const AutosslInstallArgsSchema: z.ZodObject<{
    user: z.ZodString;
    domain: z.ZodString;
}, "strip", z.ZodTypeAny, {
    domain: string;
    user: string;
}, {
    domain: string;
    user: string;
}>;
export declare const AutosslRenewArgsSchema: z.ZodObject<{
    domain: z.ZodString;
}, "strip", z.ZodTypeAny, {
    domain: string;
}, {
    domain: string;
}>;
export declare const AutosslDeleteArgsSchema: z.ZodObject<{
    domain: z.ZodString;
}, "strip", z.ZodTypeAny, {
    domain: string;
}, {
    domain: string;
}>;
export type AutosslListArgs = z.infer<typeof AutosslListArgsSchema>;
export type AutosslInstallArgs = z.infer<typeof AutosslInstallArgsSchema>;
export type AutosslRenewArgs = z.infer<typeof AutosslRenewArgsSchema>;
export type AutosslDeleteArgs = z.infer<typeof AutosslDeleteArgsSchema>;
//# sourceMappingURL=types.d.ts.map