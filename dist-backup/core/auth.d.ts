/**
 * CWP Authentication Module
 *
 * Handles authentication and connection management for the CWP API.
 * Provides methods to validate API keys and test connections.
 */
import { CwpClient } from './client.js';
import { CwpConfig } from './types.js';
/**
 * Authentication handler for CWP API
 */
export declare class CwpAuth {
    private client;
    constructor(config: CwpConfig);
    /**
     * Validates the configured API key by making a test request
     * @returns True if the API key is valid, false otherwise
     */
    validateApiKey(): Promise<boolean>;
    /**
     * Tests the connection to the CWP API
     * @returns Connection status with optional version info or error message
     */
    testConnection(): Promise<{
        connected: boolean;
        version?: string;
        error?: string;
    }>;
    /**
     * Gets the CWP client instance for making API calls
     * @returns The configured CWP client
     */
    getClient(): CwpClient;
}
//# sourceMappingURL=auth.d.ts.map