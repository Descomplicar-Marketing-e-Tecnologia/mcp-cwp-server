/**
 * Simple Cache Implementation with TTL Support
 * MCP Guide compliant cache for reducing API calls
 *
 * @author Descomplicar - Agência de Aceleração Digital
 */
/**
 * Simple in-memory cache with TTL support
 * Implements MCP Guide recommendation for performance optimization
 */
export declare class SimpleCache {
    private cache;
    private defaultTTL;
    constructor(defaultTTL?: number);
    /**
     * Get an item from cache
     * @param key - Cache key
     * @returns Cached value or null if not found/expired
     */
    get<T>(key: string): T | null;
    /**
     * Set an item in cache
     * @param key - Cache key
     * @param value - Value to cache
     * @param ttl - Time to live in milliseconds (optional)
     */
    set<T>(key: string, value: T, ttl?: number): void;
    /**
     * Delete an item from cache
     * @param key - Cache key
     */
    delete(key: string): boolean;
    /**
     * Clear all cached items
     */
    clear(): void;
    /**
     * Clear items matching a pattern
     * @param pattern - Pattern to match keys against
     */
    clearPattern(pattern: string | RegExp): number;
    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        keys: string[];
    };
    /**
     * Clean up expired entries
     */
    private cleanup;
}
export declare const cache: SimpleCache;
/**
 * Cache key generators for consistent key formatting
 */
export declare const cacheKeys: {
    account: (username: string) => string;
    accountList: (params?: Record<string, any>) => string;
    package: (name: string) => string;
    packageList: () => string;
    autossl: (domain: string) => string;
    autosslList: (username?: string) => string;
    ftp: (username: string, ftpUser: string) => string;
    ftpList: (username: string) => string;
    mysql: (username: string, dbName: string) => string;
    mysqlList: (username: string) => string;
};
/**
 * Cache TTL values for different operations (in milliseconds)
 */
export declare const cacheTTL: {
    short: number;
    medium: number;
    long: number;
    veryLong: number;
};
//# sourceMappingURL=cache.d.ts.map