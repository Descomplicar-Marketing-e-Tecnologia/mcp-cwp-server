#!/usr/bin/env node

/**
 * MCP CWP Server - STABLE VERSION
 * 
 * Versão estável que resolve os principais problemas:
 * - EPIPE errors no logging (silenciados)
 * - Health checks removidos (causavam loops)
 * - Performance monitoring desativado
 * - Logging otimizado para MCP environment
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ListPromptsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Config modules will be imported dynamically to avoid dotenv stdout issues

// Safe logging that handles EPIPE gracefully  
const createSafeLogger = () => {
  const safeLog = (level, message, ...args) => {
    try {
      const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const logMessage = `${timestamp} [${level.toUpperCase()}] ${message}`;
      
      if (level === 'error') {
        console.error(logMessage, ...args);
      } else {
        console.log(logMessage, ...args);
      }
    } catch (error) {
      // Silently ignore EPIPE and connection reset errors
      if (error.code === 'EPIPE' || error.code === 'ECONNRESET') {
        return;
      }
      // For other errors, attempt to log to stderr if possible
      try {
        process.stderr.write(`Logger error: ${error.message}\n`);
      } catch {
        // If even that fails, give up silently
      }
    }
  };

  return {
    info: (msg, ...args) => safeLog('info', msg, ...args),
    warn: (msg, ...args) => safeLog('warn', msg, ...args),
    error: (msg, ...args) => safeLog('error', msg, ...args),
    debug: (msg, ...args) => {
      if (process.env.NODE_ENV !== 'production') {
        safeLog('debug', msg, ...args);
      }
    }
  };
};

const logger = createSafeLogger();

/**
 * Stable MCP Server Class
 */
class CwpMcpServerStable {
  constructor() {
    this.server = new Server({
      name: 'cwp-server-stable',
      version: '1.0.0-stable',
    }, {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      }
    });
    
    // Config and auth will be initialized async
    this.cwpAuth = null;
    this.cwpConfig = null;
  }

  async initialize() {
    try {
      // Dynamic import to avoid dotenv stdout pollution
      const { cwpConfig } = await import('./dist/core/config.js');
      const { CwpAuth } = await import('./dist/core/auth.js');
      
      this.cwpConfig = cwpConfig;
      this.cwpAuth = new CwpAuth(cwpConfig);
      
      await this.setupHandlers();
      logger.info('✅ CWP Server initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize CWP Server:', error.message);
      throw error;
    }
  }

  async setupHandlers() {
    try {
      // Import tool setups
      const { setupAccountTools } = await import('./dist/tools/account/index.js');
      const { setupAutosslTools } = await import('./dist/tools/autossl/index.js');
      const { setupPackageTools } = await import('./dist/tools/package/index.js');
      const { setupFtpTools } = await import('./dist/tools/ftp/index.js');
      const { setupUserMysqlTools } = await import('./dist/tools/usermysql/index.js');

      // Handler for listing all available tools
      this.server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
          tools: [
            ...setupAccountTools(),
            ...setupAutosslTools(),
            ...setupPackageTools(),
            ...setupFtpTools(),
            ...setupUserMysqlTools(),
          ],
        };
      });

      // Handler for listing resources (required by MCP protocol)
      this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
        return { resources: [] };
      });

      // Handler for listing prompts (required by MCP protocol)  
      this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
        return { prompts: [] };
      });

      // Handler for executing tool calls
      this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        
        try {
          logger.info(`🔧 Tool called: ${name}`);
          
          const client = this.cwpAuth.getClient();
          let result;

          // Route to appropriate tool handler based on tool name prefix
          if (name.startsWith('cwp_account_')) {
            const { handleAccountTool } = await import('./dist/tools/account/controller.js');
            result = await handleAccountTool(name, args, client);
          }
          else if (name.startsWith('cwp_autossl_')) {
            const { handleAutosslTool } = await import('./dist/tools/autossl/controller.js');
            result = await handleAutosslTool(name, args, client);
          }
          else if (name.startsWith('cwp_package_')) {
            const { handlePackageTool } = await import('./dist/tools/package/controller.js');
            result = await handlePackageTool(name, args, client);
          }
          else if (name.startsWith('cwp_ftp_')) {
            const { handleFtpTool } = await import('./dist/tools/ftp/controller.js');
            result = await handleFtpTool(name, args, client);
          }
          else if (name.startsWith('cwp_usermysql_')) {
            const { handleUserMysqlTool } = await import('./dist/tools/usermysql/controller.js');
            result = await handleUserMysqlTool(name, args, client);
          }
          else {
            throw new Error(`Unknown tool: ${name}`);
          }

          logger.info(`✅ Tool ${name} executed successfully`);
          return result;
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error(`❌ Tool execution failed: ${name} - ${errorMessage}`);
          
          const { handleGenericError } = await import('./dist/middleware/errorHandler.js');
          throw handleGenericError(error);
        }
      });

    } catch (error) {
      logger.error('Failed to setup handlers:', error.message);
      throw error;
    }
  }

  /**
   * Starts the MCP server and establishes connection
   */
  async start() {
    try {
      logger.info('🚀 Starting CWP MCP Server (Stable)...');
      
      // Initialize configuration first
      await this.initialize();
      
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      logger.info('✅ CWP MCP Server (Stable) started successfully');
      
      // Test connection in background without blocking
      this.testConnectionInBackground();
      
    } catch (error) {
      logger.error('❌ Failed to start CWP MCP Server:', error.message);
      process.exit(1);
    }
  }

  /**
   * Tests CWP API connection in the background
   */
  async testConnectionInBackground() {
    try {
      logger.info('🔍 Testing CWP connection...');
      
      const connectionTest = await this.cwpAuth.testConnection();
      
      if (connectionTest.connected) {
        logger.info(`✅ CWP connection verified (version: ${connectionTest.version || 'unknown'})`);
      } else {
        logger.warn(`⚠️ CWP connection failed: ${connectionTest.error || 'unknown error'}`);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(`⚠️ Background CWP connection test failed: ${errorMessage}`);
    }
  }
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions gracefully
process.on('uncaughtException', (error) => {
  if (error.code === 'EPIPE' || error.code === 'ECONNRESET') {
    // Silently ignore broken pipe errors
    return;
  }
  logger.error('Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  const reasonStr = reason instanceof Error ? reason.message : String(reason);
  logger.error('Unhandled Rejection:', reasonStr);
  process.exit(1);
});

// Start server
const server = new CwpMcpServerStable();
server.start().catch((error) => {
  logger.error('Unhandled error:', error.message);
  process.exit(1);
});