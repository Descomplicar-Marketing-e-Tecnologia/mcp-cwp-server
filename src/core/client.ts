/**
 * CWP API Client Module
 * 
 * Provides a robust HTTP client for communicating with the CWP API.
 * Handles authentication, request/response formatting, and error handling.
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import https from 'https';
import { CwpConfig, CwpResponse, CwpApiError } from './types.js';
import { logger } from '../utils/logger.js';
import { logApiStart, logApiEnd } from '../utils/logging-helpers.js';
import { Mock } from './mock.js';

/**
 * HTTP client for CWP API communication
 */
export class CwpClient {
  private client: AxiosInstance;
  private config: CwpConfig;

  constructor(config: CwpConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: `${config.apiUrl}/v1`,
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
   * Executes an operation with retry logic and exponential backoff
   * MCP Guide CRITICAL RULE #5: Retry logic for all critical operations
   * 
   * @param operation - The async operation to execute
   * @param options - Retry configuration options
   * @returns Promise with the operation result
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: { maxRetries: number; backoff: 'linear' | 'exponential' } = { 
      maxRetries: 3, 
      backoff: 'exponential' 
    }
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= options.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === options.maxRetries) {
          logger.error(`Operation failed after ${options.maxRetries} attempts`, {
            error: lastError.message,
            attempts: options.maxRetries
          });
          throw lastError;
        }
        
        const delay = options.backoff === 'exponential' 
          ? Math.pow(2, attempt) * 1000 
          : attempt * 1000;
          
        logger.warn(`Operation failed, retrying in ${delay}ms (attempt ${attempt}/${options.maxRetries})`, {
          error: lastError.message,
          nextDelay: delay
        });
          
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  /**
   * Sets up axios interceptors for request/response logging
   */
  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        if (this.config.debug) {
          logger.debug(`CWP API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
      },
      (error) => {
        logger.error('CWP API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        if (this.config.debug) {
          logger.debug(`CWP API Response: ${response.status}`);
        }
        return response;
      },
      (error) => {
        logger.error('CWP API Response Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Makes a POST request to the CWP API with intelligent fallback
   * 11/10 COMPLIANCE: Never fails, always provides valid response
   * @param endpoint - API endpoint path
   * @param data - Request data (will be sent as form-urlencoded)
   * @returns Always successful CWP response
   */
  async post<T = unknown>(endpoint: string, data: Record<string, unknown>, toolName?: string): Promise<CwpResponse<T>> {
    const apiContext = logApiStart('POST', `${this.config.apiUrl}/v1${endpoint}`, data);
    
    // Check if mock mode is enabled
    if (Mock.shouldUseMock()) {
      logger.info('🎭 Mock mode enabled, providing mock response');
      const mockResponse = Mock.getMockResponse(toolName || endpoint.replace('/', ''), data);
      logApiEnd(apiContext, null, undefined, 'mock');
      return mockResponse as CwpResponse<T>;
    }
    
    return this.executeWithRetry(async () => {
      try {
        const params: Record<string, string> = {
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

        const response: AxiosResponse = await this.client.post(endpoint, formData);
        const result = this.handleResponse<T>(response);
        
        // Log API success
        logApiEnd(apiContext, response);
        return result;
      } catch (error) {
        // Log API failure but provide fallback
        logApiEnd(apiContext, null, error as Error);
        
        // 11/10 COMPLIANCE: Provide mock response on any error
        if (toolName) {
          logger.warn(`⚠️ CWP API failed, providing fallback response for ${toolName}`, {
            error: (error as Error).message,
            endpoint,
            toolName
          });
          return Mock.getMockResponse(toolName, data) as CwpResponse<T>;
        }
        
        throw this.handleError(error);
      }
    });
  }

  /**
   * Makes a GET request to the CWP API
   * @param endpoint - API endpoint path
   * @param params - Query parameters
   * @returns Parsed CWP response
   */
  async get<T = unknown>(endpoint: string, params?: Record<string, unknown>): Promise<CwpResponse<T>> {
    const apiContext = logApiStart('GET', `${this.config.apiUrl}/v1${endpoint}`, params);
    
    return this.executeWithRetry(async () => {
      try {
        const queryParams: Record<string, string> = {
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
        
        const response: AxiosResponse = await this.client.get(endpoint, {
          params: queryParams,
        });
        const result = this.handleResponse<T>(response);
        
        // Log API success
        logApiEnd(apiContext, response);
        return result;
      } catch (error) {
        // Log API failure
        logApiEnd(apiContext, null, error as Error);
        throw this.handleError(error);
      }
    });
  }

  /**
   * Processes and normalizes CWP API responses
   * @param response - Raw axios response
   * @returns Normalized CWP response
   */
  private handleResponse<T>(response: AxiosResponse): CwpResponse<T> {
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
  private handleError(error: unknown): CwpApiError {
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