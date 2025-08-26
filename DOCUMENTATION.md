# 📋 MCP CWP Server - Documentação Completa

## 🎯 Configuração Final Funcional

### ✅ Parâmetros Corretos
- **URL Base**: `https://server.descomplicar.pt:2304`
- **Endpoint API**: `/v1/account`
- **Utilizador API**: `mcp-eal`
- **IP Autorizado**: `188.251.199.30`
- **Codificação**: `application/x-www-form-urlencoded`

## 🔧 Problemas Resolvidos

### 1. **Porto Incorreto** ❌ → ✅
```javascript
// ANTES (ERRO)
this.cwpPort = process.env.CWP_PORT || '2087'; // Porto admin panel

// DEPOIS (CORRETO)  
this.cwpPort = process.env.CWP_PORT || '2304'; // Porto API
```

### 2. **Endpoint API Incorreto** ❌ → ✅
```javascript
// ANTES (404 Error)
const url = `${this.cwpApiUrl}:${this.cwpPort}/api/`;

// DEPOIS (Funcional)
const url = `${this.cwpApiUrl}:${this.cwpPort}/v1/account`;
```

### 3. **Codificação de Dados Incorreta** ❌ → ✅ (CRÍTICO)
```javascript
// ANTES (JSON - Causava "No special characters allowed!")
const response = await axios.post(url, {
    key: this.cwpApiKey,
    action: 'list'
});

// DEPOIS (Form-encoded - Funcional)
const params = new URLSearchParams();
params.append('key', this.cwpApiKey);
params.append('action', 'list');

const response = await axios.post(url, params, { 
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
});
```

### 4. **Detecção de Erros** ❌ → ✅
```javascript
// ANTES (Falsos positivos)
return { content: [{ type: 'text', text: '✅ Conexão estabelecida' }] };

// DEPOIS (Detecção correta)
if (response.data && response.data.status === 'Error') {
    return {
        content: [{
            type: 'text',
            text: `❌ Erro CWP: ${response.data.msj}`,
        }],
    };
}
```

## 🧪 Testes de Funcionamento

### Comando de Teste
```bash
npm test
```

### Resultado Esperado
```json
{
  "status": "OK",
  "msj": [
    {
      "user": "ealmeida",
      "domain": "ealmeida.descomplicar.pt", 
      "email": "ealmeida@descomplicar.pt",
      "package": "unlimited",
      "state": "active",
      "disk_used": "2048MB",
      "bandwidth_used": "1024MB"
    }
  ]
}
```

## 🚀 Ferramentas Disponíveis

### `cwp_test_connection`
Testa a ligação à API CWP
```javascript
// Uso via MCP
{
  "name": "cwp_test_connection",
  "arguments": {}
}
```

### `cwp_account_list`
Lista todas as contas de utilizador
```javascript
// Uso via MCP
{
  "name": "cwp_account_list", 
  "arguments": {}
}
```

### `cwp_server_info`
Informações do servidor CWP
```javascript
// Uso via MCP
{
  "name": "cwp_server_info",
  "arguments": {}
}
```

## 📊 Resultado Final

✅ **MCP Server funcional** - Retorna 9 contas de hosting com dados completos:
- ealmeida, karate, sintri, meet, descomplicar, evarela, etc.
- Dados completos: utilizador, domínio, email, pacote, estado, disco, bandwidth

## 🔐 Configuração de Ambiente

```bash
# Variáveis de ambiente (opcionais)
CWP_API_URL=https://server.descomplicar.pt
CWP_API_KEY=9bASMfauHJm0zbpa8bKK6JElFTa0eXCOA4sf00FRMgKgJh8jLPP7JvlyRhLg1LAobKU4A1
CWP_PORT=2304
CWP_SSL_VERIFY=false
```

## 💡 Lições Aprendidas

1. **Form Encoding é Crítico**: CWP API rejeita JSON, requer form-encoded
2. **Porto API ≠ Porto Admin**: 2304 vs 2087
3. **Validação de Resposta**: Verificar `status: "Error"` nas respostas
4. **IP Whitelisting**: Essencial ter IP autorizado (188.251.199.30)

---
**Status**: ✅ Funcional | **Versão**: 1.0.0 | **Data**: 2025-01-26