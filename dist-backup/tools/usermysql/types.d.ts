import { z } from 'zod';
export declare const UserMysqlListArgsSchema: z.ZodObject<{
    user: z.ZodString;
}, "strip", z.ZodTypeAny, {
    user: string;
}, {
    user: string;
}>;
export type UserMysqlListArgs = z.infer<typeof UserMysqlListArgsSchema>;
//# sourceMappingURL=types.d.ts.map