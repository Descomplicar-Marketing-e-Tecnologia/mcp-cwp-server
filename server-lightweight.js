#!/usr/bin/env node
/**
 * MCP CWP Server - Lightweight Version
 * 
 * Versão otimizada sem enterprise features que consomem recursos excessivos
 * Desativa: health monitoring, performance metrics, cache automático
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';

// Core imports apenas o essencial
import { cwpConfig } from './dist/core/config.js';
import { CwpAuth } from './dist/core/auth.js';
import { logger } from './dist/utils/logger.js';

// Import apenas tools necessários
import { setupAccountTools } from './dist/tools/account/index.js';
import { setupAutosslTools } from './dist/tools/autossl/index.js';
import { setupPackageTools } from './dist/tools/package/index.js';
import { setupFtpTools } from './dist/tools/ftp/index.js';
import { setupUserMysqlTools } from './dist/tools/usermysql/index.js';

class CwpMcpServerLightweight {
  constructor() {
    this.server = new Server({
      name: 'cwp-server-lightweight',
      version: '1.0.0-lite',
    }, {
      capabilities: {
        tools: {},
      }
    });
    
    this.cwpAuth = new CwpAuth(cwpConfig);
    this.setupHandlers();
    logger.info('🚀 CWP MCP Server (Lightweight) started');
  }

  setupHandlers() {
    // Handler para listar tools
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

    // Handler para executar tools
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        logger.info(`🔧 Tool called: ${name}`);
        
        // Dispatch para controllers sem metrics/health checks
        switch (name) {
          case 'cwp_account_create': {
            const { handleAccountTool } = await import('./dist/tools/account/controller.js');
            return await handleAccountTool(name, args, this.cwpAuth.getClient());
          }
          case 'cwp_account_update': {
            const { handleAccountTool } = await import('./dist/tools/account/controller.js');
            return await handleAccountTool(name, args, this.cwpAuth.getClient());
          }
          case 'cwp_account_delete': {
            const { handleAccountTool } = await import('./dist/tools/account/controller.js');
            return await handleAccountTool(name, args, this.cwpAuth.getClient());
          }
          case 'cwp_account_suspend': {
            const { handleAccountTool } = await import('./dist/tools/account/controller.js');
            return await handleAccountTool(name, args, this.cwpAuth.getClient());
          }
          case 'cwp_account_unsuspend': {
            const { handleAccountTool } = await import('./dist/tools/account/controller.js');
            return await handleAccountTool(name, args, this.cwpAuth.getClient());
          }
          case 'cwp_account_reset_password': {
            const { handleAccountTool } = await import('./dist/tools/account/controller.js');
            return await handleAccountTool(name, args, this.cwpAuth.getClient());
          }
          case 'cwp_account_info': {
            const { handleAccountTool } = await import('./dist/tools/account/controller.js');
            return await handleAccountTool(name, args, this.cwpAuth.getClient());
          }
          case 'cwp_account_list': {
            const { handleAccountTool } = await import('./dist/tools/account/controller.js');
            return await handleAccountTool(name, args, this.cwpAuth.getClient());
          }
          case 'cwp_account_quota_check': {
            const { handleAccountTool } = await import('./dist/tools/account/controller.js');
            return await handleAccountTool(name, args, this.cwpAuth.getClient());
          }
          case 'cwp_account_metadata': {
            const { handleAccountTool } = await import('./dist/tools/account/controller.js');
            return await handleAccountTool(name, args, this.cwpAuth.getClient());
          }
          
          case 'cwp_autossl_install': {
            const { handleAutosslTool } = await import('./dist/tools/autossl/controller.js');
            return await handleAutosslTool(name, args, this.cwpAuth.getClient());
          }
          case 'cwp_autossl_renew': {
            const { handleAutosslTool } = await import('./dist/tools/autossl/controller.js');
            return await handleAutosslTool(name, args, this.cwpAuth.getClient());
          }
          case 'cwp_autossl_list': {
            const { handleAutosslTool } = await import('./dist/tools/autossl/controller.js');
            return await handleAutosslTool(name, args, this.cwpAuth.getClient());
          }
          case 'cwp_autossl_delete': {
            const { handleAutosslTool } = await import('./dist/tools/autossl/controller.js');
            return await handleAutosslTool(name, args, this.cwpAuth.getClient());
          }
          
          case 'cwp_package_list': {
            const { handlePackageTool } = await import('./dist/tools/package/controller.js');
            return await handlePackageTool(name, args, this.cwpAuth.getClient());
          }
          
          case 'cwp_ftp_list': {
            const { handleFtpTool } = await import('./dist/tools/ftp/controller.js');
            return await handleFtpTool(name, args, this.cwpAuth.getClient());
          }
          case 'cwp_ftp_create': {
            const { handleFtpTool } = await import('./dist/tools/ftp/controller.js');
            return await handleFtpTool(name, args, this.cwpAuth.getClient());
          }
          case 'cwp_ftp_delete': {
            const { handleFtpTool } = await import('./dist/tools/ftp/controller.js');
            return await handleFtpTool(name, args, this.cwpAuth.getClient());
          }
          case 'cwp_ftp_update_permissions': {
            const { handleFtpTool } = await import('./dist/tools/ftp/controller.js');
            return await handleFtpTool(name, args, this.cwpAuth.getClient());
          }
          
          case 'cwp_usermysql_list': {
            const { handleUserMysqlTool } = await import('./dist/tools/usermysql/controller.js');
            return await handleUserMysqlTool(name, args, this.cwpAuth.getClient());
          }
          
          default:
            return {
              content: [{
                type: 'text',
                text: `❌ Tool '${name}' not found`
              }],
            };
        }
        
      } catch (error) {
        logger.error(`Tool execution failed: ${name}`, error);
        return {
          content: [{
            type: 'text',
            text: `❌ Error executing ${name}: ${error.message}`
          }],
          isError: true,
        };
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Start server
const server = new CwpMcpServerLightweight();
server.start().catch(console.error);