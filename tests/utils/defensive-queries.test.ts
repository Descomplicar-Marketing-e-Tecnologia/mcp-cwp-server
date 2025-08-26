import {
  safeExtract,
  processApiResponse,
  safeArrayProcess,
  mapCwpAccount,
  mapCwpSSL,
  safePagination,
  extractWithFallbacks
} from '../../src/utils/defensive-queries';

describe('Defensive Queries Utilities', () => {
  describe('safeExtract', () => {
    it('should extract nested properties safely', () => {
      const data = {
        user: {
          profile: {
            name: 'John Doe',
            age: 30
          }
        }
      };

      expect(safeExtract(data, 'user.profile.name', 'Unknown')).toBe('John Doe');
      expect(safeExtract(data, 'user.profile.age', 0)).toBe(30);
      expect(safeExtract(data, 'user.profile.missing', 'default')).toBe('default');
      expect(safeExtract(data, 'missing.path', 'fallback')).toBe('fallback');
    });

    it('should handle null/undefined data', () => {
      expect(safeExtract(null, 'any.path', 'default')).toBe('default');
      expect(safeExtract(undefined, 'any.path', 'default')).toBe('default');
      expect(safeExtract({}, 'missing.path', 'default')).toBe('default');
    });

    it('should handle primitive values', () => {
      expect(safeExtract('string', 'property', 'default')).toBe('default');
      expect(safeExtract(123, 'property', 'default')).toBe('default');
    });
  });

  describe('processApiResponse', () => {
    it('should process valid API response', () => {
      const response = {
        status: 'success',
        message: 'Operation completed',
        data: [{ id: 1 }, { id: 2 }],
        count: 2
      };

      const processed = processApiResponse(response);

      expect(processed.status).toBe('success');
      expect(processed.message).toBe('Operation completed');
      expect(processed.data).toEqual([{ id: 1 }, { id: 2 }]);
      expect(processed.count).toBe(2);
      expect(processed.errors).toEqual([]);
    });

    it('should handle response with errors', () => {
      const response = {
        status: 'error',
        error: 'Something went wrong',
        errors: ['Error 1', 'Error 2']
      };

      const processed = processApiResponse(response);

      expect(processed.status).toBe('error');
      expect(processed.errors).toEqual(['Error 1', 'Error 2']);
    });

    it('should handle malformed responses', () => {
      const processed1 = processApiResponse(null);
      expect(processed1.status).toBe('unknown');
      expect(processed1.message).toBe('No message provided');
      expect(processed1.data).toEqual([]);

      const processed2 = processApiResponse('invalid');
      expect(processed2.status).toBe('unknown');

      const processed3 = processApiResponse({ data: 'single_item' });
      expect(processed3.data).toEqual(['single_item']);
    });
  });

  describe('safeArrayProcess', () => {
    it('should process arrays safely', () => {
      const items = [1, 2, 3, 4, 5];
      const processor = (x: number) => x * 2;

      const result = safeArrayProcess(items, processor, []);

      expect(result).toEqual([2, 4, 6, 8, 10]);
    });

    it('should handle non-array input', () => {
      const result = safeArrayProcess('not-array', (x: any) => x, ['default']);
      expect(result).toEqual(['default']);
    });

    it('should filter out null items', () => {
      const items = [1, null, 2, undefined, 3];
      const processor = (x: number) => x * 2;

      const result = safeArrayProcess(items, processor, []);

      expect(result).toEqual([2, 4, 6]);
    });

    it('should handle processing errors gracefully', () => {
      const items = [1, 2, 3];
      const faultyProcessor = (x: number) => {
        if (x === 2) throw new Error('Processing error');
        return x * 2;
      };

      const result = safeArrayProcess(items, faultyProcessor, []);

      expect(result).toEqual([2, 6]); // Item 2 is filtered out due to error
    });

    it('should return default on complete failure', () => {
      const result = safeArrayProcess(null, () => { throw new Error(); }, ['fallback']);
      expect(result).toEqual(['fallback']);
    });
  });

  describe('mapCwpAccount', () => {
    it('should map complete account data', () => {
      const rawAccount = {
        username: 'testuser',
        domain: 'example.com',
        email: 'test@example.com',
        package: 'premium',
        status: 'active',
        created: '2023-01-01T00:00:00Z',
        suspended: false,
        quota_used: 1024,
        quota_limit: 2048,
        bandwidth_used: 512,
        bandwidth_limit: 1024
      };

      const mapped = mapCwpAccount(rawAccount);

      expect(mapped.username).toBe('testuser');
      expect(mapped.domain).toBe('example.com');
      expect(mapped.email).toBe('test@example.com');
      expect(mapped.package).toBe('premium');
      expect(mapped.status).toBe('active');
      expect(mapped.suspended).toBe(false);
    });

    it('should handle missing fields with fallbacks', () => {
      const rawAccount = {
        username: 'testuser'
        // All other fields missing
      };

      const mapped = mapCwpAccount(rawAccount);

      expect(mapped.username).toBe('testuser');
      expect(mapped.domain).toBe('unknown');
      expect(mapped.email).toBe('noemail@unknown.com');
      expect(mapped.package).toBe('default');
      expect(mapped.status).toBe('unknown');
      expect(mapped.suspended).toBe(false);
      expect(mapped.quota_used).toBe(0);
      expect(mapped.quota_limit).toBe(0);
    });

    it('should handle alternative field names', () => {
      const rawAccount = {
        username: 'testuser',
        main_domain: 'alt-domain.com',
        contact_email: 'alt@example.com',
        plan: 'basic',
        state: 'suspended',
        date_created: '2023-06-01T00:00:00Z',
        is_suspended: true,
        disk_used: 500,
        disk_limit: 1000,
        bw_used: 200,
        bw_limit: 500
      };

      const mapped = mapCwpAccount(rawAccount);

      expect(mapped.domain).toBe('alt-domain.com');
      expect(mapped.email).toBe('alt@example.com');
      expect(mapped.package).toBe('basic');
      expect(mapped.status).toBe('suspended');
      expect(mapped.created).toBe('2023-06-01T00:00:00Z');
      expect(mapped.suspended).toBe(true);
      expect(mapped.quota_used).toBe(500);
      expect(mapped.quota_limit).toBe(1000);
    });

    it('should handle null/undefined input', () => {
      const mapped1 = mapCwpAccount(null);
      const mapped2 = mapCwpAccount(undefined);

      expect(mapped1.username).toBe('unknown');
      expect(mapped2.username).toBe('unknown');
    });
  });

  describe('mapCwpSSL', () => {
    it('should map SSL certificate data', () => {
      const rawSSL = {
        domain: 'secure.example.com',
        status: 'active',
        issuer: 'Let\'s Encrypt',
        expires: '2024-01-01T00:00:00Z',
        auto_renew: true,
        type: 'domain_validated'
      };

      const mapped = mapCwpSSL(rawSSL);

      expect(mapped.domain).toBe('secure.example.com');
      expect(mapped.status).toBe('active');
      expect(mapped.issuer).toBe('Let\'s Encrypt');
      expect(mapped.expires).toBe('2024-01-01T00:00:00Z');
      expect(mapped.auto_renew).toBe(true);
      expect(mapped.certificate_type).toBe('domain_validated');
    });

    it('should handle missing fields with fallbacks', () => {
      const rawSSL = {}; // Empty object

      const mapped = mapCwpSSL(rawSSL);

      expect(mapped.domain).toBe('unknown');
      expect(mapped.status).toBe('unknown');
      expect(mapped.issuer).toBe('Unknown CA');
      expect(mapped.auto_renew).toBe(false);
      expect(mapped.certificate_type).toBe('unknown');
    });

    it('should handle alternative field names', () => {
      const rawSSL = {
        hostname: 'alt.example.com',
        state: 'pending',
        ca: 'DigiCert',
        expiry_date: '2024-06-01T00:00:00Z',
        autorenew: false,
        cert_type: 'wildcard'
      };

      const mapped = mapCwpSSL(rawSSL);

      expect(mapped.domain).toBe('alt.example.com');
      expect(mapped.status).toBe('pending');
      expect(mapped.issuer).toBe('DigiCert');
      expect(mapped.expires).toBe('2024-06-01T00:00:00Z');
      expect(mapped.auto_renew).toBe(false);
      expect(mapped.certificate_type).toBe('wildcard');
    });
  });

  describe('safePagination', () => {
    it('should handle valid pagination parameters', () => {
      const result = safePagination({
        page: 2,
        limit: 25
      });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(25);
      expect(result.offset).toBe(25); // (page - 1) * limit
    });

    it('should handle explicit offset', () => {
      const result = safePagination({
        page: 2,
        limit: 25,
        offset: 100
      });

      expect(result.offset).toBe(100); // Explicit offset takes precedence
    });

    it('should enforce limits and defaults', () => {
      const result1 = safePagination({
        page: 0,
        limit: 0
      });

      expect(result1.page).toBe(1); // Min page is 1
      expect(result1.limit).toBe(1); // When limit is 0, it uses min 1

      const result2 = safePagination({
        page: -5,
        limit: 2000
      });

      expect(result2.page).toBe(1); // Min page is 1
      expect(result2.limit).toBe(1000); // Max limit is 1000

      const result3 = safePagination({});
      expect(result3.page).toBe(1); // Default page
      expect(result3.limit).toBe(50); // Default limit
      expect(result3.offset).toBe(0); // Default offset
    });

    it('should handle string parameters', () => {
      const result = safePagination({
        page: '3',
        limit: '20'
      });

      expect(result.page).toBe(3);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(40);
    });

    it('should handle invalid parameters', () => {
      const result = safePagination({
        page: 'invalid',
        limit: null,
        offset: 'bad'
      });

      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });
  });

  describe('extractWithFallbacks', () => {
    it('should try multiple paths until success', () => {
      const data = {
        primary: null,
        secondary: undefined,
        tertiary: 'success'
      };

      const result = extractWithFallbacks(
        data,
        ['primary.value', 'secondary.value', 'tertiary'],
        'default'
      );

      expect(result).toBe('success');
    });

    it('should return default when all paths fail', () => {
      const data = {
        existing: 'value'
      };

      const result = extractWithFallbacks(
        data,
        ['missing1', 'missing2', 'missing3'],
        'fallback'
      );

      expect(result).toBe('fallback');
    });

    it('should handle empty fallback paths', () => {
      const result = extractWithFallbacks(
        { test: 'value' },
        [],
        'default'
      );

      expect(result).toBe('default');
    });

    it('should handle exceptions in path extraction', () => {
      const result = extractWithFallbacks(
        null,
        ['any.path'],
        'safe_default'
      );

      expect(result).toBe('safe_default');
    });
  });
});