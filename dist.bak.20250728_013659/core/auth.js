/**
 * CWP Authentication Module
 *
 * Handles authentication and connection management for the CWP API.
 * Provides methods to validate API keys and test connections.
 */
import { CwpClient } from './client.js';
import { logger } from '../utils/logger.js';
/**
 * Authentication handler for CWP API
 */
export class CwpAuth {
    client;
    constructor(config) {
        this.client = new CwpClient(config);
    }
    /**
     * Validates the configured API key by making a test request
     * @returns True if the API key is valid, false otherwise
     */
    async validateApiKey() {
        try {
            const response = await this.client.post('/account', { action: 'list' });
            if (response.status === 'success') {
                logger.info('CWP API key validation successful');
                return true;
            }
            logger.warn('CWP API key validation failed:', response.message);
            return false;
        }
        catch (error) {
            logger.error('CWP API key validation error:', error instanceof Error ? error.message : String(error));
            return false;
        }
    }
    /**
     * Tests the connection to the CWP API
     * @returns Connection status with optional version info or error message
     */
    async testConnection() {
        try {
            const response = await this.client.post('/account', { action: 'list' });
            if (response.status === 'success') {
                return {
                    connected: true,
                    version: response.data?.version || 'unknown',
                };
            }
            return {
                connected: false,
                error: response.message || 'Unknown error',
            };
        }
        catch (error) {
            return {
                connected: false,
                error: error instanceof Error ? error.message : 'Connection failed',
            };
        }
    }
    /**
     * Gets the CWP client instance for making API calls
     * @returns The configured CWP client
     */
    getClient() {
        return this.client;
    }
}
//# sourceMappingURL=auth.js.map