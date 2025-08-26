#!/usr/bin/env node

/**
 * SSL Management Example for MCP CWP Server
 * 
 * This example demonstrates SSL certificate operations:
 * - Installing SSL certificates
 * - Renewing certificates
 * - Listing certificates
 * - Removing certificates
 */

import { spawn } from 'child_process';

const MCP_SERVER_PATH = '../dist/index.js';

class SSLManager {
  constructor() {
    this.server = null;
    this.requestId = 0;
  }
  
  async connect() {
    this.server = spawn('node', [MCP_SERVER_PATH], {
      stdio: ['pipe', 'pipe', 'inherit'],
      env: { ...process.env }
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  async execute(toolName, args = {}) {
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
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 15000);
      
      const handler = (data) => {
        response += data.toString();
        try {
          const lines = response.split('\n').filter(line => line.trim());
          for (const line of lines) {
            const parsed = JSON.parse(line);
            if (parsed.id === request.id) {
              clearTimeout(timeout);
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
    });
  }
  
  disconnect() {
    if (this.server) {
      this.server.kill();
    }
  }
}

async function demonstrateSSLOperations() {
  const ssl = new SSLManager();
  
  try {
    console.log('🔒 SSL Certificate Management Example\n');
    
    await ssl.connect();
    
    // Example 1: List existing SSL certificates
    console.log('📋 1. Listing SSL certificates...');
    try {
      const listResult = await ssl.execute('cwp:autossl:list', {});
      console.log('✅ SSL certificates listed successfully');
      
      // Try to list for specific user
      const userListResult = await ssl.execute('cwp:autossl:list', {
        user: 'ealmeida'
      });
      console.log('✅ User-specific certificates listed\n');
    } catch (error) {
      console.log('ℹ️  No certificates found or error occurred\n');
    }
    
    // Example 2: Install SSL certificate
    console.log('🆕 2. Installing SSL certificate (example)...');
    console.log('Example command:');
    console.log(`await ssl.execute('cwp:autossl:install', {
      domain: 'secure.example.com',
      user: 'username'
    });\n`);
    
    console.log('This will:');
    console.log('- Generate a free Let\'s Encrypt certificate');
    console.log('- Configure Apache/Nginx for HTTPS');
    console.log('- Enable automatic renewal\n');
    
    // Example 3: Renew SSL certificate
    console.log('🔄 3. Renewing SSL certificate (example)...');
    console.log('Example command:');
    console.log(`await ssl.execute('cwp:autossl:renew', {
      domain: 'secure.example.com',
      user: 'username'
    });\n`);
    
    console.log('Notes:');
    console.log('- Certificates auto-renew 30 days before expiry');
    console.log('- Manual renewal useful for troubleshooting');
    console.log('- Check domain DNS before renewal\n');
    
    // Example 4: Delete SSL certificate
    console.log('🗑️  4. Removing SSL certificate (example)...');
    console.log('Example command:');
    console.log(`await ssl.execute('cwp:autossl:delete', {
      domain: 'old.example.com'
    });\n`);
    
    console.log('Warning: This will disable HTTPS for the domain!\n');
    
    // Example 5: Bulk SSL operations
    console.log('🔧 5. Bulk SSL Operations Example\n');
    console.log('Example: Install SSL for all domains of a user:');
    console.log(`
// Get user's domains (pseudo-code)
const domains = ['site1.com', 'site2.com', 'site3.com'];

// Install SSL for each domain
for (const domain of domains) {
  try {
    await ssl.execute('cwp:autossl:install', {
      domain: domain,
      user: 'username'
    });
    console.log(\`✅ SSL installed for \${domain}\`);
  } catch (error) {
    console.log(\`❌ Failed for \${domain}: \${error.message}\`);
  }
}
`);
    
    // Best practices
    console.log('\n💡 SSL Best Practices:');
    console.log('- Always use HTTPS for production sites');
    console.log('- Enable AutoSSL when creating new accounts');
    console.log('- Monitor certificate expiration dates');
    console.log('- Test renewal process periodically');
    console.log('- Keep DNS records updated');
    console.log('- Use CAA records for additional security');
    
    // Troubleshooting
    console.log('\n🔍 Common SSL Issues:');
    console.log('- DNS not pointing to server');
    console.log('- Port 80 blocked (needed for validation)');
    console.log('- Domain not accessible');
    console.log('- Rate limits (5 certs per domain per week)');
    console.log('- Mixed content warnings');
    
    console.log('\n✅ SSL management examples completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    ssl.disconnect();
    process.exit(0);
  }
}

// Run the demonstration
demonstrateSSLOperations().catch(console.error);