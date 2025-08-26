import winston from 'winston';
import fs from 'fs';
import path from 'path';

// MCP Guide compliant: Development = 'silly', Production = 'error'
const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'error' : 'silly');

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// MCP Guide compliant transport configuration
const transports: winston.transport[] = [];

if (isProduction) {
  // Production: Log to stderr for MCP compatibility
  transports.push(
    new winston.transports.Console({
      level: logLevel,
      handleExceptions: true,
      format: winston.format.simple(),
      stderrLevels: ['error', 'warn', 'info', 'debug', 'silly'],
    })
  );
  
  // Optional file logging in production
  if (process.env.ENABLE_FILE_LOGS === 'true') {
    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, 'app.log'),
        level: 'warn',
        maxsize: 2000000, // 2MB (MCP Guide spec)
        maxFiles: 1,
        handleExceptions: true,
      })
    );
  }
} else {
  // Development: Exhaustive logging (MCP Guide requirement)
  // Console with colors for development
  // Always add console transport in development for MCP compatibility
  transports.push(
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
  
  // Multiple log files for development (MCP Guide spec)
  transports.push(
    // All logs
    new winston.transports.File({
      filename: path.join(logsDir, 'development-full.log'),
      level: 'silly',
      maxsize: 50000000, // 50MB for development
      maxFiles: 5,
      handleExceptions: true,
    }),
    // Error logs
    new winston.transports.File({
      filename: path.join(logsDir, 'errors.log'),
      level: 'error',
      maxsize: 10000000, // 10MB
      maxFiles: 3,
      handleExceptions: true,
    }),
    // Debug logs
    new winston.transports.File({
      filename: path.join(logsDir, 'debug-tools.log'),
      level: 'debug',
      maxsize: 20000000, // 20MB
      maxFiles: 3,
      handleExceptions: true,
    })
  );
}

// Format configuration based on environment
const format = isProduction
  ? winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    )
  : winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
      winston.format.printf(({ timestamp, level, message, stack, metadata }) => {
        const meta = metadata && Object.keys(metadata).length ? `\n${JSON.stringify(metadata, null, 2)}` : '';
        return `${timestamp} [${level}]: ${message}${stack ? '\n' + stack : ''}${meta}`;
      })
    );

export const logger = winston.createLogger({
  level: logLevel,
  format,
  transports,
  exitOnError: false,
});

// Log initialization (MCP Guide requirement)
if (!isProduction) {
  logger.info('='.repeat(80));
  logger.info('MCP CWP SERVER INITIALIZATION', {
    server: 'mcp-cwp',
    version: process.env.MCP_IMPLEMENTATION_VERSION || '1.0.0',
    timestamp: new Date().toISOString(),
    pid: process.pid,
    nodeVersion: process.version,
    platform: process.platform,
    environment: process.env.NODE_ENV,
    logLevel: logLevel,
  });
  logger.info('='.repeat(80));
}

export default logger;