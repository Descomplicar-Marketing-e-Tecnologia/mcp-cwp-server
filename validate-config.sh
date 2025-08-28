#!/bin/bash

# Script para validar configuração Claude Desktop + MCP CWP

echo "🔍 VALIDAÇÃO CONFIGURAÇÃO CLAUDE DESKTOP + MCP CWP"
echo "================================================="

CONFIG_FILE="/home/ealmeida/.config/Claude/claude_desktop_config.json"
LIGHTWEIGHT_SERVER="/home/ealmeida/mcp-servers/mcp-cwp/server-lightweight.js"

# 1. Verificar se arquivo de configuração existe
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Arquivo de configuração não encontrado: $CONFIG_FILE"
    exit 1
fi

echo "✅ Arquivo de configuração encontrado"

# 2. Verificar se entrada CWP existe
if grep -q '"cwp":' "$CONFIG_FILE"; then
    echo "✅ Entrada 'cwp' encontrada na configuração"
else
    echo "❌ Entrada 'cwp' não encontrada na configuração"
    exit 1
fi

# 3. Verificar se servidor lightweight existe e é executável
if [ ! -f "$LIGHTWEIGHT_SERVER" ]; then
    echo "❌ Servidor lightweight não encontrado: $LIGHTWEIGHT_SERVER"
    exit 1
fi

if [ ! -x "$LIGHTWEIGHT_SERVER" ]; then
    echo "⚠️  Servidor lightweight não é executável, corrigindo..."
    chmod +x "$LIGHTWEIGHT_SERVER"
fi

echo "✅ Servidor lightweight OK"

# 4. Verificar se está usando o servidor correto
if grep -q "server-lightweight.js" "$CONFIG_FILE"; then
    echo "✅ Configuração usa servidor otimizado (lightweight)"
else
    echo "⚠️  Configuração não usa servidor otimizado"
fi

# 5. Verificar variáveis de ambiente essenciais
if grep -q "CWP_API_KEY" "$CONFIG_FILE"; then
    echo "✅ CWP_API_KEY configurada"
else
    echo "❌ CWP_API_KEY em falta"
fi

if grep -q "CWP_BASE_URL" "$CONFIG_FILE"; then
    echo "✅ CWP_BASE_URL configurada"
else
    echo "❌ CWP_BASE_URL em falta"
fi

# 6. Limpar processos CWP se existirem
ACTIVE_PROCESSES=$(ps aux | grep 'mcp-servers/mcp-cwp' | grep -v grep | wc -l)
if [ "$ACTIVE_PROCESSES" -gt 0 ]; then
    echo "⚠️  $ACTIVE_PROCESSES processo(s) CWP ativos, limpando..."
    ./kill-cwp-processes.sh
else
    echo "✅ Nenhum processo CWP ativo"
fi

echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo "1. Reiniciar Claude Desktop para carregar nova configuração"
echo "2. Teste: usar comando MCP CWP numa conversa"
echo "3. Monitor recursos: htop ou top"

echo ""
echo "📋 COMANDOS ÚTEIS:"
echo "   Verificar processos: ps aux | grep cwp"
echo "   Limpar processos: ./kill-cwp-processes.sh"  
echo "   Teste servidor: node server-lightweight.js"

echo ""
echo "✅ VALIDAÇÃO CONCLUÍDA"