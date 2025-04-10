// @ts-nocheck
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ThemeIcon, IconIdentifier } from 'vs/base/common/themables';
import { Emitter, Event } from 'vs/base/common/event';
import { IJSONSchema, IJSONSchemaMap } from 'vs/base/common/jsonSchema';
import { isString } from 'vs/base/common/types';
import { URI } from 'vs/base/common/uri';
import { localize } from 'vs/nls';

//  ------ API types


// icon registry
export const Extensions = {
	IconContribution: 'base.contributions.icons'
};

export type IconDefaults = ThemeIcon | IconDefinition;

export interface IconDefinition {
	font?: IconFontContribution; // undefined for the default font (codicon)
	fontCharacter: string;
}


export interface IconContribution {
	readonly id: string;
	description: string | undefined;
	deprecationMessage?: string;
	readonly defaults: IconDefaults;
}

export namespace IconContribution {
	export function getDefinition(contribution: IconContribution, registry: IIconRegistry): IconDefinition | undefined {
		let definition = contribution.defaults;
		while (ThemeIcon.isThemeIcon(definition)) {
			const c = iconRegistry.getIcon(definition.id);
			if (!c) {
				return undefined;
			}
			definition = c.defaults;
		}
		return definition;
	}
}

export interface IconFontContribution {
	readonly id: string;
	readonly definition: IconFontDefinition;
}

export interface IconFontDefinition {
	readonly weight?: string;
	readonly style?: string;
	readonly src: IconFontSource[];
}

export namespace IconFontDefinition {
	export function toJSONObject(iconFont: IconFontDefinition): any {
		return {
			weight: iconFont.weight,
			style: iconFont.style,
			src: iconFont.src.map(s => ({ format: s.format, location: s.location.toString() }))
		};
	}
	export function fromJSONObject(json: any): IconFontDefinition | undefined {
		const stringOrUndef = (s: any) => isString(s) ? s : undefined;
		if (json && Array.isArray(json.src) && json.src.every((s: any) => isString(s.format) && isString(s.location))) {
			return {
				weight: stringOrUndef(json.weight),
				style: stringOrUndef(json.style),
				src: json.src.map((s: any) => ({ format: s.format, location: URI.parse(s.location) }))
			};
		}
		return undefined;
	}
}


export interface IconFontSource {
	readonly location: URI;
	readonly format: string;
}

export interface IIconRegistry {

	readonly onDidChange: Event<void>;

	/**
	 * Register a icon to the registry.
	 * @param id The icon id
	 * @param defaults The default values
	 * @param description The description
	 */
	registerIcon(id: IconIdentifier, defaults: IconDefaults, description?: string): ThemeIcon;

	/**
	 * Deregister a icon from the registry.
	 */
	deregisterIcon(id: IconIdentifier): void;

	/**
	 * Get all icon contributions
	 */
	getIcons(): IconContribution[];

	/**
	 * Get the icon for the given id
	 */
	getIcon(id: IconIdentifier): IconContribution | undefined;

	/**
	 * JSON schema for an object to assign icon values to one of the icon contributions.
	 */
	getIconSchema(): IJSONSchema;

	/**
	 * JSON schema to for a reference to a icon contribution.
	 */
	getIconReferenceSchema(): IJSONSchema;

	/**
	 * Register a icon font to the registry.
	 * @param id The icon font id
	 * @param definition The icon font definition
	 */
	registerIconFont(id: string, definition: IconFontDefinition): IconFontDefinition;

	/**
	 * Deregister an icon font to the registry.
	 */
	deregisterIconFont(id: string): void;

	/**
	 * Get the icon font for the given id
	 */
	getIconFont(id: string): IconFontDefinition | undefined;
}

class IconRegistry implements IIconRegistry {

	private readonly _onDidChange = new Emitter<void>();
	readonly onDidChange: Event<void> = this._onDidChange.event;

	private iconsById: { [key: string]: IconContribution };
	private iconSchema: IJSONSchema & { properties: IJSONSchemaMap } = {
		definitions: {
			icons: {
				type: 'object',
				properties: {
					fontId: { type: 'string', description: localize('iconDefinition.fontId', 'The id of the font to use. If not set, the font that is defined first is used.') },
					fontCharacter: { type: 'string', description: localize('iconDefinition.fontCharacter', 'The font character associated with the icon definition.') }
				},
				additionalProperties: false,
				defaultSnippets: [{ body: { fontCharacter: '\\\\e030' } }]
			}
		},
		type: 'object',
		properties: {}
	};
	private iconReferenceSchema: IJSONSchema & { enum: string[]; enumDescriptions: string[] } = { type: 'string', pattern: `^${ThemeIcon.iconNameExpression}$`, enum: [], enumDescriptions: [] };

