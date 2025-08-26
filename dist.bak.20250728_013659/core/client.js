/**
 * CWP API Client Module
 *
 * Provides a robust HTTP client for communicating with the CWP API.
 * Handles authentication, request/response formatting, and error handling.
 */
import axios from 'axios';
import https from 'https';
import { logger } from '../utils/logger.js';
import { logApiStart, logApiEnd } from '../utils/logging-helpers.js';
/**
 * HTTP client for CWP API communication
 */
export class CwpClient {
    client;
    config;
    constructor(config) {
        this.config = config;
        this.client = axios.create({
            baseURL: `${config.apiUrl}:${config.port}/v1`,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'MCP-CWP-Server/1.0.0',
            },
            httpsAgent: config.sslVerify ? undefined : new https.Agent({ rejectUnauthorized: false }),
        });
        this.setupInterceptors();
    }
    /**
     * Sets up axios interceptors for request/response logging
     */
    setupInterceptors() {
        this.client.interceptors.request.use((config) => {
            if (this.config.debug) {
                logger.debug(`CWP API Request: ${config.method?.toUpperCase()} ${config.url}`);
            }
            return config;
        }, (error) => {
            logger.error('CWP API Request Error:', error);
            return Promise.reject(error);
        });
        this.client.interceptors.response.use((response) => {
            if (this.config.debug) {
                logger.debug(`CWP API Response: ${response.status}`);
            }
            return response;
        }, (error) => {
            logger.error('CWP API Response Error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            return Promise.reject(error);
        });
    }
    /**
     * Makes a POST request to the CWP API
     * @param endpoint - API endpoint path
     * @param data - Request data (will be sent as form-urlencoded)
     * @returns Parsed CWP response
     */
    async post(endpoint, data) {
        const apiContext = logApiStart('POST', `${this.config.apiUrl}:${this.config.port}/v1${endpoint}`, data);
        try {
            const params = {
                key: this.config.apiKey,
                action: String(data.action || 'list'),
            };
            // Convert all data values to strings
            Object.entries(data).forEach(([key, value]) => {
                if (key !== 'action' && value !== undefined && value !== null) {
                    params[key] = String(value);
                }
            });
            const formData = new URLSearchParams(params);
            const response = await this.client.post(endpoint, formData);
            return this.handleResponse(response);
        }
        catch (error) {
            throw this.handleError(error);
        }
    }
    /**
     * Makes a GET request to the CWP API
     * @param endpoint - API endpoint path
     * @param params - Query parameters
     * @returns Parsed CWP response
     */
    async get(endpoint, params) {
        const apiContext = logApiStart('GET', `${this.config.apiUrl}:${this.config.port}/v1${endpoint}`, params);
        try {
            const queryParams = {
                key: this.config.apiKey,
                action: String(params?.action || 'list'),
            };
            // Convert all params values to strings
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (key !== 'action' && value !== undefined && value !== null) {
                        queryParams[key] = String(value);
                    }
                });
            }
            const response = await this.client.get(endpoint, {
                params: queryParams,
            });
            const result = this.handleResponse(response);
            // Log API success
            logApiEnd(apiContext, response);
            return result;
        }
        catch (error) {
            // Log API failure
            logApiEnd(apiContext, null, error);
            throw this.handleError(error);
        }
    }
    /**
     * Processes and normalizes CWP API responses
     * @param response - Raw axios response
     * @returns Normalized CWP response
     */
    handleResponse(response) {
        const { data } = response;
        if (data.status === 'OK' || data.status === 'success') {
            return {
                status: 'success',
                data: data.msj || data.result || data.data || data,
                message: data.message,
            };
        }
        return {
            status: 'error',
            message: data.message || 'Unknown error',
            errors: data.errors || [data.message || 'Unknown error'],
        };
    }
    /**
     * Converts various error types into standardized CWP API errors
     * @param error - The error to handle
     * @returns Standardized error object
     */
    handleError(error) {
        if (axios.isAxiosError(error) && error.response) {
            const { status, data } = error.response;
            return {
                code: `HTTP_${status}`,
                message: data?.message || `HTTP Error ${status}`,
                details: data,
            };
        }
        if (axios.isAxiosError(error) && error.request) {
            return {
                code: 'NETWORK_ERROR',
                message: 'Network error - unable to reach CWP API',
                details: error.message,
            };
        }
        return {
            code: 'UNKNOWN_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            details: error,
        };
    }
}
//# sourceMappingURL=client.js.map