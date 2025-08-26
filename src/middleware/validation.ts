import { ZodSchema } from 'zod';
import { logger } from '../utils/logger.js';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

export function validateSchema<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    }
    
    const errors = result.error.errors.map(err => 
      `${err.path.join('.')}: ${err.message}`
    );
    
    logger.warn('Validation failed:', { errors, data });
    
    return {
      success: false,
      errors,
    };
  } catch (error) {
    logger.error('Validation error:', error instanceof Error ? error.message : String(error));
    
    return {
      success: false,
      errors: ['Validation failed due to internal error'],
    };
  }
}

export function createValidator<T>(schema: ZodSchema<T>) {
  return (data: unknown): ValidationResult<T> => validateSchema(schema, data);
}