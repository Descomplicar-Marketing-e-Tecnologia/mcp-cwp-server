import { config } from 'dotenv';
import { CwpConfigSchema } from './types.js';
config();
export function getCwpConfig() {
    const rawConfig = {
        apiUrl: process.env.CWP_API_URL || '',
        apiKey: process.env.CWP_API_KEY || '',
        sslVerify: process.env.CWP_SSL_VERIFY === 'true',
        debug: process.env.CWP_DEBUG === 'true',
        port: parseInt(process.env.CWP_PORT || '2304', 10),
    };
    const result = CwpConfigSchema.safeParse(rawConfig);
    if (!result.success) {
        throw new Error(`Invalid CWP configuration: ${result.error.message}`);
    }
    return result.data;
}
export const cwpConfig = getCwpConfig();
//# sourceMappingURL=config.js.map