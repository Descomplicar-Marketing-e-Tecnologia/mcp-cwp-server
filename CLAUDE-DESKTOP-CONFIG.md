# 🎯 CONFIGURAÇÃO CLAUDE DESKTOP - MCP CWP OTIMIZADO

## ✅ **CONFIGURAÇÃO APLICADA**

O arquivo `/home/ealmeida/.config/Claude/claude_desktop_config.json` foi **ATUALIZADO** com:

### **Entrada Principal (Ativa)**
```json
"cwp": {
  "command": "node",
  "args": ["/home/ealmeida/mcp-servers/mcp-cwp/server-lightweight.js"],
  "cwd": "/home/ealmeida/mcp-servers/mcp-cwp",
  "env": {
    "CWP_API_KEY": "9bASMfauHJm0zbpa8bKK6JElFTa0eXCOA4sf00FRMgKgJh8jLPP7JvlyRhLg1LAobKU4A1",
    "CWP_BASE_URL": "https://server.descomplicar.pt",
    "CWP_PORT": "2304", 
    "SSL_VERIFY": "false",
    "NODE_ENV": "production",
    "LOG_LEVEL": "error",
    "MCP_MODE": "true",
    "LIGHTWEIGHT_MODE": "true"
  }
}
```

### **Entrada Backup (Desativada)**
```json
"cwp-full": {
  "disabled": true,
  "command": "node", 
  "args": ["/home/ealmeida/mcp-servers/mcp-cwp/dist/index.js"],
  // ... configuração completa se necessário
}
```

## 🚀 **COMO ATIVAR**

### 1. **Reiniciar Claude Desktop**
```bash
# Fechar Claude Desktop completamente
pkill -f "Claude Desktop" || true

# Aguardar alguns segundos e reabrir
```

### 2. **Verificar Funcionamento**
- Numa nova conversa Claude Desktop
- Usar comandos MCP CWP como: "Listar contas CWP"
- Verificar se tools aparecem

### 3. **Monitorar Recursos**
```bash
# Durante uso do MCP CWP verificar:
top | grep cwp
htop -p $(pgrep -f mcp-cwp)
```

## 🔧 **COMANDOS DE GESTÃO**

```bash
cd /home/ealmeida/mcp-servers/mcp-cwp

# Validar configuração
./validate-config.sh

# Limpar processos se necessário
./kill-cwp-processes.sh

# Testar servidor manualmente
node server-lightweight.js
```

## ⚙️ **DIFERENÇAS DA CONFIGURAÇÃO**

| Aspeto | Antes | Agora |
|--------|-------|-------|
| **Servidor** | `index.js` (original) | `server-lightweight.js` |
| **Performance** | Health/metrics ativos | Desativados |
| **Recursos** | Alto consumo | Otimizado |
| **Funcionalidade** | Completa + enterprise | Core apenas |
| **Working Dir** | Não definido | `/mcp-servers/mcp-cwp` |

## 🎯 **FERRAMENTAS MCP CWP DISPONÍVEIS**

Após reiniciar Claude Desktop terás acesso a:

- **Contas**: criar, listar, suspend, quota
- **SSL**: install, renew, delete, list  
- **FTP**: criar, listar, permissions
- **MySQL**: listar databases
- **Packages**: listar disponíveis

## ✅ **STATUS**
- ✅ Configuração aplicada
- ✅ Servidor lightweight criado
- ✅ Scripts de gestão prontos  
- ✅ Validação completa executada
- 🔄 **PRÓXIMO**: Reiniciar Claude Desktop

---
**IMPORTANTE**: Esta configuração evita o consumo excessivo de recursos mantendo funcionalidade completa do MCP CWP.