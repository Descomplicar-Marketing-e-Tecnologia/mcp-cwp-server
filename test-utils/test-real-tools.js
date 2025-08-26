#!/usr/bin/env node

import { spawn } from 'child_process';

const mcpServer = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  env: { ...process.env }
});

console.log('🧪 Testing Real CWP MCP Tools...\n');

const tests = [
  {
    name: 'List Tools',
    request: { jsonrpc: '2.0', id: 1, method: 'tools/list' }
  },
  {
    name: 'Account List',
    request: { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'cwp:account:list', arguments: {} } }
  },
  {
    name: 'Package List', 
    request: { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'cwp:package:list', arguments: {} } }
  },
  {
    name: 'AutoSSL List',
    request: { jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'cwp:autossl:list', arguments: {} } }
  },
  {
    name: 'FTP List',
    request: { jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'cwp:ftp:list', arguments: { user: 'ealmeida' } } }
  },
  {
    name: 'UserMySQL List',
    request: { jsonrpc: '2.0', id: 6, method: 'tools/call', params: { name: 'cwp:usermysql:list', arguments: { user: 'ealmeida' } } }
  }
];

let currentTest = 0;

function runNextTest() {
  if (currentTest >= tests.length) {
    mcpServer.kill();
    console.log('\n✅ All tests completed!');
    process.exit(0);
    return;
  }

  const test = tests[currentTest];
  console.log(`📋 Test ${currentTest + 1}: ${test.name}`);
  
  mcpServer.stdin.write(JSON.stringify(test.request) + '\n');
  currentTest++;
  
  setTimeout(runNextTest, 3000);
}

mcpServer.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      if (response.result) {
        if (response.result.tools) {
          console.log(`✅ Found ${response.result.tools.length} tools`);
        } else if (response.result.content) {
          const content = response.result.content[0]?.text || '';
          const preview = content.length > 100 ? content.substring(0, 100) + '...' : content;
          console.log(`✅ Result: ${preview}`);
        }
      } else if (response.error) {
        console.log(`❌ Error: ${response.error.message}`);
      }
    } catch (e) {
      if (!line.includes('info') && !line.includes('debug')) {
        console.log('📝 Raw:', line.substring(0, 100));
      }
    }
  });
});

setTimeout(() => {
  runNextTest();
}, 2000);