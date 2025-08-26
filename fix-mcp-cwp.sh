#!/bin/bash

# Script para rebuild do MCP CWP Server
set -e

echo "🔧 Iniciando correção do MCP CWP Server..."

cd /media/ealmeida/Dados/Cloud/Dev/mcp-servers/mcp-cwp

echo "📦 Instalando dependências..."
npm install

echo "🏗️  Fazendo build..."
npm run build

echo "✅ MCP CWP Server corrigido com sucesso!"
echo "📍 Os handlers para resources/list e prompts/list foram adicionados"
echo "🔄 Agora podes reiniciar o Claude Desktop para testar"
