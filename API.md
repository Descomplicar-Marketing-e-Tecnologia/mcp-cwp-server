# MCP CWP Server API Documentation

## Overview

The MCP CWP Server provides a Model Context Protocol interface for managing CentOS Web Panel (CWP) resources. This document details all available tools and their parameters.

## Base Configuration

### Environment Variables

```env
# Required
CWP_API_URL=https://your-server.com
CWP_API_KEY=your_api_key_here

# Optional
CWP_SSL_VERIFY=false    # Default: true
CWP_DEBUG=false         # Default: false
CWP_PORT=2304          # Default: 2304
LOG_LEVEL=warn         # Default: info
```

## Available Tools

### Account Management

#### cwp:account:create
Create a new hosting account.

**Parameters:**
- `domain` (string, required): Primary domain for the account
- `username` (string, required): Account username
- `password` (string, required): Account password (min 8 characters)
- `email` (string, required): Account email address
- `package` (string, required): Hosting package name
- `server_ips` (string, optional): Server IP addresses
- `inode` (number, optional): Inode limit
- `limit_nproc` (number, optional): Process limit
- `limit_nofile` (number, optional): Open files limit
- `autossl` (boolean, optional): Enable AutoSSL (default: false)
- `backup` (boolean, optional): Enable backups (default: true)

**Example:**
```json
{
  "name": "cwp:account:create",
  "arguments": {
    "domain": "example.com",
    "username": "user123",
    "password": "securePass123",
    "email": "user@example.com",
    "package": "Premium"
  }
}
```

#### cwp:account:update
Update an existing account.

**Parameters:**
- `username` (string, required): Account username
- `package` (string, optional): New package name
- `email` (string, optional): New email address
- `quota` (number, optional): Disk quota in MB
- `bandwidth` (number, optional): Bandwidth limit in MB
- `autossl` (boolean, optional): AutoSSL status
- `backup` (boolean, optional): Backup status

**Example:**
```json
{
  "name": "cwp:account:update",
  "arguments": {
    "username": "user123",
    "package": "Enterprise",
    "autossl": true
  }
}
```

#### cwp:account:delete
Delete an account.

**Parameters:**
- `username` (string, required): Account username

**Example:**
```json
{
  "name": "cwp:account:delete",
  "arguments": {
    "username": "user123"
  }
}
```

#### cwp:account:suspend
Suspend an account.

**Parameters:**
- `username` (string, required): Account username
- `reason` (string, optional): Suspension reason

**Example:**
```json
{
  "name": "cwp:account:suspend",
  "arguments": {
    "username": "user123",
    "reason": "Payment overdue"
  }
}
```

#### cwp:account:unsuspend
Unsuspend an account.

**Parameters:**
- `username` (string, required): Account username

**Example:**
```json
{
  "name": "cwp:account:unsuspend",
  "arguments": {
    "username": "user123"
  }
}
```

#### cwp:account:reset-password
Reset account password.

**Parameters:**
- `username` (string, required): Account username
- `password` (string, required): New password (min 8 characters)

**Example:**
```json
{
  "name": "cwp:account:reset-password",
  "arguments": {
    "username": "user123",
    "password": "newSecurePass456"
  }
}
```

#### cwp:account:info
Get account information.

**Parameters:**
- `username` (string, required): Account username

**Example:**
```json
{
  "name": "cwp:account:info",
  "arguments": {
    "username": "user123"
  }
}
```

#### cwp:account:list
List all accounts.

**Parameters:**
- `limit` (number, optional): Number of results to return
- `offset` (number, optional): Offset for pagination
- `search` (string, optional): Search term

**Example:**
```json
{
  "name": "cwp:account:list",
  "arguments": {
    "limit": 10,
    "offset": 0
  }
}
```

### AutoSSL Management

#### cwp:autossl:install
Install SSL certificate for a domain.

**Parameters:**
- `domain` (string, required): Domain name
- `user` (string, required): Account username

**Example:**
```json
{
  "name": "cwp:autossl:install",
  "arguments": {
    "domain": "example.com",
    "user": "user123"
  }
}
```

#### cwp:autossl:renew
Renew SSL certificate.

**Parameters:**
- `domain` (string, required): Domain name
- `user` (string, required): Account username

**Example:**
```json
{
  "name": "cwp:autossl:renew",
  "arguments": {
    "domain": "example.com",
    "user": "user123"
  }
}
```

#### cwp:autossl:list
List SSL certificates.

