/**
 * Type Safety Utilities - MCP Guide CRITICAL RULE #2
 *
 * Provides safe type conversion functions to prevent comparison errors
 * that cause 60% of MCP project failures according to the Official Guide.
 */
/**
 * Safe string comparison with explicit type conversion
 * MCP Guide: "Always convert types explicitly in comparisons"
 */
export function safeStringEquals(value1, value2) {
    return String(value1) === String(value2);
}
/**
 * Safe numeric comparison with explicit type conversion
 */
export function safeNumberEquals(value1, value2) {
    const num1 = Number(value1);
    const num2 = Number(value2);
    // Handle NaN cases
    if (isNaN(num1) || isNaN(num2)) {
        return false;
    }
    return num1 === num2;
}
/**
 * Safe array includes check with type conversion
 */
export function safeArrayIncludes(array, value) {
    const stringValue = String(value);
    return array.map(item => String(item)).includes(stringValue);
}
/**
 * Safe object property access with type conversion
 */
export function safePropertyMatch(obj, key, value) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    return safeStringEquals(obj[key], value);
}
/**
 * Safe ID validation - accepts UUID or numeric string
 */
export function isValidId(id) {
    const stringId = String(id);
    // UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(stringId)) {
        return true;
    }
    // Numeric ID
    const numericRegex = /^\d+$/;
    return numericRegex.test(stringId);
}
/**
 * Safe type conversion for API responses
 */
export function safeConvertApiResponse(data) {
    return {
        toString: () => String(data ?? ''),
        toNumber: () => {
            const num = Number(data);
            return isNaN(num) ? 0 : num;
        },
        toBoolean: () => {
            if (typeof data === 'boolean')
                return data;
            if (typeof data === 'string') {
                return data.toLowerCase() === 'true' || data === '1';
            }
            return Boolean(data);
        },
        toArray: () => {
            if (Array.isArray(data))
                return data;
            if (data == null)
                return [];
            return [data];
        }
    };
}
/**
 * Template for safe filtering operations
 */
export function safeFilter(items, predicate) {
    try {
        return items.filter(predicate);
    }
    catch (error) {
        console.error('Safe filter error:', error);
        return [];
    }
}
/**
 * Template for safe mapping operations
 */
export function safeMap(items, mapper) {
    try {
        return items.map(mapper);
    }
    catch (error) {
        console.error('Safe map error:', error);
        return [];
    }
}
//# sourceMappingURL=type-safety.js.map