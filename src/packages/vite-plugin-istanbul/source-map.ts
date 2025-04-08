import * as espree from 'espree';
import { SourceMapGenerator, StartOfSourceMap } from 'source-map';

// Create a source map which always maps to the same line and column
export function createIdentitySourceMap(file: string, source: string, option: StartOfSourceMap) {
  const gen = new SourceMapGenerator(option);
  const tokens = espree.tokenize(source, { loc: true, ecmaVersion: 'latest' });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tokens.forEach((token: any) => {
    const loc = token.loc.start;
    gen.addMapping({
      source: file,
      original: loc,
      generated: loc,
    });
  });

  return JSON.parse(gen.toString());
}
