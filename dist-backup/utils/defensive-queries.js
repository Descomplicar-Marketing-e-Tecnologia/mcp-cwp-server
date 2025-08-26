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
export function safeExtract(data, path, defaultValue) {
    try {
        const keys = path.split('.');
        let current = data;
        for (const key of keys) {
            if (current == null || typeof current !== 'object') {
                return defaultValue;
            }
            current = current[key];
        }
        return current != null ? current : defaultValue;
    }
    catch {
        return defaultValue;
    }
}
/**
 * Defensive API response processing
 */
export function processApiResponse(response) {
    const responseObj = typeof response === 'object' && response != null ? response : {};
    return {
        status: safeExtract(responseObj, 'status', 'unknown'),
        message: safeExtract(responseObj, 'message', 'No message provided'),
        data: Array.isArray(responseObj.data) ? responseObj.data :
            responseObj.data != null ? [responseObj.data] : [],
        errors: Array.isArray(responseObj.errors) ? responseObj.errors :
            responseObj.error ? [String(responseObj.error)] : [],
        count: safeExtract(responseObj, 'count', 0)
    };
}
/**
 * Safe array processing with defensive patterns
 */
export function safeArrayProcess(items, processor, defaultValue = []) {
    try {
        if (!Array.isArray(items)) {
            return defaultValue;
        }
        return items
            .filter(item => item != null)
            .map(item => {
            try {
                return processor(item);
            }
            catch (error) {
                console.warn('Item processing failed:', error);
                return null;
            }
        })
            .filter((item) => item != null);
    }
    catch (error) {
        console.error('Array processing failed:', error);
        return defaultValue;
    }
}
/**
 * Defensive field mapping for CWP responses
 */
export function mapCwpAccount(rawAccount) {
    const account = typeof rawAccount === 'object' && rawAccount != null ? rawAccount : {};
    return {
        username: safeExtract(account, 'username', 'unknown'),
        domain: safeExtract(account, 'domain', safeExtract(account, 'main_domain', 'unknown')),
        email: safeExtract(account, 'email', safeExtract(account, 'contact_email', 'noemail@unknown.com')),
        package: safeExtract(account, 'package', safeExtract(account, 'plan', 'default')),
        status: safeExtract(account, 'status', safeExtract(account, 'state', 'unknown')),
        created: safeExtract(account, 'created', safeExtract(account, 'date_created', new Date().toISOString())),
        suspended: Boolean(safeExtract(account, 'suspended', safeExtract(account, 'is_suspended', false))),
        quota_used: Number(safeExtract(account, 'quota_used', safeExtract(account, 'disk_used', 0))) || 0,
        quota_limit: Number(safeExtract(account, 'quota_limit', safeExtract(account, 'disk_limit', 0))) || 0,
        bandwidth_used: Number(safeExtract(account, 'bandwidth_used', safeExtract(account, 'bw_used', 0))) || 0,
        bandwidth_limit: Number(safeExtract(account, 'bandwidth_limit', safeExtract(account, 'bw_limit', 0))) || 0,
    };
}
/**
 * Defensive SSL certificate mapping
 */
export function mapCwpSSL(rawSSL) {
    const ssl = typeof rawSSL === 'object' && rawSSL != null ? rawSSL : {};
    return {
        domain: safeExtract(ssl, 'domain', safeExtract(ssl, 'hostname', 'unknown')),
        status: safeExtract(ssl, 'status', safeExtract(ssl, 'state', 'unknown')),
        issuer: safeExtract(ssl, 'issuer', safeExtract(ssl, 'ca', 'Unknown CA')),
        expires: safeExtract(ssl, 'expires', safeExtract(ssl, 'expiry_date', new Date().toISOString())),
        auto_renew: Boolean(safeExtract(ssl, 'auto_renew', safeExtract(ssl, 'autorenew', false))),
        certificate_type: safeExtract(ssl, 'type', safeExtract(ssl, 'cert_type', 'unknown')),
    };
}
/**
 * Safe pagination handling
 */
export function safePagination(params) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = params.limit != null ? Math.min(1000, Math.max(1, Number(params.limit))) : 50;
    const offset = params.offset != null ? Math.max(0, Number(params.offset) || 0) : (page - 1) * limit;
    return { page, limit, offset };
}
/**
 * Error-resistant field extraction with multiple fallbacks
 */
export function extractWithFallbacks(source, fieldPaths, defaultValue) {
    for (const path of fieldPaths) {
        try {
            const value = safeExtract(source, path, null);
            if (value != null) {
                return value;
            }
        }
        catch {
            continue;
        }
    }
    return defaultValue;
}
//# sourceMappingURL=defensive-queries.js.map