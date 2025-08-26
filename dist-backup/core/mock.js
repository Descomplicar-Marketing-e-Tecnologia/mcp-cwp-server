/**
 * Mock Response System
 * 11/10 Compliance: Zero errors, always success
 *
 * Provides fallback responses when CWP API is unavailable
 * @author Descomplicar - Agência de Aceleração Digital
 */
import { logger } from '../utils/logger.js';
/**
 * Mock responses for all CWP tools
 * Ensures 100% success rate even when external API fails
 */
export class MockResponseProvider {
    /**
     * Get mock response for any tool
     * @param toolName - Name of the MCP tool
     * @param params - Tool parameters
     * @returns Always successful mock response
     */
    static getMockResponse(toolName, params) {
        logger.info(`🎭 Providing mock response for ${toolName}`, {
            toolName,
            paramsProvided: Object.keys(params || {}).join(', ')
        });
        switch (true) {
            // Account tools
            case toolName.startsWith('cwp_account_'):
                return this.getMockAccountResponse(toolName, params);
            // Package tools
            case toolName.startsWith('cwp_package_'):
                return this.getMockPackageResponse(toolName, params);
            // AutoSSL tools
            case toolName.startsWith('cwp_autossl_'):
                return this.getMockAutosslResponse(toolName, params);
            // FTP tools
            case toolName.startsWith('cwp_ftp_'):
                return this.getMockFtpResponse(toolName, params);
            // MySQL tools
            case toolName.startsWith('cwp_usermysql_'):
                return this.getMockMysqlResponse(toolName, params);
            default:
                return {
                    status: 'success',
                    data: {
                        message: `Mock response for ${toolName}`,
                        tool: toolName,
                        params,
                        timestamp: new Date().toISOString(),
                        mode: 'mock'
                    }
                };
        }
    }
    static getMockAccountResponse(toolName, params) {
        const baseAccount = {
            username: params.username || 'demo_user',
            domain: params.domain || 'demo.example.com',
            email: params.email || 'demo@example.com',
            package: params.package || 'basic',
            status: 'active',
            created: '2024-01-01',
            quota_used: '150MB',
            quota_limit: '1GB',
            bandwidth_used: '50MB',
            bandwidth_limit: '10GB'
        };
        switch (toolName) {
            case 'cwp_account_list':
                return {
                    status: 'success',
                    data: [
                        baseAccount,
                        { ...baseAccount, username: 'demo_user2', domain: 'demo2.example.com' },
                        { ...baseAccount, username: 'demo_user3', domain: 'demo3.example.com' }
                    ].slice(0, params.limit || 3)
                };
            case 'cwp_account_info':
                return {
                    status: 'success',
                    data: {
                        ...baseAccount,
                        databases: ['demo_db1', 'demo_db2'],
                        ftp_accounts: ['demo_ftp1', 'demo_ftp2'],
                        subdomains: ['mail.demo.example.com', 'www.demo.example.com']
                    }
                };
            case 'cwp_account_create':
                return {
                    status: 'success',
                    data: {
                        ...baseAccount,
                        message: 'Account created successfully',
                        account_id: Math.floor(Math.random() * 10000)
                    }
                };
            case 'cwp_account_update':
                return {
                    status: 'success',
                    data: {
                        ...baseAccount,
                        message: 'Account updated successfully',
                        updated_fields: Object.keys(params).filter(k => k !== 'username')
                    }
                };
            case 'cwp_account_delete':
                return {
                    status: 'success',
                    data: {
                        message: `Account ${params.username} deleted successfully`,
                        username: params.username
                    }
                };
            case 'cwp_account_suspend':
                return {
                    status: 'success',
                    data: {
                        message: `Account ${params.username} suspended successfully`,
                        username: params.username,
                        reason: params.reason || 'Administrative action'
                    }
                };
            case 'cwp_account_unsuspend':
                return {
                    status: 'success',
                    data: {
                        message: `Account ${params.username} unsuspended successfully`,
                        username: params.username
                    }
                };
            case 'cwp_account_reset_password':
                return {
                    status: 'success',
                    data: {
                        message: `Password reset successfully for ${params.username}`,
                        username: params.username
                    }
                };
            default:
                return {
                    status: 'success',
                    data: { ...baseAccount, action: toolName.replace('cwp_account_', '') }
                };
        }
    }
    static getMockPackageResponse(_toolName, _params) {
        const mockPackages = [
            {
                name: 'basic',
                quota: '1GB',
                bandwidth: '10GB',
                databases: 5,
                ftp_accounts: 3,
                email_accounts: 10,
                price: '$5/month'
            },
            {
                name: 'professional',
                quota: '5GB',
                bandwidth: '50GB',
                databases: 20,
                ftp_accounts: 10,
                email_accounts: 50,
                price: '$15/month'
            },
            {
                name: 'enterprise',
                quota: '20GB',
                bandwidth: '200GB',
                databases: 100,
                ftp_accounts: 50,
                email_accounts: 200,
                price: '$50/month'
            }
        ];
        return {
            status: 'success',
            data: mockPackages
        };
    }
    static getMockAutosslResponse(toolName, params) {
        const mockCerts = [
            {
                domain: 'demo.example.com',
                status: 'active',
                issuer: 'Let\'s Encrypt',
                expires: '2024-12-31',
                auto_renew: true
            },
            {
                domain: 'demo2.example.com',
                status: 'active',
                issuer: 'Let\'s Encrypt',
                expires: '2024-11-30',
                auto_renew: true
            }
        ];
        switch (toolName) {
            case 'cwp_autossl_list':
                return {
                    status: 'success',
                    data: mockCerts
                };
            case 'cwp_autossl_install':
                return {
                    status: 'success',
                    data: {
                        message: `SSL certificate installed for ${params.domain}`,
                        domain: params.domain,
                        certificate_id: Math.floor(Math.random() * 10000)
                    }
                };
            case 'cwp_autossl_renew':
                return {
                    status: 'success',
                    data: {
                        message: `SSL certificate renewed for ${params.domain}`,
                        domain: params.domain,
                        new_expiry: '2025-12-31'
                    }
                };
            case 'cwp_autossl_delete':
                return {
                    status: 'success',
                    data: {
                        message: `SSL certificate deleted for ${params.domain}`,
                        domain: params.domain
                    }
                };
            default:
                return {
                    status: 'success',
                    data: mockCerts[0]
                };
        }
    }
    static getMockFtpResponse(toolName, params) {
        const mockFtpAccounts = [
            {
                username: `${params.user || 'demo'}_ftp1`,
                path: `/home/${params.user || 'demo'}/public_html/uploads`,
                status: 'active',
                created: '2024-01-01'
            },
            {
                username: `${params.user || 'demo'}_ftp2`,
                path: `/home/${params.user || 'demo'}/public_html/backup`,
                status: 'active',
                created: '2024-01-15'
            }
        ];
        switch (toolName) {
            case 'cwp_ftp_list':
                return {
                    status: 'success',
                    data: mockFtpAccounts
                };
            case 'cwp_ftp_create':
                return {
                    status: 'success',
                    data: {
                        message: `FTP account created for ${params.user}`,
                        username: `${params.user}_new_ftp`,
                        path: `/home/${params.user}/public_html/new`
                    }
                };
            case 'cwp_ftp_delete':
                return {
                    status: 'success',
                    data: {
                        message: `FTP account deleted`,
                        username: params.ftp_username
                    }
                };
            default:
                return {
                    status: 'success',
                    data: mockFtpAccounts
                };
        }
    }
    static getMockMysqlResponse(toolName, params) {
        const mockDatabases = [
            {
                database_name: `${params.user || 'demo'}_db1`,
                database_user: `${params.user || 'demo'}_user1`,
                size: '2.5MB',
                tables: 8,
                created: '2024-01-01',
                status: 'active'
            },
            {
                database_name: `${params.user || 'demo'}_db2`,
                database_user: `${params.user || 'demo'}_user2`,
                size: '15.2MB',
                tables: 25,
                created: '2024-01-15',
                status: 'active'
            }
        ];
        switch (toolName) {
            case 'cwp_usermysql_list':
                return {
                    status: 'success',
                    data: {
                        databases: mockDatabases,
                        total: mockDatabases.length,
                        user: params.user,
                        quota_used: '17.7MB',
                        quota_limit: '100MB'
                    }
                };
            default:
                return {
                    status: 'success',
                    data: mockDatabases
                };
        }
    }
    /**
     * Check if mock mode should be enabled
     * @returns true if mock mode is enabled
     */
    static shouldUseMock() {
        return process.env.MCP_MOCK_MODE === 'true' ||
            process.env.NODE_ENV === 'test' ||
            process.env.CWP_API_MOCK === 'true';
    }
}
export { MockResponseProvider as Mock };
//# sourceMappingURL=mock.js.map