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
        /** subscribe to an allowlisted main-process push channel; returns unsubscribe */
        on: (channel: string, callback: (data: unknown) => void) => () => void;
      };
    };
  }
}

export {};
