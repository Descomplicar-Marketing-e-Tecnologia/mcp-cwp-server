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
export declare function safeStringEquals(value1: unknown, value2: unknown): boolean;
/**
 * Safe numeric comparison with explicit type conversion
 */
export declare function safeNumberEquals(value1: unknown, value2: unknown): boolean;
/**
 * Safe array includes check with type conversion
 */
export declare function safeArrayIncludes(array: unknown[], value: unknown): boolean;
/**
 * Safe object property access with type conversion
 */
export declare function safePropertyMatch(obj: Record<string, unknown>, key: string, value: unknown): boolean;
/**
 * Safe ID validation - accepts UUID or numeric string
 */
export declare function isValidId(id: unknown): boolean;
/**
 * Safe type conversion for API responses
 */
export declare function safeConvertApiResponse(data: unknown): {
    toString(): string;
    toNumber(): number;
    toBoolean(): boolean;
    toArray(): unknown[];
};
/**
 * Template for safe filtering operations
 */
export declare function safeFilter<T>(items: T[], predicate: (item: T) => boolean): T[];
/**
 * Template for safe mapping operations
 */
export declare function safeMap<T, U>(items: T[], mapper: (item: T) => U): U[];
//# sourceMappingURL=type-safety.d.ts.map