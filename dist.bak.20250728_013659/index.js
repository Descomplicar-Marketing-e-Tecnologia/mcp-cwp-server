#!/usr/bin/env node
/**
 * MCP CWP Server - Main Entry Point
 *
 * This server provides a Model Context Protocol (MCP) interface for managing
 * CentOS Web Panel (CWP) resources. It enables programmatic control over
 * hosting accounts, domains, SSL certificates, FTP accounts, and databases.
 *
 * @author Descomplicar - Agência de Aceleração Digital
 * @license MIT
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ListPromptsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { cwpConfig } from './core/config.js';
import { CwpAuth } from './core/auth.js';
import { logger } from './utils/logger.js';
import { handleGenericError } from './middleware/errorHandler.js';
import { logToolStart, logToolEnd, logConfiguration } from './utils/logging-helpers.js';
// Import tool setup functions
import { setupAccountTools } from './tools/account/index.js';
import { setupAutosslTools } from './tools/autossl/index.js';
import { setupPackageTools } from './tools/package/index.js';
import { setupFtpTools } from './tools/ftp/index.js';
import { setupUserMysqlTools } from './tools/usermysql/index.js';
/**
 * Main MCP server class that handles all CWP operations
 */
class CwpMcpServer {
    server;
    cwpAuth;
    constructor() {
        this.server = new Server({
            name: 'cwp-server',
            version: '1.0.0',
        });
        this.cwpAuth = new CwpAuth(cwpConfig);
        // Log configuration (MCP Guide requirement)
        logConfiguration(cwpConfig);
        this.setupHandlers();
    }
    /**
     * Sets up request handlers for MCP protocol
     * Registers handlers for listing tools and calling specific tools
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
            // Log tool call start (MCP Guide requirement)
            const toolContext = logToolStart(name, args);
            try {
                const client = this.cwpAuth.getClient();
                let result;
                // Route to appropriate tool handler based on tool name prefix
                if (name.startsWith('cwp:account:')) {
                    const { handleAccountTool } = await import('./tools/account/controller.js');
                    result = await handleAccountTool(name, args, client);
                }
                else if (name.startsWith('cwp:autossl:')) {
                    const { handleAutosslTool } = await import('./tools/autossl/controller.js');
                    result = await handleAutosslTool(name, args, client);
                }
                else if (name.startsWith('cwp:package:')) {
                    const { handlePackageTool } = await import('./tools/package/controller.js');
                    result = await handlePackageTool(name, args, client);
                }
                else if (name.startsWith('cwp:ftp:')) {
                    const { handleFtpTool } = await import('./tools/ftp/controller.js');
                    result = await handleFtpTool(name, args, client);
                }
                else if (name.startsWith('cwp:usermysql:')) {
                    const { handleUserMysqlTool } = await import('./tools/usermysql/controller.js');
                    result = await handleUserMysqlTool(name, args, client);
                }
                else {
                    throw new Error(`Unknown tool: ${name}`);
                }
                // Log tool call success
                logToolEnd(toolContext, result);
                return result;
            }
            catch (error) {
                // Log tool call failure
                logToolEnd(toolContext, null, error);
                throw handleGenericError(error);
            }
        });
    }
    /**
     * Starts the MCP server and establishes connection
     */
    async start() {
        try {
            logger.info('Starting CWP MCP Server...');
            const transport = new StdioServerTransport();
            await this.server.connect(transport);
            logger.info('CWP MCP Server started successfully');
            // Test connection in background after server is ready
            this.testConnectionInBackground();
        }
        catch (error) {
            logger.error('Failed to start CWP MCP Server:', error);
            process.exit(1);
        }
    }
    /**
     * Tests CWP API connection in the background
     * This ensures the server can communicate with CWP but doesn't block startup
     */
    async testConnectionInBackground() {
        try {
            logger.info('Testing CWP connection in background...');
            const connectionTest = await this.cwpAuth.testConnection();
            if (connectionTest.connected) {
                logger.info(`CWP connection verified (version: ${connectionTest.version})`);
            }
            else {
                logger.warn(`CWP connection failed: ${connectionTest.error} - Tools will fail until connection is restored`);
            }
        }
        catch (error) {
            logger.warn('Background CWP connection test failed:', error);
        }
    }
}
const server = new CwpMcpServer();
server.start().catch((error) => {
    logger.error('Unhandled error:', error);
    process.exit(1);
});
