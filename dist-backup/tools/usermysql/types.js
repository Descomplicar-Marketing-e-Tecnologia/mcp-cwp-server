import { z } from 'zod';
export const UserMysqlListArgsSchema = z.object({
    user: z.string().min(1, 'User is required'),
});
//# sourceMappingURL=types.js.map