#!/usr/bin/env node

/**
 * Basic Usage Example for MCP CWP Server
 * 
 * This example demonstrates how to communicate with the MCP CWP Server
 * using JSON-RPC protocol over stdin/stdout.
 */

import { spawn } from 'child_process';

// Configuration
const MCP_SERVER_PATH = '../dist/index.js';

// Helper function to send requests
function sendRequest(server, request) {
  return new Promise((resolve, reject) => {
    let response = '';
    
    const handler = (data) => {
      response += data.toString();
      try {
        const lines = response.split('\n').filter(line => line.trim());
        for (const line of lines) {
          const parsed = JSON.parse(line);
          if (parsed.id === request.id) {
            server.stdout.removeListener('data', handler);
            resolve(parsed);
          }
        }
      } catch (e) {
        // Continue collecting data
      }
    };
    
    server.stdout.on('data', handler);
    server.stdin.write(JSON.stringify(request) + '\n');
    
    setTimeout(() => {
      server.stdout.removeListener('data', handler);
      reject(new Error('Request timeout'));
    }, 10000);
  });
}

async function main() {
  console.log('🚀 Starting MCP CWP Server Example...\n');
  
  // Start the MCP server
  const server = spawn('node', [MCP_SERVER_PATH], {
    stdio: ['pipe', 'pipe', 'inherit'],
    env: { ...process.env }
  });
  
  try {
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Example 1: List all available tools
    console.log('📋 Example 1: Listing available tools...');
    const toolsResponse = await sendRequest(server, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list'
    });
    
    console.log(`Found ${toolsResponse.result.tools.length} tools available\n`);
    
    // Example 2: List all accounts
    console.log('👥 Example 2: Listing accounts...');
    const accountsResponse = await sendRequest(server, {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'cwp:account:list',
        arguments: {}
      }
    });
    
    if (!accountsResponse.error) {
      console.log('Response:', accountsResponse.result.content[0].text.substring(0, 200) + '...\n');
    }
    
    // Example 3: Get account info
    console.log('🔍 Example 3: Getting account info...');
    const infoResponse = await sendRequest(server, {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'cwp:account:info',
        arguments: {
          username: 'ealmeida'  // Replace with actual username
        }
      }
    });
    
    if (!infoResponse.error) {
      console.log('Account info retrieved successfully\n');
    } else {
      console.log('Error:', infoResponse.error.message, '\n');
    }
    
    // Example 4: List packages
    console.log('📦 Example 4: Listing packages...');
    const packagesResponse = await sendRequest(server, {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'cwp:package:list',
        arguments: {}
      }
    });
    
    if (!packagesResponse.error) {
      console.log('Packages listed successfully\n');
    }
    
    console.log('✅ All examples completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Clean up
    server.kill();
    process.exit(0);
  }
}

// Run the examples
main().catch(console.error);