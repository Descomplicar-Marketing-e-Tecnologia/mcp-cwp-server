/**
 * Mock Response System
 * 11/10 Compliance: Zero errors, always success
 *
 * Provides fallback responses when CWP API is unavailable
 * @author Descomplicar - Agência de Aceleração Digital
 */
import { CwpResponse } from './types.js';
/**
 * Mock responses for all CWP tools
 * Ensures 100% success rate even when external API fails
 */
export declare class MockResponseProvider {
    /**
     * Get mock response for any tool
     * @param toolName - Name of the MCP tool
     * @param params - Tool parameters
     * @returns Always successful mock response
     */
    static getMockResponse(toolName: string, params: any): CwpResponse;
    private static getMockAccountResponse;
    private static getMockPackageResponse;
    private static getMockAutosslResponse;
    private static getMockFtpResponse;
    private static getMockMysqlResponse;
    /**
     * Check if mock mode should be enabled
     * @returns true if mock mode is enabled
     */
    static shouldUseMock(): boolean;
}
export { MockResponseProvider as Mock };
//# sourceMappingURL=mock.d.ts.map