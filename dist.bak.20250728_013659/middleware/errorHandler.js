import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { logger } from '../utils/logger.js';
export class CwpMcpError extends McpError {
    constructor(code, message, data) {
        super(code, message, data);
        this.name = 'CwpMcpError';
    }
}
export function handleCwpError(error) {
    logger.error('CWP Error:', error);
    switch (error.code) {
        case 'HTTP_401':
        case 'HTTP_403':
            return new CwpMcpError(ErrorCode.InvalidRequest, 'Authentication failed - invalid API key', { cwpError: error });
        case 'HTTP_404':
            return new CwpMcpError(ErrorCode.InvalidRequest, 'CWP endpoint not found', { cwpError: error });
        case 'HTTP_429':
            return new CwpMcpError(ErrorCode.InvalidRequest, 'Rate limit exceeded', { cwpError: error });
        case 'HTTP_500':
        case 'HTTP_502':
        case 'HTTP_503':
            return new CwpMcpError(ErrorCode.InternalError, 'CWP server error', { cwpError: error });
        case 'NETWORK_ERROR':
            return new CwpMcpError(ErrorCode.InternalError, 'Network error - unable to reach CWP server', { cwpError: error });
        default:
            return new CwpMcpError(ErrorCode.InternalError, error.message || 'Unknown CWP error', { cwpError: error });
    }
}
export function handleValidationError(errors) {
    return new CwpMcpError(ErrorCode.InvalidParams, `Validation failed: ${errors.join(', ')}`, { validationErrors: errors });
}
export function handleGenericError(error) {
    if (error instanceof CwpMcpError) {
        return error;
    }
    if (error instanceof Error) {
        logger.error('Generic error:', error);
        return new CwpMcpError(ErrorCode.InternalError, error.message, { originalError: error.stack });
    }
    logger.error('Unknown error:', error);
    return new CwpMcpError(ErrorCode.InternalError, 'An unknown error occurred', { originalError: error });
}
//# sourceMappingURL=errorHandler.js.map