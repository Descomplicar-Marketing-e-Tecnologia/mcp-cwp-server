import { CwpClient } from '../../core/client.js';
import { CwpResponse } from '../../core/types.js';
import { PackageListArgs } from './types.js';

export class PackageService {
  constructor(private client: CwpClient) {}

  async listPackages(args: PackageListArgs = {}): Promise<CwpResponse> {
    return await this.client.post('/packages', {
      action: 'list',
    });
  }
}