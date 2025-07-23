/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'istanbul-lib-instrument' {
  interface ExistingRawSourceMap {
    file?: string;
    mappings: string;
    names: string[];
    sourceRoot?: string;
    sources: string[];
    sourcesContent?: string[];
    version: number;
    x_google_ignoreList?: number[];
  }

  import { GeneratorOptions } from 'babel__generator';

  interface Instrumenter {
    instrumentSync(code: string, filename: string, inputSourceMap?: ExistingRawSourceMap): string;
    lastSourceMap(): ExistingRawSourceMap;
  }

  export function createInstrumenter(opts: {
    coverageVariable?: string;
    reportLogic?: boolean;
    preserveComments?: boolean;
    compact?: boolean;
    esModules?: boolean;
    autoWrap?: boolean;
    produceSourceMap?: boolean;
    ignoreClassMethods?: string[];
    sourceMapUrlCallback?(filename: string, sourceMapUrl: string): void;
    debug?: boolean;
    parserPlugins?: any[];
    coverageGlobalScope?: string;
    coverageGlobalScopeFunc?: boolean;
    generatorOpts?: GeneratorOptions;
  }): Instrumenter;
}

declare module 'espree' {
  // https://github.com/eslint/espree#options
  export interface Options {
    comment?: boolean;
    ecmaFeatures?: {
      globalReturn?: boolean;
      impliedStrict?: boolean;
      jsx?: boolean;
    };
    ecmaVersion?:
      | 3
      | 5
      | 6
      | 7
      | 8
      | 9
      | 10
      | 11
      | 12
      | 2015
      | 2016
      | 2017
      | 2018
      | 2019
      | 2020
      | 2021
      | 2022
      | 2023
      | 'latest';
    loc?: boolean;
    range?: boolean;
    sourceType?: 'script' | 'module';
    tokens?: boolean;
  }
  // https://github.com/eslint/espree#tokenize
  export function tokenize(code: string, options?: Options): any;
}

interface ElectronAPI {
  isFullscreen(): Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
