import { createDecorator } from 'vscf/platform/instantiation/common';

export enum LogLevel {
  DEBUG = 'debug',
  LOG = 'log',
  ERROR = 'error',
}

export interface LogEntry {
  id: string;
  tabId: string;
  instanceId: string;
  level: LogLevel;
  message: string;
  timestamp: number;
  date: string;
  count: number;
}

export interface IWebLoggerService {
  readonly _serviceBrand: undefined;
  log(message: string): void;
  debug(message: string): void;
  error(message: string): void;
  exportAll(): Promise<LogEntry[]>;
}

export const IWebLoggerService = createDecorator<IWebLoggerService>('webLoggerService');
