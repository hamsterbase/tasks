/** Replaced at build time with the `cliVersion` of the published package. */
declare const __CLI_VERSION__: string | undefined;

/**
 * Version of this CLI. The bundled package reports its published version; a
 * source checkout has nothing to report and says `dev`.
 */
export const CLI_VERSION = typeof __CLI_VERSION__ === 'string' ? __CLI_VERSION__ : 'dev';
