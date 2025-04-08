const isPseudo =
  typeof document !== 'undefined' && document.location && document.location.hash.indexOf('pseudo=true') >= 0;

/**
 * Localize a message.
 *
 * `message` can contain `{n}` notation where it is replaced by the nth value in `...args`
 * For example, `localize('sayHello', 'hello {0}', name)`
 */
export function localize(
  key: string,
  message: string,
  ...args: (string | number | boolean | undefined | null)[]
): string;
export function localize(
  data: string,
  message: string,
  ...args: (string | number | boolean | undefined | null)[]
): string {
  const messages = globalThis.i18nMessages || {};
  if (!messages[data]) {
    return _format(message, args);
  }
  if (typeof messages[data] === 'string') {
    return _format(messages[data] || message, args);
  }
  return _format(messages[data].content || message, args);
}

function _format(message: string, args: (string | number | boolean | undefined | null)[]): string {
  let result: string;

  if (args.length === 0) {
    result = message;
  } else {
    result = message.replace(/\{(\d+)\}/g, (match, rest) => {
      const index = rest[0];
      const arg = args[index];
      let result = match;
      if (typeof arg === 'string') {
        result = arg;
      } else if (typeof arg === 'number' || typeof arg === 'boolean' || arg === void 0 || arg === null) {
        result = String(arg);
      }
      return result;
    });
  }

  if (isPseudo) {
    // FF3B and FF3D is the Unicode zenkaku representation for [ and ]
    result = '\uFF3B' + result.replace(/[aouei]/g, '$&$&') + '\uFF3D';
  }

  return result;
}
