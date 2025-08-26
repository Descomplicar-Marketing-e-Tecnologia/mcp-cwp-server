#!/usr/bin/env node

import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

// Test MCP server communication
const mcpServer = spawn('node', ['index.js'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  env: { ...process.env }
});

// Test 1: List tools
const listToolsRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list'
};

console.log('🧪 Testing MCP Server...\n');

// Test 2: List accounts
const listAccountsRequest = {
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/call',
  params: {
    name: 'cwp_account_list',
    arguments: {}
  }
};

console.log('📋 Sending list tools request...');
mcpServer.stdin.write(JSON.stringify(listToolsRequest) + '\n');

setTimeout(() => {
  console.log('👥 Sending list accounts request...');
  mcpServer.stdin.write(JSON.stringify(listAccountsRequest) + '\n');
}, 2000);

mcpServer.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      console.log('📨 MCP Response:', JSON.stringify(response, null, 2));
    } catch (e) {
      console.log('📝 Raw output:', line);
    }
  });
});

setTimeout(() => {
  mcpServer.kill();
  console.log('\n✅ Test completed!');
  process.exit(0);
}, 5000);