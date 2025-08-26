#!/usr/bin/env node
/**
 * Fix MCP CWP Tool Names
 * 
 * Este script corrige os nomes das ferramentas CWP para seguir o padrão regex
 * exigido pelo Claude Desktop: ^[a-zA-Z0-9_-]{1,64}$
 * 
 * Substitui "cwp:categoria:acao" por "cwp_categoria_acao"
 */

import fs from 'fs';
import path from 'path';

const srcDir = './src';

// Mapeamento de nomes antigos para novos
const toolNameMapping = {
  // Account tools
  'cwp:account:create': 'cwp_account_create',
  'cwp:account:update': 'cwp_account_update', 
  'cwp:account:delete': 'cwp_account_delete',
  'cwp:account:suspend': 'cwp_account_suspend',
  'cwp:account:unsuspend': 'cwp_account_unsuspend',
  'cwp:account:reset-password': 'cwp_account_reset_password',
  'cwp:account:info': 'cwp_account_info',
  'cwp:account:list': 'cwp_account_list',
  
  // AutoSSL tools
  'cwp:autossl:install': 'cwp_autossl_install',
  'cwp:autossl:renew': 'cwp_autossl_renew',
  'cwp:autossl:list': 'cwp_autossl_list',
  'cwp:autossl:delete': 'cwp_autossl_delete',
  
  // Package tools
  'cwp:package:list': 'cwp_package_list',
  
  // FTP tools
  'cwp:ftp:list': 'cwp_ftp_list',
  'cwp:ftp:create': 'cwp_ftp_create',
  'cwp:ftp:delete': 'cwp_ftp_delete',
  
  // MySQL tools
  'cwp:usermysql:list': 'cwp_usermysql_list'
};

function replaceInFile(filePath, replacements) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    for (const [oldName, newName] of Object.entries(replacements)) {
      // Substituir nomes de ferramentas em strings
      const nameRegex = new RegExp(`'${oldName.replace(/:/g, '\\:')}'`, 'g');
      if (content.match(nameRegex)) {
        content = content.replace(nameRegex, `'${newName}'`);
        changed = true;
      }
      
      // Substituir também em startsWith() calls
      const startsWithRegex = new RegExp(`startsWith\\('${oldName.replace(/:/g, '\\:')}`, 'g');
      if (content.match(startsWithRegex)) {
        content = content.replace(startsWithRegex, `startsWith('${newName.split('_').slice(0, 2).join('_')}_'`);
        changed = true;
      }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir, callback) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDirectory(filePath, callback);
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      callback(filePath);
    }
  }
}

console.log('🔧 Fixing CWP tool names...');
console.log('📋 Tool name mappings:');
Object.entries(toolNameMapping).forEach(([old, new_]) => {
  console.log(`  ${old} → ${new_}`);
});

let updatedFiles = 0;

walkDirectory(srcDir, (filePath) => {
  if (replaceInFile(filePath, toolNameMapping)) {
    updatedFiles++;
  }
});

console.log(`\n✨ Fixed ${updatedFiles} files`);
console.log('🔨 Now run: npm run build');
console.log('🚀 Then restart Claude Desktop');
