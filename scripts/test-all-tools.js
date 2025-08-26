#!/usr/bin/env node

/**
 * Test All Tools Script
 * MCP Guide compliant testing for all MCP tools
 * 
 * Tests each tool with sample data to ensure 100% functionality
 * @author Descomplicar - Agência de Aceleração Digital
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test data for each tool
const toolTests = [
  // Account tools
  {
    name: 'cwp_account_list',
    params: {
      limit: 10
    }
  },
  {
    name: 'cwp_account_info',
    params: {
      username: 'testuser'
    }
  },
  
  // Package tools
  {
    name: 'cwp_package_list',
    params: {}
  },
  
  // AutoSSL tools
  {
    name: 'cwp_autossl_list',
    params: {}
  },
  
  // FTP tools
  {
    name: 'cwp_ftp_list',
    params: {
      user: 'testuser'
    }
  },
  
  // MySQL tools
  {
    name: 'cwp_usermysql_list',
    params: {
      user: 'testuser'
    }
  }
];

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

let successCount = 0;
let failureCount = 0;
let warningCount = 0;

/**
 * Execute MCP tool test
 */
async function testTool(toolName, params) {
  return new Promise((resolve) => {
    console.log(`\n${colors.blue}Testing tool: ${colors.bold}${toolName}${colors.reset}`);
    console.log(`Parameters: ${JSON.stringify(params, null, 2)}`);
    
    const startTime = Date.now();
    
    // Prepare the MCP request
    const request = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: params
      },
      id: Math.random().toString(36).substring(7)
    };
    
    // Start the MCP server process
    const serverPath = join(__dirname, '..', 'dist', 'index.js');
    const child = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        LOG_LEVEL: 'error'
      }
    });
    
    let response = '';
    let error = '';
    let timeout;
    
    // Set timeout
    timeout = setTimeout(() => {
      console.log(`${colors.yellow}⚠️  Tool timed out after 30 seconds${colors.reset}`);
      warningCount++;
      child.kill();
      resolve({ success: false, reason: 'timeout' });
    }, 30000);
    
    child.stdout.on('data', (data) => {
      response += data.toString();
      
      // Try to parse response
      try {
        const lines = response.split('\n').filter(line => line.trim());
        for (const line of lines) {
          if (line.includes('"jsonrpc"')) {
            const result = JSON.parse(line);
            const duration = Date.now() - startTime;
            
            clearTimeout(timeout);
            
            if (result.error) {
              console.log(`${colors.red}❌ Failed (${duration}ms)${colors.reset}`);
              console.log(`Error: ${result.error.message}`);
              failureCount++;
              child.kill();
              resolve({ success: false, error: result.error });
              return;
            }
            
            console.log(`${colors.green}✅ Success (${duration}ms)${colors.reset}`);
            successCount++;
            child.kill();
            resolve({ success: true, result: result.result });
            return;
          }
        }
      } catch (e) {
        // Continue collecting data
      }
    });
    
    child.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    child.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0 && code !== null) {
        console.log(`${colors.red}❌ Server exited with code ${code}${colors.reset}`);
        if (error) console.log(`Error output: ${error}`);
        failureCount++;
        resolve({ success: false, code });
      }
    });
    
    // Send the request
    child.stdin.write(JSON.stringify(request) + '\n');
  });
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log(`${colors.bold}🧪 MCP Tools Test Suite${colors.reset}`);
  console.log('=' .repeat(50));
  console.log(`Testing ${toolTests.length} tools...`);
  
  const startTime = Date.now();
  
  for (const test of toolTests) {
    await testTool(test.name, test.params);
  }
  
  const totalDuration = Date.now() - startTime;
  const totalTests = successCount + failureCount + warningCount;
  
  console.log('\n' + '=' .repeat(50));
  console.log(`${colors.bold}📊 TEST SUMMARY${colors.reset}`);
  console.log('=' .repeat(50));
  console.log(`${colors.green}✅ Passed: ${successCount}/${totalTests}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failureCount}/${totalTests}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Warnings: ${warningCount}/${totalTests}${colors.reset}`);
  console.log(`⏱️  Total time: ${totalDuration}ms`);
  
  const successRate = (successCount / totalTests * 100).toFixed(1);
  console.log(`\n${colors.bold}Success Rate: ${successRate}%${colors.reset}`);
  
  if (failureCount === 0 && warningCount === 0) {
    console.log(`\n${colors.green}${colors.bold}✨ All tests passed! 100% functionality achieved!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}${colors.bold}❌ Some tests failed. Fix issues for 100% compliance.${colors.reset}`);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error(`${colors.red}Test suite error:${colors.reset}`, error);
  process.exit(1);
});