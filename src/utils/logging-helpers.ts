import { logger } from './logger.js';

const isProduction = process.env.NODE_ENV === 'production';

interface ToolCallContext {
  tool: string;
  args?: any;
  startTime?: number;
}

interface ApiCallContext {
  method: string;
  url: string;
  data?: any;
  startTime?: number;
}

// Tool call logging (MCP Guide requirement)
export function logToolStart(tool: string, args: any): ToolCallContext {
  const context: ToolCallContext = {
    tool,
    args,
    startTime: Date.now(),
  };

  if (!isProduction) {
    logger.debug('🔧 Tool called START', {
      tool,
      args: JSON.stringify(args, null, 2),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
    });
  }

  return context;
}

export function logToolEnd(context: ToolCallContext, result: any, error?: Error): void {
  const duration = context.startTime ? Date.now() - context.startTime : 0;

  if (!isProduction) {
    if (error) {
      logger.error('❌ Tool execution FAILED', {
        tool: context.tool,
        duration: `${duration}ms`,
        error: {
          message: error.message,
          stack: error.stack,
          code: (error as any).code,
          details: (error as any).details,
        },
        args: context.args,
      });
    } else {
      logger.debug('🔧 Tool called END', {
        tool: context.tool,
        success: true,
        duration: `${duration}ms`,
        resultSize: JSON.stringify(result).length,
      });

      // Performance warning
      if (duration > 2000) {
        logger.warn('⚠️ Tool slow execution', {
          tool: context.tool,
          duration: `${duration}ms`,
          threshold: '2000ms',
        });
      }
    }
  } else {
    // Production: only log slow executions and errors
    if (duration > 5000) {
      logger.warn('Tool slow execution', { tool: context.tool, duration });
    }
    if (error) {
      logger.error('Tool failed', {
        tool: context.tool,
        error: error.message,
        code: (error as any).code,
      });
    }
  }
}

// API call logging
export function logApiStart(method: string, url: string, data?: any): ApiCallContext {
  const context: ApiCallContext = {
    method,
    url,
    data,
    startTime: Date.now(),
  };

  if (!isProduction) {
    logger.debug('📡 API Request START', {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MCP-CWP/1.0.0',
      },
      data: data ? JSON.stringify(data, null, 2) : undefined,
      timestamp: new Date().toISOString(),
    });
  }

  return context;
}

export function logApiEnd(context: ApiCallContext, response: any, error?: Error, mode?: string): void {
  const duration = context.startTime ? Date.now() - context.startTime : 0;

  if (!isProduction) {
    if (mode === 'mock') {
      logger.debug('🎭 Mock Response PROVIDED', {
        method: context.method,
        url: context.url,
        duration: `${duration}ms`,
        mode: 'mock',
        dataSize: response ? JSON.stringify(response).length : 0,
      });
    } else if (error) {
      logger.error('📡 API Request FAILED', {
        method: context.method,
        url: context.url,
        duration: `${duration}ms`,
        error: {
          message: error.message,
          code: (error as any).code,
          response: (error as any).response?.data,
        },
      });
    } else {
      logger.debug('📡 API Response RECEIVED', {
        method: context.method,
        url: context.url,
        status: response?.status,
        statusText: response?.statusText,
        duration: `${duration}ms`,
        dataSize: response ? JSON.stringify(response.data).length : 0,
      });
    }
  }
}

// Data processing logging
export function logDataProcessing(step: string, input: any, output?: any): void {
  if (!isProduction) {
    logger.debug('⚙️ Data processing', {
      step,
      inputType: typeof input,
      inputSize: JSON.stringify(input).length,
      outputType: output ? typeof output : 'pending',
      outputSize: output ? JSON.stringify(output).length : 0,
    });
  }
}

// Performance metrics
export function logPerformanceMetrics(operation: string, metrics: any): void {
  if (!isProduction) {
    logger.debug('📊 Performance metrics', {
      operation,
      ...metrics,
      timestamp: new Date().toISOString(),
    });
  }
}

// Configuration logging
export function logConfiguration(config: any): void {
  if (!isProduction) {
    logger.debug('⚙️ Configuration loaded', {
      environment: process.env.NODE_ENV,
      cwpApiUrl: process.env.CWP_API_URL,
      cwpDebug: process.env.CWP_DEBUG,
      logLevel: process.env.LOG_LEVEL,
      configKeys: Object.keys(config),
      timestamp: new Date().toISOString(),
    });
  }
}