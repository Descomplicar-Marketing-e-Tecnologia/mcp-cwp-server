#!/usr/bin/env node

/**
 * Account Management Example for MCP CWP Server
 * 
 * This example demonstrates account management operations:
 * - Creating accounts
 * - Updating account settings
 * - Managing account status
 * - Password resets
 */

import { spawn } from 'child_process';

const MCP_SERVER_PATH = '../dist/index.js';

class MCPClient {
  constructor() {
    this.server = null;
    this.requestId = 0;
  }
  
  async connect() {
    this.server = spawn('node', [MCP_SERVER_PATH], {
      stdio: ['pipe', 'pipe', 'inherit'],
      env: { ...process.env }
    });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  async callTool(toolName, args = {}) {
    const request = {
      jsonrpc: '2.0',
      id: ++this.requestId,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    };
    
    return new Promise((resolve, reject) => {
      let response = '';
      
      const handler = (data) => {
        response += data.toString();
        try {
          const lines = response.split('\n').filter(line => line.trim());
          for (const line of lines) {
            const parsed = JSON.parse(line);
            if (parsed.id === request.id) {
              this.server.stdout.removeListener('data', handler);
              
              if (parsed.error) {
                reject(new Error(parsed.error.message));
              } else {
                resolve(parsed.result);
              }
            }
          }
        } catch (e) {
          // Continue collecting data
        }
      };
      
      this.server.stdout.on('data', handler);
      this.server.stdin.write(JSON.stringify(request) + '\n');
      
      setTimeout(() => {
        this.server.stdout.removeListener('data', handler);
        reject(new Error('Request timeout'));
      }, 10000);
    });
  }
  
  disconnect() {
    if (this.server) {
      this.server.kill();
    }
  }
}

async function main() {
  const client = new MCPClient();
  
  try {
    console.log('🚀 Account Management Example\n');
    
    await client.connect();
    
    // Example 1: List existing accounts
    console.log('📋 1. Listing existing accounts...');
    const listResult = await client.callTool('cwp:account:list', {
      limit: 5
    });
    console.log('✅ Accounts listed successfully\n');
    
    // Example 2: Create a new account (commented out for safety)
    console.log('🆕 2. Creating a new account (example - not executed)...');
    console.log('Example command:');
    console.log(`await client.callTool('cwp:account:create', {
      domain: 'newclient.com',
      username: 'newclient',
      password: 'SecurePassword123!',
      email: 'admin@newclient.com',
      package: 'Business',
      autossl: true,
      backup: true
    });\n`);
    
    // Example 3: Update account settings
    console.log('🔧 3. Updating account settings (example)...');
    console.log('Example command:');
    console.log(`await client.callTool('cwp:account:update', {
      username: 'existinguser',
      package: 'Premium',
      autossl: true,
      quota: 10240,  // 10GB
      bandwidth: 102400  // 100GB
    });\n`);
    
    // Example 4: Suspend and unsuspend account
    console.log('⏸️  4. Account suspension management (example)...');
    console.log('Suspend example:');
    console.log(`await client.callTool('cwp:account:suspend', {
      username: 'problemuser',
      reason: 'Payment overdue'
    });`);
    
    console.log('\nUnsuspend example:');
    console.log(`await client.callTool('cwp:account:unsuspend', {
      username: 'problemuser'
    });\n`);
    
    // Example 5: Password reset
    console.log('🔑 5. Password reset (example)...');
    console.log('Example command:');
    console.log(`await client.callTool('cwp:account:reset-password', {
      username: 'forgetfuluser',
      password: 'NewSecurePassword456!'
    });\n`);
    
    // Example 6: Get detailed account info
    console.log('🔍 6. Getting account information...');
    try {
      const infoResult = await client.callTool('cwp:account:info', {
        username: 'ealmeida'  // Replace with actual username
      });
      console.log('✅ Account info retrieved successfully\n');
    } catch (error) {
      console.log('ℹ️  Account not found or error occurred\n');
    }
    
    // Example 7: Delete account (commented out for safety)
    console.log('🗑️  7. Deleting an account (example - not executed)...');
    console.log('Example command:');
    console.log(`await client.callTool('cwp:account:delete', {
      username: 'oldclient'
    });\n`);
    
    console.log('✅ All examples completed!');
    console.log('\n💡 Tips:');
    console.log('- Always use strong passwords (min 8 chars)');
    console.log('- Enable AutoSSL for automatic HTTPS');
    console.log('- Enable backups for data protection');
    console.log('- Monitor disk quota and bandwidth usage');
    console.log('- Document suspension reasons for audit trails');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.disconnect();
    process.exit(0);
  }
}

main().catch(console.error);