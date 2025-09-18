import { LocalServerClient, LocalServerClientOptions, LocalServerClientRequestLibOption } from './client';
import { Cloud } from './services/cloud';

export class LocalServerSDK {
  static fetchToRequestLib = (fetch: typeof globalThis.fetch) => {
    return async (url: string, options: LocalServerClientRequestLibOption) => {
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

  private readonly client: LocalServerClient;

  public cloud: Cloud;

  constructor(private options: LocalServerClientOptions) {
    this.client = new LocalServerClient(options);
    this.cloud = new Cloud(this.client);
  }

  clone() {
    return new LocalServerSDK(this.options);
  }
}
