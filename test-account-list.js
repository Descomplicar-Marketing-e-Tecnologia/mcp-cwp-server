#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

async function testAccountList() {
    try {
        console.log('🚀 Iniciando teste cwp_account_list...');
        
        // Spawn do servidor MCP CWP
        const serverProcess = spawn('node', ['dist/index.js'], {
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: '/home/ealmeida/mcp-servers/mcp-cwp'
        });
        
        // Criar cliente MCP
        const transport = new StdioClientTransport({
            command: 'node',
            args: ['dist/index.js'],
            cwd: '/home/ealmeida/mcp-servers/mcp-cwp'
        });
        
        const client = new Client(
            {
                name: 'test-client',
                version: '1.0.0'
            },
            {
                capabilities: {}
            }
        );
        
        await client.connect(transport);
        console.log('✅ Conectado ao servidor MCP CWP');
        
        // Listar ferramentas disponíveis
        console.log('📋 Listando ferramentas...');
        const tools = await client.listTools();
        console.log(`Encontradas ${tools.tools.length} ferramentas`);
        
        const accountListTool = tools.tools.find(t => t.name === 'cwp_account_list');
        if (!accountListTool) {
            console.log('❌ Ferramenta cwp_account_list não encontrada');
            console.log('Ferramentas disponíveis:', tools.tools.map(t => t.name));
            return;
        }
        
        console.log('✅ Ferramenta cwp_account_list encontrada');
        
        // Executar cwp_account_list
        console.log('🔧 Executando cwp_account_list...');
        const result = await client.callTool({
            name: 'cwp_account_list',
            arguments: {}
        });
        
        console.log('✅ Resultado:', JSON.stringify(result, null, 2));
        
        await client.close();
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.error(error.stack);
    }
}

testAccountList().catch(console.error);