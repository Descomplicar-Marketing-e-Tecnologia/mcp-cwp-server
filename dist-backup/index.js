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
// Enterprise Features - 100% Methodology
import { initializeHealthChecker, getHealthChecker } from './core/health.js';
import { metricsCollector } from './core/metrics.js';
import { initializeFeatureFlags, isFeatureEnabled, getFeatureValue } from './core/feature-flags.js';
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
        }, {
            capabilities: {
                tools: {},
                resources: {},
                prompts: {},
            }
        });
        this.cwpAuth = new CwpAuth(cwpConfig);
        // Initialize Enterprise Features - 100% Methodology
        this.initializeEnterpriseFeatures();
        // Log configuration (MCP Guide requirement)
        logConfiguration(cwpConfig);
        this.setupHandlers();
    }
    /**
     * Initialize Enterprise Features for 100% Methodology Compliance
     */
    initializeEnterpriseFeatures() {
        try {
            // Initialize Feature Flags
            initializeFeatureFlags();
            logger.info('Feature flags initialized');
            // Initialize Health Checker if enabled
            if (isFeatureEnabled('health_checks')) {
                const client = this.cwpAuth.getClient();
                const healthChecker = initializeHealthChecker(client);
                const healthConfig = getFeatureValue('health_checks', { interval: 30000 });
                if (typeof healthConfig === 'object' && healthConfig && 'interval' in healthConfig) {
                    healthChecker.startMonitoring(healthConfig.interval);
                    logger.info('Health monitoring started', { interval: healthConfig.interval });
                }
            }
            // Log enterprise features status
            logger.info('Enterprise features initialized', {
                feature_flags: isFeatureEnabled('feature_flags'),
                performance_monitoring: isFeatureEnabled('performance_monitoring'),
                health_checks: isFeatureEnabled('health_checks'),
                defensive_queries: isFeatureEnabled('defensive_queries'),
                cache_optimization: isFeatureEnabled('cache_optimization')
            });
        }
        catch (error) {
            logger.warn('Enterprise features initialization failed', { error: error.message });
        }
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
            // Performance monitoring - Start timing
            const startTime = Date.now();
            // Log tool call start (MCP Guide requirement)
            const toolContext = logToolStart(name, args);
            try {
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
                // Record performance metrics - Success
                const duration = Date.now() - startTime;
                if (isFeatureEnabled('performance_monitoring')) {
                    metricsCollector.recordToolCall(name, duration, true);
                }
                // Log tool call success
                logToolEnd(toolContext, result);
                return result;
            }
            catch (error) {
                // Record performance metrics - Error
                const duration = Date.now() - startTime;
                if (isFeatureEnabled('performance_monitoring')) {
                    metricsCollector.recordToolCall(name, duration, false, error);
                }
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
            // Start performance monitoring report if enabled
            if (isFeatureEnabled('performance_monitoring')) {
                this.startPerformanceReporting();
            }
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
    /**
     * Start periodic performance reporting
     */
    startPerformanceReporting() {
        const reportInterval = 300000; // 5 minutes
        setInterval(() => {
            try {
                const report = metricsCollector.generateReport();
                logger.info('Performance Report', { report });
                // Log health status if available
                const healthChecker = getHealthChecker();
                if (healthChecker) {
                    const health = healthChecker.getCurrentHealth();
                    if (health && health.status !== 'healthy') {
                        logger.warn('Health Status Alert', { status: health.status, checks: health.checks });
                    }
                }
            }
            catch (error) {
                logger.error('Performance reporting error:', error);
            }
        }, reportInterval);
        logger.info('Performance reporting started', { intervalMinutes: reportInterval / 60000 });
    }
}
const server = new CwpMcpServer();
server.start().catch((error) => {
    logger.error('Unhandled error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map