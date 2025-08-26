import { ZodSchema } from 'zod';
export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors?: string[];
}
export declare function validateSchema<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T>;
export declare function createValidator<T>(schema: ZodSchema<T>): (data: unknown) => ValidationResult<T>;
//# sourceMappingURL=validation.d.ts.map