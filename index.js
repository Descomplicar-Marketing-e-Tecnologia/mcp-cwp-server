#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
    CallToolRequestSchema,
    ListToolsRequestSchema,
    InitializeRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import https from 'https';

console.error('🚀 CWP MCP Server iniciando...');

class CwpMcpServer {
    constructor() {
        this.server = new Server(
            {
                name: 'cwp',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );
        
        this.cwpApiUrl = process.env.CWP_API_URL || 'https://your-cwp-server.com';
        this.cwpApiKey = process.env.CWP_API_KEY;
        this.cwpPort = process.env.CWP_PORT || '2304';
        this.cwpSslVerify = process.env.CWP_SSL_VERIFY !== 'false';
        
        this.setupHandlers();
    }
    
    setupHandlers() {
        // Handler de inicialização
        this.server.setRequestHandler(InitializeRequestSchema, async (request) => {
            return {
                protocolVersion: '2024-11-05',
                capabilities: {
                    tools: {},
                },
                serverInfo: {
                    name: 'cwp-server',
                    version: '1.0.0',
                },
            };
        });
        
        // Handler para listar ferramentas
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'cwp_test_connection',
                        description: 'Testar conexão com CWP API',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                    {
                        name: 'cwp_account_list',
                        description: 'Lista todas as contas de usuário no CWP',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                    {
                        name: 'cwp_server_info',
                        description: 'Obter informações do servidor CWP',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                ],
            };
        });
        
        // Handler para executar ferramentas
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name } = request.params;
            
            try {
                switch (name) {
                    case 'cwp_test_connection':
                        return await this.testConnection();
                    
                    case 'cwp_account_list':
                        return await this.listAccounts();
                    
                    case 'cwp_server_info':
                        return await this.getServerInfo();
                    
                    default:
                        throw new Error(`Ferramenta não encontrada: ${name}`);
                }
            } catch (error) {
                console.error(`Erro ao executar ${name}:`, error.message);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Erro ao executar ${name}: ${error.message}`,
                        },
                    ],
                };
            }
        });
    }
    
    async testConnection() {
        try {
            if (!this.cwpApiKey) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: '⚠️ CWP_API_KEY não configurada. Configure as credenciais para testar a conexão.',
                        },
                    ],
                };
            }
            
            const url = `${this.cwpApiUrl}:${this.cwpPort}/v1/account`;
            const params = new URLSearchParams();
            params.append('key', this.cwpApiKey);
            params.append('action', 'list');
            
            const response = await axios.post(url, params, { 
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                httpsAgent: new https.Agent({
                    rejectUnauthorized: this.cwpSslVerify
                })
            });
            
            // Check if response contains error message
            if (response.data && response.data.status === 'Error') {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ Erro CWP: ${response.data.msj}`,
                        },
                    ],
                };
            }
            
            return {
                content: [
                    {
                        type: 'text',
                        text: '✅ Conexão com CWP API estabelecida com sucesso!',
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ Erro de conexão com CWP: ${error.message}`,
                    },
                ],
            };
        }
    }
    
    async listAccounts() {
        try {
            if (!this.cwpApiKey) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: '⚠️ CWP_API_KEY não configurada',
                        },
                    ],
                };
            }
            
            const url = `${this.cwpApiUrl}:${this.cwpPort}/v1/account`;
            const params = new URLSearchParams();
            params.append('key', this.cwpApiKey);
            params.append('action', 'list');
            
            const response = await axios.post(url, params, { 
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                httpsAgent: new https.Agent({
                    rejectUnauthorized: this.cwpSslVerify
                })
            });
            
            return {
                content: [
                    {
                        type: 'text',
                        text: `📋 Contas CWP:\n${JSON.stringify(response.data, null, 2)}`,
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ Erro ao listar contas: ${error.message}`,
                    },
                ],
            };
        }
    }
    
    async getServerInfo() {
        return {
            content: [
                {
                    type: 'text',
                    text: `🖥️ CWP Server Info:
URL: ${this.cwpApiUrl}:${this.cwpPort}
API Key: ${this.cwpApiKey ? '✅ Configurada' : '❌ Não configurada'}
SSL Verify: ${this.cwpSslVerify ? '✅ Activado' : '❌ Desactivado'}
Status: ✅ MCP Server funcionando`,
                },
            ],
        };
    }
    
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('✅ CWP MCP Server rodando no stdio');
    }
}

// Inicializar servidor
const server = new CwpMcpServer();
server.run().catch((error) => {
    console.error('❌ Erro fatal no CWP MCP Server:', error);
    process.exit(1);
});