**Parameters:**
- `user` (string, optional): Filter by username

**Example:**
```json
{
  "name": "cwp:autossl:list",
  "arguments": {
    "user": "user123"
  }
}
```

#### cwp:autossl:delete
Delete SSL certificate.

**Parameters:**
- `domain` (string, required): Domain name

**Example:**
```json
{
  "name": "cwp:autossl:delete",
  "arguments": {
    "domain": "example.com"
  }
}
```

### Package Management

#### cwp:package:list
List available hosting packages.

**Parameters:** None

**Example:**
```json
{
  "name": "cwp:package:list",
  "arguments": {}
}
```

### FTP Management

#### cwp:ftp:list
List FTP accounts.

**Parameters:**
- `user` (string, required): Account username

**Example:**
```json
{
  "name": "cwp:ftp:list",
  "arguments": {
    "user": "user123"
  }
}
```

#### cwp:ftp:create
Create FTP account.

**Parameters:**
- `user` (string, required): Account username
- `ftpuser` (string, required): FTP username
- `password` (string, required): FTP password
- `path` (string, optional): FTP directory path

**Example:**
```json
{
  "name": "cwp:ftp:create",
  "arguments": {
    "user": "user123",
    "ftpuser": "ftp_user123",
    "password": "ftpPass789",
    "path": "/public_html"
  }
}
```

#### cwp:ftp:delete
Delete FTP account.

**Parameters:**
- `user` (string, required): Account username
- `ftpuser` (string, required): FTP username

**Example:**
```json
{
  "name": "cwp:ftp:delete",
  "arguments": {
    "user": "user123",
    "ftpuser": "ftp_user123"
  }
}
```

### MySQL Management

#### cwp:usermysql:list
List MySQL databases for a user.

**Parameters:**
- `user` (string, required): Account username

**Example:**
```json
{
  "name": "cwp:usermysql:list",
  "arguments": {
    "user": "user123"
  }
}
```

## Response Format

All tools return responses in the following format:

### Success Response
```json
{
  "content": [{
    "type": "text",
    "text": "Operation completed successfully. Details: ..."
  }],
  "isError": false
}
```

### Error Response
```json
{
  "content": [{
    "type": "text",
    "text": "Error: Description of the error"
  }],
  "isError": true
}
```

## Error Handling

Common error codes and their meanings:

- `AUTH_ERROR`: Authentication failed (check API key)
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `PERMISSION_DENIED`: Insufficient permissions
- `SERVER_ERROR`: CWP server error
- `NETWORK_ERROR`: Connection to CWP failed

## Rate Limiting

The CWP API may impose rate limits. If you encounter rate limiting:
- Implement exponential backoff
- Cache responses when appropriate
- Batch operations where possible

## Best Practices

1. **Authentication**: Store API keys securely in environment variables
2. **Error Handling**: Always check `isError` in responses
3. **Validation**: The server validates all inputs, but client-side validation improves UX
4. **Logging**: Monitor logs for API errors and performance issues
5. **SSL**: Use `CWP_SSL_VERIFY=true` in production environments

## Examples

### Creating a Complete Hosting Account
```javascript
// 1. Create the account
const createResult = await callTool('cwp:account:create', {
  domain: 'newsite.com',
  username: 'newuser',
  password: 'SecurePass123!',
  email: 'admin@newsite.com',
  package: 'Business',
  autossl: true
});

// 2. Install SSL certificate
if (!createResult.isError) {
  await callTool('cwp:autossl:install', {
    domain: 'newsite.com',
    user: 'newuser'
  });
}

// 3. Create FTP account
await callTool('cwp:ftp:create', {
  user: 'newuser',
  ftpuser: 'ftp_newuser',
  password: 'FtpPass456!',
  path: '/public_html'
});
```

### Batch Account Management
```javascript
// List all accounts
const accounts = await callTool('cwp:account:list', {});

// Update multiple accounts
for (const account of accounts.data) {
  if (account.package === 'Basic') {
    await callTool('cwp:account:update', {
      username: account.username,
      package: 'Premium',
      autossl: true
    });
  }
}
```

## Support

For issues or questions:
- GitHub Issues: https://github.com/descomplicar/mcp-cwp-server/issues
- Email: it@descomplicar.pt
- Documentation: https://github.com/descomplicar/mcp-cwp-server

## Version History

- v1.0.0 - Initial release with 17 tools
- v1.0.1 - Documentation and code quality improvements

---

*Last updated: January 2025*