# 🚀 Setup Guia - MCP CWP Server

## 📋 Pré-requisitos
- Node.js >= 18.0.0
- npm ou yarn
- Servidor CWP com API ativada
- Claude Desktop instalado

## 🔧 Instalação

### 1. Clone o Projeto
```bash
git clone https://github.com/descomplicar/mcp-cwp-server.git
cd mcp-cwp-server
npm install
```

### 2. Configuração de Ambiente
```bash
cp .env.example .env
```

Edite `.env` com suas credenciais:
```bash
CWP_API_URL=https://seu-servidor-cwp.com
CWP_API_KEY=sua_api_key_aqui
CWP_SSL_VERIFY=false
CWP_DEBUG=false
CWP_PORT=2304
LOG_LEVEL=warn
```

### 3. Build e Teste
```bash
npm run build
npm start

# Teste das ferramentas:
node test-mcp.js
```

## 🔗 Configuração Claude Desktop

**Arquivo:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "cwp": {
      "command": "node",
      "args": ["/caminho/para/mcp-cwp-server/dist/index.js"],
      "cwd": "/caminho/para/mcp-cwp-server",
      "env": {
        "CWP_API_URL": "https://seu-servidor.com",
        "CWP_API_KEY": "sua_api_key",
        "CWP_SSL_VERIFY": "false",
        "LOG_LEVEL": "warn"
      }
    }
  }
}
```

## ✅ Verificação

1. **Teste MCP:** `node test-mcp.js`
2. **Reinicie Claude Desktop**
3. **Teste comando:** `cwp:account:list`

## 🛠️ Troubleshooting

### Erro de Conexão
- Verifique `CWP_API_URL` e porta
- Confirme API key válida
- Teste SSL_VERIFY=false

### Logs Excessivos
- Defina `LOG_LEVEL=warn` ou `error`
- Desative `CWP_DEBUG=false`

### Ferramentas Não Aparecem
- Verifique se servidor buildou: `npm run build`
- Confirme configuração Claude Desktop
- Restart Claude completamente

## 📊 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Linting
npm run lint

# Testes
node test-mcp.js
node test-real-tools.js

# Logs
tail -f logs/cwp-server.log
```

## 🔒 Segurança

- ⚠️ Nunca commite `.env`
- 🔑 Use API keys com permissões mínimas
- 🛡️ Configure SSL_VERIFY=true em produção
- 📝 Monitore logs regularmente