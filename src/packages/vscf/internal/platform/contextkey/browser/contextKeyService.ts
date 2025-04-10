// @ts-nocheck
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event, PauseableEmitter } from 'vs/base/common/event';
import { Iterable } from 'vs/base/common/iterator';
import { DisposableStore, MutableDisposable } from 'vs/base/common/lifecycle';
import { MarshalledObject } from 'vs/base/common/marshalling';
import { MarshalledId } from 'vs/base/common/marshallingIds';
import { cloneAndChange, distinct } from 'vs/base/common/objects';
import { URI } from 'vs/base/common/uri';
import { localize } from 'vs/nls';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { ContextKeyExpression, ContextKeyInfo, ContextKeyValue, IContext, IContextKey, IContextKeyChangeEvent, IContextKeyService, IContextKeyServiceTarget, IReadableSet, IScopedContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';

const KEYBINDING_CONTEXT_ATTR = 'data-keybinding-context';

export class Context implements IContext {

	protected _parent: Context | null;
	protected _value: Record<string, any>;
	protected _id: number;

	constructor(id: number, parent: Context | null) {
		this._id = id;
		this._parent = parent;
		this._value = Object.create(null);
		this._value['_contextId'] = id;
	}

	public get value(): Record<string, any> {
		return { ...this._value };
	}

	public setValue(key: string, value: any): boolean {
		// console.log('SET ' + key + ' = ' + value + ' ON ' + this._id);
		if (this._value[key] !== value) {
			this._value[key] = value;
			return true;
		}
		return false;
	}

	public removeValue(key: string): boolean {
		// console.log('REMOVE ' + key + ' FROM ' + this._id);
		if (key in this._value) {
			delete this._value[key];
			return true;
		}
		return false;
	}

	public getValue<T>(key: string): T | undefined {
		const ret = this._value[key];
		if (typeof ret === 'undefined' && this._parent) {
			return this._parent.getValue<T>(key);
		}
		return ret;
	}

	public updateParent(parent: Context): void {
		this._parent = parent;
	}

	public collectAllValues(): Record<string, any> {
		let result = this._parent ? this._parent.collectAllValues() : Object.create(null);
		result = { ...result, ...this._value };
		delete result['_contextId'];
		return result;
	}
}

class NullContext extends Context {

	static readonly INSTANCE = new NullContext();

	constructor() {
		super(-1, null);
	}

	public override setValue(key: string, value: any): boolean {
		return false;
	}

	public override removeValue(key: string): boolean {
		return false;
	}

	public override getValue<T>(key: string): T | undefined {
		return undefined;
	}

	override collectAllValues(): { [key: string]: any } {
		return Object.create(null);
	}
}

class ContextKey<T extends ContextKeyValue> implements IContextKey<T> {

	private _service: AbstractContextKeyService;
	private _key: string;
	private _defaultValue: T | undefined;

	constructor(service: AbstractContextKeyService, key: string, defaultValue: T | undefined) {
		this._service = service;
		this._key = key;
		this._defaultValue = defaultValue;
		this.reset();
	}

	public set(value: T): void {
		this._service.setContext(this._key, value);
	}

	public reset(): void {
		if (typeof this._defaultValue === 'undefined') {
			this._service.removeContext(this._key);
		} else {
			this._service.setContext(this._key, this._defaultValue);
		}
	}

	public get(): T | undefined {
		return this._service.getContextKeyValue<T>(this._key);
	}
}

class SimpleContextKeyChangeEvent implements IContextKeyChangeEvent {
	constructor(readonly key: string) { }
	affectsSome(keys: IReadableSet<string>): boolean {
		return keys.has(this.key);
	}
	allKeysContainedIn(keys: IReadableSet<string>): boolean {
		return this.affectsSome(keys);
	}
}

class ArrayContextKeyChangeEvent implements IContextKeyChangeEvent {
	constructor(readonly keys: string[]) { }
	affectsSome(keys: IReadableSet<string>): boolean {
		for (const key of this.keys) {
			if (keys.has(key)) {
				return true;
			}
		}
		return false;
	}
	allKeysContainedIn(keys: IReadableSet<string>): boolean {
		return this.keys.every(key => keys.has(key));
	}
}

class CompositeContextKeyChangeEvent implements IContextKeyChangeEvent {
	constructor(readonly events: IContextKeyChangeEvent[]) { }
	affectsSome(keys: IReadableSet<string>): boolean {
		for (const e of this.events) {
			if (e.affectsSome(keys)) {
				return true;
			}
		}
		return false;
	}
	allKeysContainedIn(keys: IReadableSet<string>): boolean {
		return this.events.every(evt => evt.allKeysContainedIn(keys));
	}
}

function allEventKeysInContext(event: IContextKeyChangeEvent, context: Record<string, any>): boolean {
	return event.allKeysContainedIn(new Set(Object.keys(context)));
}

export abstract class AbstractContextKeyService implements IContextKeyService {
	declare _serviceBrand: undefined;

	protected _isDisposed: boolean;
	protected _myContextId: number;

	protected _onDidChangeContext = new PauseableEmitter<IContextKeyChangeEvent>({ merge: input => new CompositeContextKeyChangeEvent(input) });
	readonly onDidChangeContext = this._onDidChangeContext.event;

	constructor(myContextId: number) {
		this._isDisposed = false;
		this._myContextId = myContextId;
	}

	public get contextId(): number {
		return this._myContextId;
	}

	public createKey<T extends ContextKeyValue>(key: string, defaultValue: T | undefined): IContextKey<T> {
		if (this._isDisposed) {
			throw new Error(`AbstractContextKeyService has been disposed`);
		}
		return new ContextKey(this, key, defaultValue);
	}


	bufferChangeEvents(callback: Function): void {
		this._onDidChangeContext.pause();
		try {
			callback();
		} finally {
			this._onDidChangeContext.resume();
		}
	}

	public createScoped(domNode: IContextKeyServiceTarget): IScopedContextKeyService {
		if (this._isDisposed) {
			throw new Error(`AbstractContextKeyService has been disposed`);
		}
		return new ScopedContextKeyService(this, domNode);
	}

	createOverlay(overlay: Iterable<[string, any]> = Iterable.empty()): IContextKeyService {
		if (this._isDisposed) {
			throw new Error(`AbstractContextKeyService has been disposed`);
		}
		return new OverlayContextKeyService(this, overlay);
	}

	public contextMatchesRules(rules: ContextKeyExpression | undefined): boolean {
		if (this._isDisposed) {
			throw new Error(`AbstractContextKeyService has been disposed`);
		}
		const context = this.getContextValuesContainer(this._myContextId);
		const result = (rules ? rules.evaluate(context) : true);
		// console.group(rules.serialize() + ' -> ' + result);
		// rules.keys().forEach(key => { console.log(key, ctx[key]); });
		// console.groupEnd();
		return result;
	}

	public getContextKeyValue<T>(key: string): T | undefined {
		if (this._isDisposed) {
			return undefined;
		}
		return this.getContextValuesContainer(this._myContextId).getValue<T>(key);
	}

	public setContext(key: string, value: any): void {
		if (this._isDisposed) {
			return;
		}
		const myContext = this.getContextValuesContainer(this._myContextId);
		if (!myContext) {
			return;
		}
		if (myContext.setValue(key, value)) {
			this._onDidChangeContext.fire(new SimpleContextKeyChangeEvent(key));
		}
	}

	public removeContext(key: string): void {
		if (this._isDisposed) {
			return;
		}
		if (this.getContextValuesContainer(this._myContextId).removeValue(key)) {
			this._onDidChangeContext.fire(new SimpleContextKeyChangeEvent(key));
		}
	}

	public getContext(target: IContextKeyServiceTarget | null): IContext {
		if (this._isDisposed) {
			return NullContext.INSTANCE;
		}
		return this.getContextValuesContainer(findContextAttr(target));
	}

	public abstract getContextValuesContainer(contextId: number): Context;
	public abstract createChildContext(parentContextId?: number): number;
	public abstract disposeContext(contextId: number): void;
	public abstract updateParent(parentContextKeyService?: IContextKeyService): void;
}

export class ContextKeyService extends AbstractContextKeyService implements IContextKeyService {

	private _lastContextId: number;
	private readonly _contexts = new Map<number, Context>();

	private readonly _toDispose = new DisposableStore();

	constructor() {
		super(0);
		this._lastContextId = 0;


		const myContext = new Context(this._myContextId, null);
		this._contexts.set(this._myContextId, myContext);

		// Uncomment this to see the contexts continuously logged
		// let lastLoggedValue: string | null = null;
		// setInterval(() => {
		// 	let values = Object.keys(this._contexts).map((key) => this._contexts[key]);
		// 	let logValue = values.map(v => JSON.stringify(v._value, null, '\t')).join('\n');
		// 	if (lastLoggedValue !== logValue) {
		// 		lastLoggedValue = logValue;
		// 		console.log(lastLoggedValue);
		// 	}
		// }, 2000);
	}

	public dispose(): void {
		this._onDidChangeContext.dispose();
		this._isDisposed = true;
		this._toDispose.dispose();
	}

	public getContextValuesContainer(contextId: number): Context {
		if (this._isDisposed) {
			return NullContext.INSTANCE;
		}
		return this._contexts.get(contextId) || NullContext.INSTANCE;
	}

	public createChildContext(parentContextId: number = this._myContextId): number {
		if (this._isDisposed) {
			throw new Error(`ContextKeyService has been disposed`);
		}
		const id = (++this._lastContextId);
		this._contexts.set(id, new Context(id, this.getContextValuesContainer(parentContextId)));
		return id;
	}

	public disposeContext(contextId: number): void {
		if (!this._isDisposed) {
			this._contexts.delete(contextId);
		}
	}

	public updateParent(_parentContextKeyService: IContextKeyService): void {
		throw new Error('Cannot update parent of root ContextKeyService');
	}
}

class ScopedContextKeyService extends AbstractContextKeyService {

	private _parent: AbstractContextKeyService;
	private _domNode: IContextKeyServiceTarget;

	private readonly _parentChangeListener = new MutableDisposable();

	constructor(parent: AbstractContextKeyService, domNode: IContextKeyServiceTarget) {
		super(parent.createChildContext());
		this._parent = parent;
		this._updateParentChangeListener();

		this._domNode = domNode;
		if (this._domNode.hasAttribute(KEYBINDING_CONTEXT_ATTR)) {
			let extraInfo = '';
			if ((this._domNode as HTMLElement).classList) {
				extraInfo = Array.from((this._domNode as HTMLElement).classList.values()).join(', ');
			}

			console.error(`Element already has context attribute${extraInfo ? ': ' + extraInfo : ''}`);
		}
		this._domNode.setAttribute(KEYBINDING_CONTEXT_ATTR, String(this._myContextId));
	}

	private _updateParentChangeListener(): void {
		// Forward parent events to this listener. Parent will change.
		this._parentChangeListener.value = this._parent.onDidChangeContext(e => {
			const thisContainer = this._parent.getContextValuesContainer(this._myContextId);
			const thisContextValues = thisContainer.value;

			if (!allEventKeysInContext(e, thisContextValues)) {
				this._onDidChangeContext.fire(e);
			}
		});
	}

	public dispose(): void {
		if (this._isDisposed) {
			return;
		}

		this._onDidChangeContext.dispose();
		this._parent.disposeContext(this._myContextId);
		this._parentChangeListener.dispose();
		this._domNode.removeAttribute(KEYBINDING_CONTEXT_ATTR);
		this._isDisposed = true;
	}

	public getContextValuesContainer(contextId: number): Context {
		if (this._isDisposed) {
			return NullContext.INSTANCE;
		}
		return this._parent.getContextValuesContainer(contextId);
	}

	public createChildContext(parentContextId: number = this._myContextId): number {
		if (this._isDisposed) {
			throw new Error(`ScopedContextKeyService has been disposed`);
		}
		return this._parent.createChildContext(parentContextId);
	}

	public disposeContext(contextId: number): void {
		if (this._isDisposed) {
			return;
		}
		this._parent.disposeContext(contextId);
	}

	public updateParent(parentContextKeyService: AbstractContextKeyService): void {
		if (this._parent === parentContextKeyService) {
			return;
		}

		const thisContainer = this._parent.getContextValuesContainer(this._myContextId);
		const oldAllValues = thisContainer.collectAllValues();
		this._parent = parentContextKeyService;
		this._updateParentChangeListener();
		const newParentContainer = this._parent.getContextValuesContainer(this._parent.contextId);
		thisContainer.updateParent(newParentContainer);

		const newAllValues = thisContainer.collectAllValues();
		const allValuesDiff = {
			...distinct(oldAllValues, newAllValues),
			...distinct(newAllValues, oldAllValues)
		};
		const changedKeys = Object.keys(allValuesDiff);

		this._onDidChangeContext.fire(new ArrayContextKeyChangeEvent(changedKeys));
	}
}

class OverlayContext implements IContext {

	constructor(private parent: IContext, private overlay: ReadonlyMap<string, any>) { }

	getValue<T>(key: string): T | undefined {
		return this.overlay.has(key) ? this.overlay.get(key) : this.parent.getValue(key);
	}
}

class OverlayContextKeyService implements IContextKeyService {

	declare _serviceBrand: undefined;
	private overlay: Map<string, any>;

	get contextId(): number {
		return this.parent.contextId;
	}

	get onDidChangeContext(): Event<IContextKeyChangeEvent> {
		return this.parent.onDidChangeContext;
	}

	constructor(private parent: AbstractContextKeyService | OverlayContextKeyService, overlay: Iterable<[string, any]>) {
		this.overlay = new Map(overlay);
	}

	bufferChangeEvents(callback: Function): void {
		this.parent.bufferChangeEvents(callback);
	}

	createKey<T extends ContextKeyValue>(): IContextKey<T> {
		throw new Error('Not supported.');
	}

	getContext(target: IContextKeyServiceTarget | null): IContext {
		return new OverlayContext(this.parent.getContext(target), this.overlay);
	}

	getContextValuesContainer(contextId: number): IContext {
		const parentContext = this.parent.getContextValuesContainer(contextId);
		return new OverlayContext(parentContext, this.overlay);
	}

	contextMatchesRules(rules: ContextKeyExpression | undefined): boolean {
		const context = this.getContextValuesContainer(this.contextId);
		const result = (rules ? rules.evaluate(context) : true);
		return result;
	}

	getContextKeyValue<T>(key: string): T | undefined {
		return this.overlay.has(key) ? this.overlay.get(key) : this.parent.getContextKeyValue(key);
	}

	createScoped(): IScopedContextKeyService {
		throw new Error('Not supported.');
	}

	createOverlay(overlay: Iterable<[string, any]> = Iterable.empty()): IContextKeyService {
		return new OverlayContextKeyService(this, overlay);
	}

	updateParent(): void {
		throw new Error('Not supported.');
	}
}

function findContextAttr(domNode: IContextKeyServiceTarget | null): number {
	while (domNode) {
		if (domNode.hasAttribute(KEYBINDING_CONTEXT_ATTR)) {
			const attr = domNode.getAttribute(KEYBINDING_CONTEXT_ATTR);
			if (attr) {
				return parseInt(attr, 10);
			}
			return NaN;
		}
		domNode = domNode.parentElement;
	}
	return 0;
}

export function setContext(accessor: ServicesAccessor, contextKey: any, contextValue: any) {
	const contextKeyService = accessor.get(IContextKeyService);
	contextKeyService.createKey(String(contextKey), stringifyURIs(contextValue));
}

function stringifyURIs(contextValue: any): any {
	return cloneAndChange(contextValue, (obj) => {
		if (typeof obj === 'object' && (<MarshalledObject>obj).$mid === MarshalledId.Uri) {
			return URI.revive(obj).toString();
		}
		if (obj instanceof URI) {
			return obj.toString();
		}
		return undefined;
	});
}

CommandsRegistry.registerCommand('_setContext', setContext);

CommandsRegistry.registerCommand({
	id: 'getContextKeyInfo',
	handler() {
		return [...RawContextKey.all()].sort((a, b) => a.key.localeCompare(b.key));
	},
	description: {
		description: localize('getContextKeyInfo', "A command that returns information about context keys"),
		args: []
	}
});

CommandsRegistry.registerCommand('_generateContextKeyInfo', function () {
	const result: ContextKeyInfo[] = [];
	const seen = new Set<string>();
	for (const info of RawContextKey.all()) {
		if (!seen.has(info.key)) {
			seen.add(info.key);
			result.push(info);
		}
	}
	result.sort((a, b) => a.key.localeCompare(b.key));
	console.log(JSON.stringify(result, undefined, 2));
});
