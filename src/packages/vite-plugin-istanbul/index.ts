import { createInstrumenter } from 'istanbul-lib-instrument';
import { minimatch } from 'minimatch';

export interface ExistingRawSourceMap {
  file?: string;
  mappings: string;
  names: string[];
  sourceRoot?: string;
  sources: string[];
  sourcesContent?: string[];
  version: number;
  x_google_ignoreList?: number[];
}

import { Plugin, TransformResult } from 'vite';

import { createIdentitySourceMap } from './source-map';

const PLUGIN_NAME = 'vite:istanbul';
const MODULE_PREFIX = '/@modules/';
const NULL_STRING = '\0';

function sanitizeSourceMap(rawSourceMap: ExistingRawSourceMap): ExistingRawSourceMap {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sourcesContent: _ignore, ...sourceMap } = rawSourceMap;
  return JSON.parse(JSON.stringify(sourceMap));
}

interface IstanbulPluginOptions {
  exclude: string[];
  include: string[];
  enabled: boolean;
}

export default function istanbulPlugin(pluginOptions: IstanbulPluginOptions): Plugin {
  const instrumenter = createInstrumenter({
    coverageGlobalScopeFunc: false,
    coverageGlobalScope: 'globalThis',
    preserveComments: true,
    produceSourceMap: true,
    autoWrap: true,
    esModules: true,
    compact: false,
  });

  const enabled = pluginOptions.enabled;

  return {
    name: PLUGIN_NAME,
    apply(_, env) {
      return env.command === 'build';
    },
    enforce: 'post',
    transform(srcCode, id) {
      const filename = id;
      if (!enabled || filename.startsWith(MODULE_PREFIX) || filename.startsWith(NULL_STRING)) {
        return;
      }
      if (pluginOptions.exclude.some((pattern) => minimatch(filename, pattern, { dot: true }))) {
        return;
      }
      if (pluginOptions.include.some((pattern) => minimatch(filename, pattern, { dot: true }))) {
        const combinedSourceMap = sanitizeSourceMap(this.getCombinedSourcemap());
        const code = instrumenter.instrumentSync(srcCode, filename, combinedSourceMap);
        const identitySourceMap = sanitizeSourceMap(
          createIdentitySourceMap(filename, srcCode, {
            file: combinedSourceMap.file,
            sourceRoot: combinedSourceMap.sourceRoot,
          })
        );
        instrumenter.instrumentSync(srcCode, filename, identitySourceMap);
        const map = instrumenter.lastSourceMap();
        return { code, map } as TransformResult;
      }
    },
  };
}
