import { HBServerClient, HBServerClientOptions, HBServerClientRequestLibOption } from './client';
import { Account } from './server/account';
import { Database } from './server/database';
import { Health } from './server/healts';

export class HbCloudSDK {
  static fetchToRequestLib = (fetch: any) => {
    return async (url: string, options: HBServerClientRequestLibOption) => {
      const response = await fetch(url, {
        method: options.method,
        headers: options.headers,
        body: options.body,
      });
      const status = response.status;
      const body = await response.text();
      return { status, body };
    };
  };

  private readonly client: HBServerClient;

  public get hasToken() {
    return !!this.client.getToken();
  }

  public health: Health;

  public account: Account;

  public database: Database;

  constructor(private options: HBServerClientOptions) {
    this.client = new HBServerClient(options);
    this.health = new Health(this.client);
    this.account = new Account(this.client);
    this.database = new Database(this.client);
  }

  public setToken(token: string) {
    this.client.setToken(token);
  }

  clone() {
    return new HbCloudSDK(this.options);
  }
}
