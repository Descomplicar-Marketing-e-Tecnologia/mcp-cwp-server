/**
 * CWP API Client Module
 *
 * Provides a robust HTTP client for communicating with the CWP API.
 * Handles authentication, request/response formatting, and error handling.
 */
import { CwpConfig, CwpResponse } from './types.js';
/**
 * HTTP client for CWP API communication
 */
export declare class CwpClient {
    private client;
    private config;
    constructor(config: CwpConfig);
    /**
     * Sets up axios interceptors for request/response logging
     */
    private setupInterceptors;
    /**
     * Makes a POST request to the CWP API
     * @param endpoint - API endpoint path
     * @param data - Request data (will be sent as form-urlencoded)
     * @returns Parsed CWP response
     */
    post<T = unknown>(endpoint: string, data: Record<string, unknown>): Promise<CwpResponse<T>>;
    /**
     * Makes a GET request to the CWP API
     * @param endpoint - API endpoint path
     * @param params - Query parameters
     * @returns Parsed CWP response
     */
    get<T = unknown>(endpoint: string, params?: Record<string, unknown>): Promise<CwpResponse<T>>;
    /**
     * Processes and normalizes CWP API responses
     * @param response - Raw axios response
     * @returns Normalized CWP response
     */
    private handleResponse;
    /**
     * Converts various error types into standardized CWP API errors
     * @param error - The error to handle
     * @returns Standardized error object
     */
    private handleError;
}
//# sourceMappingURL=client.d.ts.map