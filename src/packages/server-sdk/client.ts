import { HttpError } from './error';

export interface LocalServerClientRequestLibOption {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

export interface LocalServerClientRequestLibResponse {
  status: number;
  body: string;
}

export interface LocalServerClientRequestLib {
  (url: string, options: LocalServerClientRequestLibOption): Promise<LocalServerClientRequestLibResponse>;
}

export interface LocalServerClientOptions {
  endpoint: string;
  requestLib: LocalServerClientRequestLib;
  authToken: string;
}

export type LocalServerErrorResponse = {
  error: string;
};

export type LocalServerResponse<T> = T | LocalServerErrorResponse;

export class LocalServerClient {
  constructor(private options: LocalServerClientOptions) {
    if (!options.endpoint) {
      throw new Error('endpoint is required');
    }
    if (!options.authToken) {
      throw new Error('authToken is required');
    }
  }

  post<T>(api: string, data?: unknown) {
    return this.request<T>('POST', api, data);
  }

  get<T>(api: string) {
    return this.request<T>('GET', api);
  }

  private async request<T>(method: string, api: string, data?: unknown): Promise<T> {
    const requestLib = this.options.requestLib;
    const response = await requestLib(`${this.options.endpoint}/api/${api}`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        authorization: this.options.authToken,
      },
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });

    if (response.status !== 200) {
      const message = response.body;
      try {
        const parsedError = JSON.parse(message) as LocalServerErrorResponse;
        throw new HttpError(response.status, parsedError.error);
      } catch (error) {
        if (error instanceof HttpError) {
          throw error;
        }
        throw new HttpError(response.status, message);
      }
    }

    const json = JSON.parse(response.body);
    return json;
  }
}
