import { HttpError } from './error';

export interface HBServerClientRequestLibOption {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

export interface HBServerClientRequestLibResponse {
  status: number;
  body: string;
}

export interface HBServerClientRequestLib {
  (url: string, options: HBServerClientRequestLibOption): Promise<HBServerClientRequestLibResponse>;
}

export interface HBServerClientOptions {
  endpoint: string;
  requestLib: HBServerClientRequestLib;
}

export type HBServerErrorResponse = {
  success: false;
  error: { code: string | number; message: string; details: any };
};

export type HBServerResponse<T> = { success: true; data: T } | HBServerErrorResponse;

export class HBServerClient {
  private currentToken: string | null = '';

  constructor(private options: HBServerClientOptions) {
    if (!options.endpoint) {
      throw new Error('endpoint is required');
    }
  }

  post<T>(api: string, data?: unknown) {
    return this.request<T>('POST', api, data);
  }

  patch<T>(api: string, data: unknown) {
    return this.request<T>('PATCH', api, data);
  }

  put<T>(api: string, data: unknown) {
    return this.request<T>('PUT', api, data);
  }

  delete<T>(api: string) {
    return this.request<T>('DELETE', api);
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
        authorization: this.currentToken ?? '',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    if (response.status !== 200) {
      const message = response.body;
      try {
        const parsedError = JSON.parse(message) as HBServerErrorResponse;
        throw new HttpError(
          response.status,
          parsedError.error.message,
          parsedError.error.code,
          parsedError.error.details
        );
      } catch (error) {
        if (error instanceof HttpError) {
          throw error;
        }
        throw new HttpError(response.status, message);
      }
    }
    const json = JSON.parse(response.body);
    return json.data;
  }

  getToken(): string | null {
    return this.currentToken;
  }

  setToken(token: string) {
    this.currentToken = token;
  }
}
