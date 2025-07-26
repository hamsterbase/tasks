export interface IServiceCallRequest {
  serviceName: string;
  method: string;
  args: unknown[];
}

export interface IServiceCallError {
  message: string;
  stack?: string;
}

declare global {
  interface Window {
    readonly electronAPI?: {
      isFullscreen: () => Promise<boolean>;
      serviceChannel: {
        call: (request: IServiceCallRequest) => Promise<unknown>;
      };
    };
  }
}

export {};
