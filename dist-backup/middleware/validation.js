import { logger } from '../utils/logger.js';
export function validateSchema(schema, data) {
    try {
        const result = schema.safeParse(data);
        if (result.success) {
            return {
                success: true,
                data: result.data,
            };
        }
        const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        logger.warn('Validation failed:', { errors, data });
        return {
            success: false,
            errors,
        };
    }
    catch (error) {
        logger.error('Validation error:', error instanceof Error ? error.message : String(error));
        return {
            success: false,
            errors: ['Validation failed due to internal error'],
        };
    }
}
export function createValidator(schema) {
    return (data) => validateSchema(schema, data);
}
//# sourceMappingURL=validation.js.map