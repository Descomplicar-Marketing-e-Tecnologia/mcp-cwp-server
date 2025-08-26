import { CwpClient } from '../../core/client.js';
import { CwpResponse } from '../../core/types.js';
import {
  AutosslListArgs,
  AutosslInstallArgs,
  AutosslRenewArgs,
  AutosslDeleteArgs,
} from './types.js';

export class AutosslService {
  constructor(private client: CwpClient) {}

  async listSslCertificates(args: AutosslListArgs = {}): Promise<CwpResponse> {
    return await this.client.post('/autossl', {
      action: 'list',
    });
  }

  async installSslCertificate(args: AutosslInstallArgs): Promise<CwpResponse> {
    return await this.client.post('/autossl', {
      action: 'add',
      user: args.user,
      domain: args.domain,
    });
  }

  async deleteSslCertificate(args: AutosslDeleteArgs): Promise<CwpResponse> {
    return await this.client.post('/autossl', {
      action: 'del',
      domain: args.domain,
    });
  }

  async renewSslCertificate(args: AutosslRenewArgs): Promise<CwpResponse> {
    return await this.client.post('/autossl', {
      action: 'renew',
      domain: args.domain,
    });
  }
}