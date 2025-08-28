#!/usr/bin/env node
/**
 * MCP CWP Server - STABLE VERSION
 * 
 * Versão estável que corrige problemas de:
 * - EPIPE errors no logging
 * - Consumo excessivo de recursos  
 * - Health checks problemáticos
 * - Performance monitoring que causa loops
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ListPromptsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { cwpConfig } from './core/config.js';
import { CwpAuth } from './core/auth.js';
import { logger } from './utils/logger-stable.js'; // Use stable logger
import { handleGenericError } from './middleware/errorHandler.js';

// Import tool setup functions
import { setupAccountTools } from './tools/account/index.js';
import { setupAutosslTools } from './tools/autossl/index.js';
import { setupPackageTools } from './tools/package/index.js';
import { setupFtpTools } from './tools/ftp/index.js';
import { setupUserMysqlTools } from './tools/usermysql/index.js';

/**
 * Stable MCP server class without problematic enterprise features
 */
class CwpMcpServerStable {
  private server: Server;
  private cwpAuth: CwpAuth;

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
    
    this.cwpAuth = new CwpAuth(cwpConfig);
    this.setupHandlers();
  }

  /**
   * Sets up request handlers for MCP protocol
   */
  setupHandlers() {
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
      return {
        resources: [],
      };
    });

    // Handler for listing prompts (required by MCP protocol)  
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [],
      };
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
          const { handleAccountTool } = await import('./tools/account/controller.js');
          result = await handleAccountTool(name, args, client);
        }
        else if (name.startsWith('cwp_autossl_')) {
          const { handleAutosslTool } = await import('./tools/autossl/controller.js');
          result = await handleAutosslTool(name, args, client);
        }
        else if (name.startsWith('cwp_package_')) {
          const { handlePackageTool } = await import('./tools/package/controller.js');
          result = await handlePackageTool(name, args, client);
        }
        else if (name.startsWith('cwp_ftp_')) {
          const { handleFtpTool } = await import('./tools/ftp/controller.js');
          result = await handleFtpTool(name, args, client);
        }
        else if (name.startsWith('cwp_usermysql_')) {
          const { handleUserMysqlTool } = await import('./tools/usermysql/controller.js');
          result = await handleUserMysqlTool(name, args, client);
        }
        else {
          throw new Error(`Unknown tool: ${name}`);
        }

        logger.info(`✅ Tool ${name} executed successfully`);
        return result;
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`❌ Tool execution failed: ${name}`, { error: errorMessage });
        throw handleGenericError(error);
      }
    });
  }

  /**
   * Starts the MCP server and establishes connection
   */
  async start() {
    try {
      logger.info('🚀 Starting CWP MCP Server (Stable)...');
      
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      logger.info('✅ CWP MCP Server (Stable) started successfully');
      
      // Test connection in background without blocking
      this.testConnectionInBackground();
      
    } catch (error) {
      logger.error('❌ Failed to start CWP MCP Server:', error);
      process.exit(1);
    }
  }

  /**
   * Tests CWP API connection in the background
   */
  private async testConnectionInBackground() {
    try {
      logger.info('🔍 Testing CWP connection...');
      
      const connectionTest = await this.cwpAuth.testConnection();
      
      if (connectionTest.connected) {
        logger.info(`✅ CWP connection verified (version: ${connectionTest.version})`);
      } else {
        logger.warn(`⚠️ CWP connection failed: ${connectionTest.error}`);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn('⚠️ Background CWP connection test failed:', errorMessage);
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

// Start server
const server = new CwpMcpServerStable();
server.start().catch((error) => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});