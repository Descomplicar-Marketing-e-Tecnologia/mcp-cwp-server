import {
  safeStringEquals,
  safeNumberEquals,
  safeArrayIncludes,
  safePropertyMatch,
  isValidId,
  safeConvertApiResponse,
  safeFilter,
  safeMap
} from '../../src/utils/type-safety';

describe('Type Safety Utilities', () => {
  describe('safeStringEquals', () => {
    it('should compare strings safely', () => {
      expect(safeStringEquals('test', 'test')).toBe(true);
      expect(safeStringEquals('test', 'TEST')).toBe(false);
      expect(safeStringEquals('123', 123)).toBe(true);
      expect(safeStringEquals(null, undefined)).toBe(false);
      expect(safeStringEquals(null, 'null')).toBe(true);
    });

    it('should handle edge cases', () => {
      expect(safeStringEquals('', 0)).toBe(false);
      expect(safeStringEquals('', '')).toBe(true);
      expect(safeStringEquals(false, 'false')).toBe(true);
      expect(safeStringEquals(true, 'true')).toBe(true);
    });
  });

  describe('safeNumberEquals', () => {
    it('should compare numbers safely', () => {
      expect(safeNumberEquals(123, 123)).toBe(true);
      expect(safeNumberEquals('123', 123)).toBe(true);
      expect(safeNumberEquals(123, '123')).toBe(true);
      expect(safeNumberEquals('123.45', 123.45)).toBe(true);
    });

    it('should handle NaN cases', () => {
      expect(safeNumberEquals('invalid', 123)).toBe(false);
      expect(safeNumberEquals('abc', 'def')).toBe(false);
      expect(safeNumberEquals(NaN, NaN)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(safeNumberEquals(0, '0')).toBe(true);
      expect(safeNumberEquals(0, '')).toBe(true);
      expect(safeNumberEquals(1, true)).toBe(true);
      expect(safeNumberEquals(0, false)).toBe(true);
    });
  });

  describe('safeArrayIncludes', () => {
    it('should check array includes safely', () => {
      const array = [1, '2', 3, 'test'];
      
      expect(safeArrayIncludes(array, 1)).toBe(true);
      expect(safeArrayIncludes(array, '1')).toBe(true);
      expect(safeArrayIncludes(array, 2)).toBe(true);
      expect(safeArrayIncludes(array, '2')).toBe(true);
      expect(safeArrayIncludes(array, 'test')).toBe(true);
      expect(safeArrayIncludes(array, 'notfound')).toBe(false);
    });

    it('should handle empty arrays', () => {
      expect(safeArrayIncludes([], 'anything')).toBe(false);
    });
  });

  describe('safePropertyMatch', () => {
    it('should match object properties safely', () => {
      const obj = { id: 123, name: 'test', status: 'active' };
      
      expect(safePropertyMatch(obj, 'id', 123)).toBe(true);
      expect(safePropertyMatch(obj, 'id', '123')).toBe(true);
      expect(safePropertyMatch(obj, 'name', 'test')).toBe(true);
      expect(safePropertyMatch(obj, 'name', 'TEST')).toBe(false);
      expect(safePropertyMatch(obj, 'missing', 'value')).toBe(false);
    });

    it('should handle null/undefined objects', () => {
      expect(safePropertyMatch(null, 'key', 'value')).toBe(false);
      expect(safePropertyMatch(undefined, 'key', 'value')).toBe(false);
      expect(safePropertyMatch('notobject', 'key', 'value')).toBe(false);
    });
  });

  describe('isValidId', () => {
    it('should validate UUID format', () => {
      expect(isValidId('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isValidId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isValidId('invalid-uuid-format')).toBe(false);
    });

    it('should validate numeric IDs', () => {
      expect(isValidId('123')).toBe(true);
      expect(isValidId('0')).toBe(true);
      expect(isValidId(456)).toBe(true);
      expect(isValidId('abc123')).toBe(false);
      expect(isValidId('')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidId(null)).toBe(false);
      expect(isValidId(undefined)).toBe(false);
      expect(isValidId(-123)).toBe(false);
    });
  });

  describe('safeConvertApiResponse', () => {
    it('should convert values safely', () => {
      const converter = safeConvertApiResponse('test');
      
      expect(converter.toString()).toBe('test');
      expect(converter.toNumber()).toBe(0); // NaN becomes 0
      expect(converter.toBoolean()).toBe(false); // String 'test' is not 'true' or '1'
      expect(converter.toArray()).toEqual(['test']);
    });

    it('should handle numeric values', () => {
      const converter = safeConvertApiResponse(123);
      
      expect(converter.toString()).toBe('123');
      expect(converter.toNumber()).toBe(123);
      expect(converter.toBoolean()).toBe(true);
      expect(converter.toArray()).toEqual([123]);
    });

    it('should handle boolean values', () => {
      const trueConverter = safeConvertApiResponse(true);
      const falseConverter = safeConvertApiResponse(false);
      
      expect(trueConverter.toBoolean()).toBe(true);
      expect(falseConverter.toBoolean()).toBe(false);
      
      const stringTrueConverter = safeConvertApiResponse('true');
      const stringFalseConverter = safeConvertApiResponse('false');
      
      expect(stringTrueConverter.toBoolean()).toBe(true);
      expect(stringFalseConverter.toBoolean()).toBe(false);
    });

    it('should handle arrays', () => {
      const arrayConverter = safeConvertApiResponse([1, 2, 3]);
      const nullConverter = safeConvertApiResponse(null);
      
      expect(arrayConverter.toArray()).toEqual([1, 2, 3]);
      expect(nullConverter.toArray()).toEqual([]);
    });

    it('should handle null/undefined', () => {
      const nullConverter = safeConvertApiResponse(null);
      const undefinedConverter = safeConvertApiResponse(undefined);
      
      expect(nullConverter.toString()).toBe('');
      expect(nullConverter.toNumber()).toBe(0);
      expect(nullConverter.toBoolean()).toBe(false);
      expect(nullConverter.toArray()).toEqual([]);
      
      expect(undefinedConverter.toString()).toBe('');
      expect(undefinedConverter.toNumber()).toBe(0);
      expect(undefinedConverter.toBoolean()).toBe(false);
      expect(undefinedConverter.toArray()).toEqual([]);
    });
  });

  describe('safeFilter', () => {
    it('should filter arrays safely', () => {
      const items = [1, 2, 3, 4, 5];
      const result = safeFilter(items, (x) => x > 3);
      
      expect(result).toEqual([4, 5]);
    });

    it('should handle errors gracefully', () => {
      const items = [1, 2, 3];
      const result = safeFilter(items, () => {
        throw new Error('Filter error');
      });
      
      expect(result).toEqual([]);
    });

    it('should handle empty arrays', () => {
      const result = safeFilter([], (x) => true);
      expect(result).toEqual([]);
    });
  });

  describe('safeMap', () => {
    it('should map arrays safely', () => {
      const items = [1, 2, 3];
      const result = safeMap(items, (x) => x * 2);
      
      expect(result).toEqual([2, 4, 6]);
    });

    it('should handle errors gracefully', () => {
      const items = [1, 2, 3];
      const result = safeMap(items, () => {
        throw new Error('Map error');
      });
      
      expect(result).toEqual([]);
    });

    it('should handle empty arrays', () => {
      const result = safeMap([], (x) => x);
      expect(result).toEqual([]);
    });
  });
});