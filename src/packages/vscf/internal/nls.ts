// @ts-nocheck
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/





export interface ILocalizeInfo {
	key: string;
	comment: string[];
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



	return result;
}



/**
 * Localize a message.
 *
 * `message` can contain `{n}` notation where it is replaced by the nth value in `...args`
 * For example, `localize({ key: 'sayHello', comment: ['Welcomes user'] }, 'hello {0}', name)`
 */
export function localize(info: ILocalizeInfo, message: string, ...args: (string | number | boolean | undefined | null)[]): string;

/**
 * Localize a message.
 *
 * `message` can contain `{n}` notation where it is replaced by the nth value in `...args`
 * For example, `localize('sayHello', 'hello {0}', name)`
 */
export function localize(key: string, message: string, ...args: (string | number | boolean | undefined | null)[]): string;

export function localize(data: ILocalizeInfo | string, message: string, ...args: (string | number | boolean | undefined | null)[]): string {
	return _format(message, args);
}

/**
 *
 * @param stringFromLocalizeCall You must pass in a string that was returned from a `nls.localize()` call
 * in order to ensure the loader plugin has been initialized before this function is called.
 */
export function getConfiguredDefaultLocale(stringFromLocalizeCall: string): string | undefined;
export function getConfiguredDefaultLocale(_: string): string | undefined {
	// This returns undefined because this implementation isn't used and is overwritten by the loader
	// when loaded.
	return undefined;
}
