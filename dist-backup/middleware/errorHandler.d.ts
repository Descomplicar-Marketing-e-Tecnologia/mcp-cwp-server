import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { CwpApiError } from '../core/types.js';
export declare class CwpMcpError extends McpError {
    constructor(code: ErrorCode, message: string, data?: unknown);
}
export declare function handleCwpError(error: CwpApiError): CwpMcpError;
export declare function handleValidationError(errors: string[]): CwpMcpError;
export declare function handleGenericError(error: unknown): CwpMcpError;
//# sourceMappingURL=errorHandler.d.ts.map