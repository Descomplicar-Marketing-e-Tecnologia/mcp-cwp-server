#!/usr/bin/env node

console.error('🚀 CWP MCP Server persistente iniciando...');

// Simular servidor MCP básico que não sai
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Simular resposta MCP
function sendMCPResponse(id, result) {
    const response = {
        jsonrpc: "2.0",
        id: id,
        result: result
    };
    console.log(JSON.stringify(response));
}

// Handler para mensagens MCP
rl.on('line', (line) => {
    try {
        const message = JSON.parse(line);
        
        if (message.method === 'initialize') {
            sendMCPResponse(message.id, {
                protocolVersion: "2024-11-05",
                capabilities: {
                    tools: {}
                },
                serverInfo: {
                    name: "cwp",
                    version: "1.0.0"
                }
            });
        } else if (message.method === 'tools/list') {
            sendMCPResponse(message.id, {
                tools: [
                    {
                        name: 'cwp_test',
                        description: 'Teste do servidor CWP',
                        inputSchema: {
                            type: 'object',
                            properties: {}
                        }
                    },
                    {
                        name: 'cwp_info',
                        description: 'Informações do servidor CWP',
                        inputSchema: {
                            type: 'object',
                            properties: {}
                        }
                    }
                ]
            });
        } else if (message.method === 'tools/call') {
            const toolName = message.params.name;
            let result = {};
            
            if (toolName === 'cwp_test') {
                result = {
                    content: [{
                        type: 'text',
                        text: '✅ CWP MCP Server está funcionando!\n🔗 URL: ' + (process.env.CWP_API_URL || 'https://server.descomplicar.pt') + '\n🔑 API Key: ' + (process.env.CWP_API_KEY ? 'Configurada' : 'Não configurada')
                    }]
                };
            } else if (toolName === 'cwp_info') {
                result = {
                    content: [{
                        type: 'text',
                        text: '🖥️ Informações do CWP:\n' +
                              'URL: ' + (process.env.CWP_API_URL || 'N/A') + '\n' +
                              'Porta: ' + (process.env.CWP_PORT || 'N/A') + '\n' +
                              'Status: ✅ Servidor MCP ativo'
                    }]
                };
            }
            
            sendMCPResponse(message.id, result);
        }
    } catch (error) {
        console.error('Erro ao processar mensagem MCP:', error.message);
    }
});

// Evitar que o processo termine
rl.on('close', () => {
    console.error('⚠️ STDIN fechou, mantendo processo ativo...');
    setInterval(() => {
        // Manter processo vivo
    }, 5000);
});

// Manter processo sempre ativo
process.stdin.on('end', () => {
    console.error('⚠️ STDIN terminou, mantendo servidor ativo...');
});

console.error('✅ CWP MCP Server rodando no stdio');

// Garantir que o processo não termine
setInterval(() => {
    // Keep alive
}, 30000);
