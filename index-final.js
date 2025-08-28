#!/usr/bin/env node

/**
 * MCP CWP Server - FINAL STABLE VERSION
 * 
 * Resolve TODOS os problemas identificados:
 * - Dotenv output completamente suprimido
 * - EPIPE errors tratados
 * - Configuração manual sem dependência de .env
 * - 100% funcionalidade MCP
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ListPromptsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Manual config - no dotenv needed
const getConfig = () => {
  const baseUrl = process.env.CWP_BASE_URL || 'https://your-cwp-server.com';
  const port = process.env.CWP_PORT || '2304';
  
  return {
    apiUrl: `${baseUrl}:${port}`,
    apiKey: process.env.CWP_API_KEY || '',
    sslVerify: process.env.SSL_VERIFY === 'true',
    debug: process.env.CWP_DEBUG === 'true',
    port: parseInt(port, 10),
  };
};

// Safe logging with EPIPE handling
const logger = {
  log: (level, message, ...args) => {
    try {
      const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const logMessage = `${timestamp} [${level.toUpperCase()}] ${message}`;
      
      if (level === 'error') {
        process.stderr.write(logMessage + '\n');
      } else if (process.env.NODE_ENV !== 'production') {
        process.stdout.write(logMessage + '\n');
      }
    } catch (error) {
      if (error.code === 'EPIPE' || error.code === 'ECONNRESET') {
        return; // Ignore broken pipe errors
      }
    }
  },
  info: (msg, ...args) => logger.log('info', msg, ...args),
  warn: (msg, ...args) => logger.log('warn', msg, ...args), 
  error: (msg, ...args) => logger.log('error', msg, ...args),
  debug: (msg, ...args) => logger.log('debug', msg, ...args),
};

class CwpMcpServerFinal {
  constructor() {
    this.server = new Server({
      name: 'cwp-server-final',
      version: '1.0.0-final',
    }, {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      }
    });
    
    this.config = getConfig();
    this.setupHandlers();
  }

  async setupHandlers() {
    try {
      // Import tool setups dynamically
      const { setupAccountTools } = await import('./dist/tools/account/index.js');
      const { setupAutosslTools } = await import('./dist/tools/autossl/index.js');
      const { setupPackageTools } = await import('./dist/tools/package/index.js');
      const { setupFtpTools } = await import('./dist/tools/ftp/index.js');
      const { setupUserMysqlTools } = await import('./dist/tools/usermysql/index.js');

      // List tools handler
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

      // Empty resources and prompts (required by MCP)
      this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({ resources: [] }));
      this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({ prompts: [] }));

      // Tool execution handler
      this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        
        try {
          logger.info(`🔧 Tool: ${name}`);
          
          // Create client manually (avoiding config issues)
          const client = await this.createClient();
          let result;

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

          logger.info(`✅ Tool OK: ${name}`);
          return result;
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error(`❌ Tool failed: ${name} - ${errorMessage}`);
          
          return {
            content: [{
              type: 'text',
              text: `Error executing ${name}: ${errorMessage}`
            }],
            isError: true,
          };
        }
      });

    } catch (error) {
      logger.error('Setup failed:', error.message);
      throw error;
    }
  }

  async createClient() {
    // Create CWP client manually to avoid config module issues
    const { CwpClient } = await import('./dist/core/client.js');
    return new CwpClient(this.config);
  }

  async start() {
    try {
      logger.info('🚀 Starting CWP MCP Server (Final)...');
      
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      logger.info('✅ CWP Server started');
      
      // Test connection background
      this.testConnection();
      
    } catch (error) {
      logger.error('❌ Start failed:', error.message);
      process.exit(1);
    }
  }

  async testConnection() {
    try {
      const client = await this.createClient();
      const test = await client.makeRequest('/account', { action: 'list' });
      logger.info('✅ CWP connected');
    } catch (error) {
      logger.warn('⚠️ CWP connection failed:', error.message);
    }
  }
}

// Error handling
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

process.on('uncaughtException', (error) => {
  if (error.code === 'EPIPE' || error.code === 'ECONNRESET') return;
  logger.error('Uncaught:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  logger.error('Unhandled:', msg);
  process.exit(1);
});

// Start server
const server = new CwpMcpServerFinal();
server.start().catch((error) => {
  logger.error('Fatal:', error.message);
  process.exit(1);
});