/**
 * Defensive Query Utilities - MCP Guide CRITICAL RULE #4
 *
 * Provides defensive programming patterns for API responses
 * to prevent cascading errors that affect 80% of MCP projects.
 */
/**
 * Safe data extraction with fallback values
 * MCP Guide: "Use COALESCE and default values to prevent error cascades"
 */
export declare function safeExtract<T>(data: unknown, path: string, defaultValue: T): T;
/**
 * Defensive API response processing
 */
export declare function processApiResponse(response: unknown): {
    status: string;
    message: string;
    data: unknown[];
    errors: string[];
    count: number;
};
/**
 * Safe array processing with defensive patterns
 */
export declare function safeArrayProcess<T, U>(items: unknown, processor: (item: T) => U, defaultValue?: U[]): U[];
/**
 * Defensive field mapping for CWP responses
 */
export declare function mapCwpAccount(rawAccount: unknown): {
    username: string;
    domain: string;
    email: string;
    package: string;
    status: string;
    created: string;
    suspended: boolean;
    quota_used: number;
    quota_limit: number;
    bandwidth_used: number;
    bandwidth_limit: number;
};
/**
 * Defensive SSL certificate mapping
 */
export declare function mapCwpSSL(rawSSL: unknown): {
    domain: string;
    status: string;
    issuer: string;
    expires: string;
    auto_renew: boolean;
    certificate_type: string;
};
/**
 * Safe pagination handling
 */
export declare function safePagination(params: {
    page?: unknown;
    limit?: unknown;
    offset?: unknown;
}): {
    page: number;
    limit: number;
    offset: number;
};
/**
 * Error-resistant field extraction with multiple fallbacks
 */
export declare function extractWithFallbacks<T>(source: unknown, fieldPaths: string[], defaultValue: T): T;
//# sourceMappingURL=defensive-queries.d.ts.map