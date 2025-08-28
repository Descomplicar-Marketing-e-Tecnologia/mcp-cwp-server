import winston from 'winston';
import fs from 'fs';
import path from 'path';

// Stable version with EPIPE error handling and MCP compatibility
const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'error' : 'warn'); // Less verbose by default

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom console transport with EPIPE error handling
class SafeConsoleTransport extends winston.transports.Console {
  log(info: any, callback?: () => void) {
    try {
      // Attempt to log, but handle the callback properly
      const result = super.log && super.log(info, () => {
        // Winston's console transport doesn't always use callbacks properly
        if (callback) callback();
      });
      
      // If no callback was used by parent, call it anyway
      if (!result && callback) {
        callback();
      }
      
    } catch (error: any) {
      // Catch synchronous errors
      if (error.code === 'EPIPE' || error.code === 'ECONNRESET') {
        // Ignore broken pipes
        if (callback) callback();
        return;
      }
      
      // Re-throw other errors
      if (callback) callback();
      else throw error;
    }
  }
}

// Transport configuration with error handling
const transports: winston.transport[] = [];

if (isProduction) {
  // Production: Minimal logging to stderr with error handling
  transports.push(
    new SafeConsoleTransport({
      level: logLevel,
      handleExceptions: false, // Disable to prevent EPIPE crashes
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: false }), // Reduce stack traces in prod
        winston.format.json()
      ),
      stderrLevels: ['error', 'warn'],
    })
  );
} else {
  // Development: Controlled logging
  transports.push(
    new SafeConsoleTransport({
      level: 'warn', // Only show warnings and errors in console
      handleExceptions: false,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
  
  // File logging for development (with smaller size limits)
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      level: 'info',
      maxsize: 5000000, // 5MB
      maxFiles: 2,
      handleExceptions: false,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 2000000, // 2MB
      maxFiles: 2,
      handleExceptions: false,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    })
  );
}

// Create logger with error handling
export const logger = winston.createLogger({
  level: logLevel,
  transports,
  exitOnError: false, // Don't exit on uncaught exceptions
  silent: false,
  rejectionHandlers: [], // No rejection handlers to prevent issues
  exceptionHandlers: [], // No exception handlers
});

// Handle logger errors gracefully
logger.on('error', (error: any) => {
  if (error.code === 'EPIPE' || error.code === 'ECONNRESET') {
    // Silently ignore broken pipe errors
    return;
  }
  
  // For other errors, try to write to stderr if available
  try {
    console.error('Logger error:', error.message);
  } catch {
    // If even console.error fails, silently ignore
  }
});

// Override logger methods to handle EPIPE gracefully
const originalLog = logger.log.bind(logger);
logger.log = function(level: any, message?: any, meta?: any, ...args: any[]) {
  try {
    return originalLog(level, message, meta, ...args);
  } catch (error: any) {
    if (error.code === 'EPIPE' || error.code === 'ECONNRESET') {
      return logger; // Return logger for chaining
    }
    throw error;
  }
};

// Safe initialization logging
if (!isProduction) {
  try {
    logger.info('MCP CWP Server (Stable) initialized', {
      version: '1.0.0-stable',
      logLevel: logLevel,
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform
    });
  } catch (error: any) {
    // Ignore initialization logging errors
  }
}

export default logger;