	private iconFontsById: { [key: string]: IconFontDefinition };

	constructor() {
		this.iconsById = {};
		this.iconFontsById = {};
	}

	public registerIcon(id: string, defaults: IconDefaults, description?: string, deprecationMessage?: string): ThemeIcon {
		const existing = this.iconsById[id];
		if (existing) {
			if (description && !existing.description) {
				existing.description = description;
				this.iconSchema.properties[id].markdownDescription = `${description} $(${id})`;
				const enumIndex = this.iconReferenceSchema.enum.indexOf(id);
				if (enumIndex !== -1) {
					this.iconReferenceSchema.enumDescriptions[enumIndex] = description;
				}
				this._onDidChange.fire();
			}
			return existing;
		}
		const iconContribution: IconContribution = { id, description, defaults, deprecationMessage };
		this.iconsById[id] = iconContribution;
		const propertySchema: IJSONSchema = { $ref: '#/definitions/icons' };
		if (deprecationMessage) {
			propertySchema.deprecationMessage = deprecationMessage;
		}
		if (description) {
			propertySchema.markdownDescription = `${description}: $(${id})`;
		}
		this.iconSchema.properties[id] = propertySchema;
		this.iconReferenceSchema.enum.push(id);
		this.iconReferenceSchema.enumDescriptions.push(description || '');

		this._onDidChange.fire();
		return { id };
	}


	public deregisterIcon(id: string): void {
		delete this.iconsById[id];
		delete this.iconSchema.properties[id];
		const index = this.iconReferenceSchema.enum.indexOf(id);
		if (index !== -1) {
			this.iconReferenceSchema.enum.splice(index, 1);
			this.iconReferenceSchema.enumDescriptions.splice(index, 1);
		}
		this._onDidChange.fire();
	}

	public getIcons(): IconContribution[] {
		return Object.keys(this.iconsById).map(id => this.iconsById[id]);
	}

	public getIcon(id: string): IconContribution | undefined {
		return this.iconsById[id];
	}

	public getIconSchema(): IJSONSchema {
		return this.iconSchema;
	}

	public getIconReferenceSchema(): IJSONSchema {
		return this.iconReferenceSchema;
	}

	public registerIconFont(id: string, definition: IconFontDefinition): IconFontDefinition {
		const existing = this.iconFontsById[id];
		if (existing) {
			return existing;
		}
		this.iconFontsById[id] = definition;
		this._onDidChange.fire();
		return definition;
	}

	public deregisterIconFont(id: string): void {
		delete this.iconFontsById[id];
	}

	public getIconFont(id: string): IconFontDefinition | undefined {
		return this.iconFontsById[id];
	}

	public toString() {
		const sorter = (i1: IconContribution, i2: IconContribution) => {
			return i1.id.localeCompare(i2.id);
		};
		const classNames = (i: IconContribution) => {
			while (ThemeIcon.isThemeIcon(i.defaults)) {
				i = this.iconsById[i.defaults.id];
			}
			return `codicon codicon-${i ? i.id : ''}`;
		};

		const reference = [];

		reference.push(`| preview     | identifier                        | default codicon ID                | description`);
		reference.push(`| ----------- | --------------------------------- | --------------------------------- | --------------------------------- |`);
		const contributions = Object.keys(this.iconsById).map(key => this.iconsById[key]);

		for (const i of contributions.filter(i => !!i.description).sort(sorter)) {
			reference.push(`|<i class="${classNames(i)}"></i>|${i.id}|${ThemeIcon.isThemeIcon(i.defaults) ? i.defaults.id : i.id}|${i.description || ''}|`);
		}

		reference.push(`| preview     | identifier                        `);
		reference.push(`| ----------- | --------------------------------- |`);

		for (const i of contributions.filter(i => !ThemeIcon.isThemeIcon(i.defaults)).sort(sorter)) {
			reference.push(`|<i class="${classNames(i)}"></i>|${i.id}|`);

		}

		return reference.join('\n');
	}

}

const iconRegistry = new IconRegistry();

export function registerIcon(id: string, defaults: IconDefaults, description: string, deprecationMessage?: string): ThemeIcon {
	return iconRegistry.registerIcon(id, defaults, description, deprecationMessage);
}

export function getIconRegistry(): IIconRegistry {
	return iconRegistry;
}

