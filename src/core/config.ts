import { config } from 'dotenv';
import { CwpConfig, CwpConfigSchema } from './types.js';

// Configure dotenv to avoid stdout pollution during MCP communication
try {
  config();
} catch {
  // Ignore dotenv errors silently
}

export function getCwpConfig(): CwpConfig {
  // Build URL from BASE_URL and PORT to match Claude Desktop config
  const baseUrl = process.env.CWP_BASE_URL || process.env.CWP_API_URL || '';
  const port = parseInt(process.env.CWP_PORT || '2304', 10);
  const apiUrl = baseUrl.includes('://') ? `${baseUrl}:${port}` : `https://${baseUrl}:${port}`;
  
  const rawConfig = {
    apiUrl: apiUrl,
    apiKey: process.env.CWP_API_KEY || '',
    sslVerify: process.env.SSL_VERIFY === 'true' || process.env.CWP_SSL_VERIFY === 'true',
    debug: process.env.CWP_DEBUG === 'true',
    port: port,
  };

  const result = CwpConfigSchema.safeParse(rawConfig);
  
  if (!result.success) {
    throw new Error(`Invalid CWP configuration: ${result.error.message}`);
  }

  return result.data;
}

export const cwpConfig = getCwpConfig();