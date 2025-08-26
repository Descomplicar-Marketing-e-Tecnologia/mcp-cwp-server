#!/usr/bin/env node

/**
 * Teste rápido do MCP CWP
 * Teste as funcionalidades principais do servidor
 */

import { spawn } from 'child_process';

async function testMcp() {
    console.log('🧪 Testando MCP CWP Server...\n');
    
    const server = spawn('node', ['index.js'], {
        cwd: '/home/ealmeida/mcp-servers/mcp-cwp',
        stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let responseBuffer = '';
    
    server.stdout.on('data', (data) => {
        responseBuffer += data.toString();
    });
    
    server.stderr.on('data', (data) => {
        console.log('Server:', data.toString().trim());
    });
    
    // Aguardar servidor iniciar
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Teste 1: Initialize
    console.log('📋 Teste 1: Initialize');
    const initRequest = {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: { name: "test", version: "1.0.0" }
        }
    };
    
    server.stdin.write(JSON.stringify(initRequest) + '\n');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Teste 2: Tools List
    console.log('🔧 Teste 2: List Tools');
    const toolsRequest = {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list",
        params: {}
    };
    
    server.stdin.write(JSON.stringify(toolsRequest) + '\n');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Teste 3: Test Connection
    console.log('🌐 Teste 3: Test CWP Connection');
    const testRequest = {
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
            name: "cwp_test_connection",
            arguments: {}
        }
    };
    
    server.stdin.write(JSON.stringify(testRequest) + '\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    server.kill();
    
    console.log('\n📊 Resultados dos testes:');
    const responses = responseBuffer.split('\n').filter(line => line.trim());
    responses.forEach((response, index) => {
        if (response.trim()) {
            try {
                const parsed = JSON.parse(response);
                console.log(`Resposta ${index + 1}:`, JSON.stringify(parsed, null, 2));
            } catch (e) {
                console.log(`Resposta ${index + 1} (raw):`, response);
            }
        }
    });
}

testMcp().catch(console.error);