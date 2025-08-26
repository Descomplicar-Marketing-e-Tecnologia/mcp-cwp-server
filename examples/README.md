# MCP CWP Server Examples

Practical examples demonstrating MCP CWP Server usage.

## Available Examples

### Basic Usage (`basic-usage.js`)
- Server connection and tool listing
- Basic API calls and response handling

### Account Management (`account-management.js`)
- Account creation, updates, and deletion
- Suspend/unsuspend operations
- Password resets

### SSL Management (`ssl-management.js`)
- SSL certificate installation and renewal
- Certificate listing and management

## Running Examples
```bash
cd examples
node account-management.js
```

### 3. SSL Management (`ssl-management.js`)
Covers SSL certificate operations:
- Installing SSL certificates
- Renewing certificates
- Listing certificates
- Removing certificates
- Bulk operations

**Run:**
```bash
cd examples
node ssl-management.js
```

## Prerequisites

Before running the examples:

1. **Build the server:**
   ```bash
   npm run build
   ```

2. **Configure environment:**
   Create a `.env` file in the project root:
   ```env
   CWP_API_URL=https://your-server.com
   CWP_API_KEY=your_api_key_here
   CWP_SSL_VERIFY=false
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

## Example Structure

Each example follows a similar pattern:

1. **Import and Setup**: Load required modules and configure the client
2. **Connection**: Establish connection to the MCP server
3. **Operations**: Demonstrate various tool calls
4. **Error Handling**: Show proper error handling
5. **Cleanup**: Properly disconnect from the server

## Creating Your Own Examples

To create custom examples:

```javascript
import { spawn } from 'child_process';

// Start the MCP server
const server = spawn('node', ['../dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit'],
  env: { ...process.env }
});

// Send a request
const request = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: 'cwp:account:list',
    arguments: {}
  }
};

server.stdin.write(JSON.stringify(request) + '\n');

// Handle response
server.stdout.on('data', (data) => {
  const response = JSON.parse(data.toString());
  console.log(response);
});
```

## Common Patterns

### Error Handling
```javascript
try {
  const result = await client.callTool('cwp:account:create', args);
  if (!result.isError) {
    console.log('Success:', result.content[0].text);
  }
} catch (error) {
  console.error('Failed:', error.message);
}
```

### Batch Operations
```javascript
const accounts = ['user1', 'user2', 'user3'];

for (const username of accounts) {
  await client.callTool('cwp:account:update', {
    username,
    autossl: true
  });
}
```

### Pagination
```javascript
let offset = 0;
const limit = 10;
let hasMore = true;

while (hasMore) {
  const result = await client.callTool('cwp:account:list', {
    limit,
    offset
  });
  
  // Process results
  offset += limit;
  hasMore = result.data.length === limit;
}
```

## Tips

1. **Testing**: Use a test CWP server to avoid affecting production
2. **Rate Limiting**: Add delays between bulk operations
3. **Logging**: Enable debug mode for troubleshooting
4. **Validation**: Always validate inputs before sending
5. **Security**: Never hardcode credentials in examples

## Need Help?

- Check the [API Documentation](../API.md)
- Review the [main README](../README.md)
- Open an issue on GitHub

---

Happy coding! 🚀