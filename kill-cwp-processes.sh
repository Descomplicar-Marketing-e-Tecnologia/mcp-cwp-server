#!/bin/bash

# Script para matar todos os processos CWP em execução
echo "🔍 Procurando processos MCP CWP..."

# Encontrar todos os processos CWP
PIDS=$(ps aux | grep 'mcp-servers/mcp-cwp' | grep -v grep | awk '{print $2}')

if [ -z "$PIDS" ]; then
    echo "✅ Nenhum processo MCP CWP encontrado"
    exit 0
fi

echo "📋 Processos encontrados:"
ps aux | grep 'mcp-servers/mcp-cwp' | grep -v grep

echo ""
echo "🛑 Terminando processos CWP..."

for PID in $PIDS; do
    echo "   - Terminando processo $PID"
    kill -TERM $PID 2>/dev/null
done

# Esperar 5 segundos
sleep 5

# Verificar se ainda existem processos
REMAINING=$(ps aux | grep 'mcp-servers/mcp-cwp' | grep -v grep | awk '{print $2}')

if [ ! -z "$REMAINING" ]; then
    echo "⚠️  Processos ainda ativos, forçando terminação..."
    for PID in $REMAINING; do
        echo "   - Force kill processo $PID"
        kill -9 $PID 2>/dev/null
    done
fi

echo "✅ Limpeza concluída"

# Mostrar status final
echo ""
echo "📊 Estado atual:"
ps aux | grep 'mcp-servers/mcp-cwp' | grep -v grep || echo "   Nenhum processo CWP ativo"