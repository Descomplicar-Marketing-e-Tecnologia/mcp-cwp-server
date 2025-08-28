#!/usr/bin/env node

/**
 * Script para comparar ferramentas entre servidor original e lightweight
 */

console.log('🔍 COMPARAÇÃO DE FERRAMENTAS - MCP CWP');
console.log('=====================================');

async function getOriginalTools() {
  try {
    const { setupAccountTools } = await import('./dist/tools/account/index.js');
    const { setupAutosslTools } = await import('./dist/tools/autossl/index.js'); 
    const { setupPackageTools } = await import('./dist/tools/package/index.js');
    const { setupFtpTools } = await import('./dist/tools/ftp/index.js');
    const { setupUserMysqlTools } = await import('./dist/tools/usermysql/index.js');
    
    return [
      ...setupAccountTools(),
      ...setupAutosslTools(), 
      ...setupPackageTools(),
      ...setupFtpTools(),
      ...setupUserMysqlTools(),
    ];
  } catch (error) {
    console.error('❌ Erro ao carregar ferramentas originais:', error.message);
    return [];
  }
}

function getLightweightTools() {
  // Lista hardcoded baseada no server-lightweight.js
  return [
    'cwp_account_create',
    'cwp_account_update', 
    'cwp_account_delete',
    'cwp_account_suspend',
    'cwp_account_unsuspend',
    'cwp_account_reset_password',
    'cwp_account_info',
    'cwp_account_list',
    'cwp_account_quota_check',
    'cwp_account_metadata',
    'cwp_autossl_install',
    'cwp_autossl_renew',
    'cwp_autossl_list',
    'cwp_autossl_delete',
    'cwp_package_list',
    'cwp_ftp_list',
    'cwp_ftp_create',
    'cwp_ftp_delete',
    'cwp_ftp_update_permissions',
    'cwp_usermysql_list'
  ];
}

async function compare() {
  console.log('📋 Carregando ferramentas...\n');
  
  const originalTools = await getOriginalTools();
  const lightweightTools = getLightweightTools();
  
  console.log('🔧 SERVIDOR ORIGINAL:');
  originalTools.forEach((tool, i) => {
    console.log(`  ${i+1}. ${tool.name}`);
  });
  
  console.log(`\n  TOTAL: ${originalTools.length} ferramentas`);
  
  console.log('\n🚀 SERVIDOR LIGHTWEIGHT:');
  lightweightTools.forEach((tool, i) => {
    console.log(`  ${i+1}. ${tool}`);
  });
  
  console.log(`\n  TOTAL: ${lightweightTools.length} ferramentas`);
  
  // Verificar se todas estão incluídas
  const originalNames = originalTools.map(t => t.name);
  const missing = originalNames.filter(name => !lightweightTools.includes(name));
  const extra = lightweightTools.filter(name => !originalNames.includes(name));
  
  console.log('\n📊 ANÁLISE:');
  if (missing.length === 0 && extra.length === 0) {
    console.log('  ✅ PERFEITO! Todas as ferramentas incluídas');
  } else {
    if (missing.length > 0) {
      console.log('  ❌ FALTAM:');
      missing.forEach(name => console.log(`     - ${name}`));
    }
    if (extra.length > 0) {
      console.log('  ⚠️  EXTRAS:');
      extra.forEach(name => console.log(`     + ${name}`));
    }
  }
  
  console.log('\n🎯 RESULTADO:');
  console.log(`  Original: ${originalNames.length} | Lightweight: ${lightweightTools.length}`);
  console.log(`  Cobertura: ${Math.round((lightweightTools.length / originalNames.length) * 100)}%`);
}

compare().catch(console.error);