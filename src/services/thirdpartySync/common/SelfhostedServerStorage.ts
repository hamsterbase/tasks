import { IDatabaseStorage } from '@/services/database/common/database';
import { LocalServerSDK } from '@/packages/server-sdk/main';

export class SelfhostedServerStorage implements IDatabaseStorage {
  private sdk: LocalServerSDK;

  constructor(
    private serverId: string,
    entrypoint: string,
    authToken: string,
    private readonly folder: string
  ) {
    this.sdk = new LocalServerSDK({
      endpoint: entrypoint,
      authToken: authToken,
      requestLib: LocalServerSDK.fetchToRequestLib(fetch),
    });
  }

  get id(): string {
    return this.serverId;
  }

  async save(content: string): Promise<string> {
    const result = await this.sdk.cloud.save({
      folder: this.folder,
      data: content,
    });
    return result.key;
  }

  async delete(key: string): Promise<void> {
    await this.sdk.cloud.delete({ folder: this.folder, key });
  }

  async list(): Promise<string[]> {
    const res = await this.sdk.cloud.list({ folder: this.folder });
    return res.files;
  }

  async read(key: string): Promise<string> {
    const result = await this.sdk.cloud.read({ folder: this.folder, key });
    return result.data;
  }
}
