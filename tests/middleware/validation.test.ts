import { z } from 'zod';
import { validateSchema, createValidator } from '../../src/middleware/validation';

describe('Validation Middleware', () => {
  const testSchema = z.object({
    name: z.string().min(1),
    age: z.number().positive(),
    email: z.string().email().optional(),
  });

  describe('validateSchema', () => {
    it('should validate correct data successfully', () => {
      const data = {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
      };

      const result = validateSchema(testSchema, data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.errors).toBeUndefined();
    });

    it('should return errors for invalid data', () => {
      const data = {
        name: '',
        age: -5,
        email: 'invalid-email',
      };

      const result = validateSchema(testSchema, data);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(3);
      expect(result.data).toBeUndefined();
    });

    it('should handle missing required fields', () => {
      const data = {
        email: 'test@example.com',
      };

      const result = validateSchema(testSchema, data);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.some(e => e.includes('name'))).toBe(true);
      expect(result.errors?.some(e => e.includes('age'))).toBe(true);
    });

    it('should allow optional fields to be missing', () => {
      const data = {
        name: 'Jane Doe',
        age: 25,
      };

      const result = validateSchema(testSchema, data);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });

    it('should handle schema parsing errors gracefully', () => {
      const brokenSchema = {
        safeParse: jest.fn(() => {
          throw new Error('Schema error');
        }),
      } as any;

      const result = validateSchema(brokenSchema, {});

      expect(result.success).toBe(false);
      expect(result.errors).toEqual(['Validation failed due to internal error']);
    });
  });

  describe('createValidator', () => {
    it('should create a reusable validator function', () => {
      const validator = createValidator(testSchema);
      
      const validData = {
        name: 'Test User',
        age: 35,
      };

      const invalidData = {
        name: 123,
        age: 'not a number',
      };

      const validResult = validator(validData);
      expect(validResult.success).toBe(true);

      const invalidResult = validator(invalidData);
      expect(invalidResult.success).toBe(false);
    });
  });
});