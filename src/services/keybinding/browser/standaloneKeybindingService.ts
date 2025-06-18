import { ILogService } from 'vscf/internal/platform/log/common/log';
import type { INotificationService } from 'vscf/internal/platform/notification/common/notification';
import * as dom from 'vscf/base/browser/dom';
import { IKeyboardEvent, StandardKeyboardEvent } from 'vscf/base/browser/keyboardEvent';
import { KeyCodeChord, Keybinding, ResolvedKeybinding, decodeKeybinding } from 'vscf/base/common/keybindings';
import { Disposable, DisposableStore, IDisposable, combinedDisposable, toDisposable } from 'vscf/base/common/lifecycle';
import { OS } from 'vscf/base/common/platform';
import { CommandsRegistry, ICommandHandler, ICommandService } from 'vscf/platform/commands/common';
import { ContextKeyExpression, IContextKeyService } from 'vscf/platform/contextkey/common';
import {
  AbstractKeybindingService,
  IKeybindingItem,
  KeybindingResolver,
  KeybindingsRegistry,
  KeybindingsSchemaContribution,
  ResolvedKeybindingItem,
  USLayoutResolvedKeybinding,
} from 'vscf/platform/keybinding/common';

export interface IKeybindingRule {
  keybinding: number;
  command?: string | null;
  commandArgs?: unknown;
  when?: ContextKeyExpression | null;
}

class DomNodeListeners extends Disposable {
  constructor(
    public readonly domNode: HTMLElement,
    disposables: DisposableStore
  ) {
    super();
    this._register(disposables);
  }
}

export class StandaloneKeybindingService extends AbstractKeybindingService {
  private _cachedResolver: KeybindingResolver | null;
  private _dynamicKeybindings: IKeybindingItem[];
  private readonly _domNodeListeners: DomNodeListeners[];

  constructor(
    domNode: HTMLElement,
    @IContextKeyService readonly contextKeyService: IContextKeyService,
    @ICommandService readonly commandService: ICommandService
  ) {
    super(
      contextKeyService,
      commandService,
      {} as unknown as INotificationService,
      {
        trace() {},
      } as unknown as ILogService
    );

    this._cachedResolver = null;
    this._dynamicKeybindings = [];
    this._domNodeListeners = [];

    const addContainer = (domNode: HTMLElement) => {
      const disposables = new DisposableStore();
      // for standard keybindings
      disposables.add(
        dom.addDisposableListener(domNode, dom.EventType.KEY_DOWN, (e: KeyboardEvent) => {
          const keyEvent = new StandardKeyboardEvent(e);
          const shouldPreventDefault = this._dispatch(keyEvent, keyEvent.target);
          if (shouldPreventDefault) {
            keyEvent.preventDefault();
            keyEvent.stopPropagation();
          }
        })
      );

      // for single modifier chord keybindings (e.g. shift shift)
      disposables.add(
        dom.addDisposableListener(domNode, dom.EventType.KEY_UP, (e: KeyboardEvent) => {
          const keyEvent = new StandardKeyboardEvent(e);
          const shouldPreventDefault = this._singleModifierDispatch(keyEvent, keyEvent.target);
          if (shouldPreventDefault) {
            keyEvent.preventDefault();
          }
        })
      );

      this._domNodeListeners.push(new DomNodeListeners(domNode, disposables));
    };

    addContainer(domNode);
  }

  public addDynamicKeybinding(
    command: string,
    keybinding: number,
    handler: ICommandHandler,
    when: ContextKeyExpression | undefined
  ): IDisposable {
    return combinedDisposable(
      CommandsRegistry.registerCommand(command, handler),
      this.addDynamicKeybindings([
        {
          keybinding,
          command,
          when,
        },
      ])
    );
  }

  public addDynamicKeybindings(rules: IKeybindingRule[]): IDisposable {
    const entries: IKeybindingItem[] = rules.map((rule) => {
      const keybinding = decodeKeybinding(rule.keybinding, OS);
      return {
        keybinding,
        command: rule.command ?? null,
        commandArgs: rule.commandArgs,
        when: rule.when,
        weight1: 1000,
        weight2: 0,
        extensionId: null,
        isBuiltinExtension: false,
      };
    });
    this._dynamicKeybindings = this._dynamicKeybindings.concat(entries);

    this.updateResolver();

    return toDisposable(() => {
      // Search the first entry and remove them all since they will be contiguous
      for (let i = 0; i < this._dynamicKeybindings.length; i++) {
        if (this._dynamicKeybindings[i] === entries[0]) {
          this._dynamicKeybindings.splice(i, entries.length);
          this.updateResolver();
          return;
        }
      }
    });
  }

  private updateResolver(): void {
    this._cachedResolver = null;
    this._onDidUpdateKeybindings.fire();
  }

  protected _getResolver(): KeybindingResolver {
    if (!this._cachedResolver) {
      const defaults = this._toNormalizedKeybindingItems(KeybindingsRegistry.getDefaultKeybindings(), true);
      const overrides = this._toNormalizedKeybindingItems(this._dynamicKeybindings, false);
      this._cachedResolver = new KeybindingResolver(defaults, overrides, (str) => this._log(str));
    }
    return this._cachedResolver;
  }

  protected _documentHasFocus(): boolean {
    return document.hasFocus();
  }

  private _toNormalizedKeybindingItems(items: IKeybindingItem[], isDefault: boolean): ResolvedKeybindingItem[] {
    const result: ResolvedKeybindingItem[] = [];
    let resultLen = 0;
    for (const item of items) {
      const when = item.when || undefined;
      const keybinding = item.keybinding;

      if (!keybinding) {
        // This might be a removal keybinding item in user settings => accept it
        result[resultLen++] = new ResolvedKeybindingItem(
          undefined,
          item.command,
          item.commandArgs,
          when,
          isDefault,
          null,
          false
        );
      } else {
        const resolvedKeybindings = USLayoutResolvedKeybinding.resolveKeybinding(keybinding, OS);
        for (const resolvedKeybinding of resolvedKeybindings) {
          result[resultLen++] = new ResolvedKeybindingItem(
            resolvedKeybinding,
            item.command,
            item.commandArgs,
            when,
            isDefault,
            null,
            false
          );
        }
      }
    }

    return result;
  }

  public resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[] {
    return USLayoutResolvedKeybinding.resolveKeybinding(keybinding, OS);
  }

  public resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): ResolvedKeybinding {
    const chord = new KeyCodeChord(
      keyboardEvent.ctrlKey,
      keyboardEvent.shiftKey,
      keyboardEvent.altKey,
      keyboardEvent.metaKey,
      keyboardEvent.keyCode
    );
    return new USLayoutResolvedKeybinding([chord], OS);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public resolveUserBinding(_userBinding: string): ResolvedKeybinding[] {
    return [];
  }

  public _dumpDebugInfo(): string {
    return '';
  }

  public _dumpDebugInfoJSON(): string {
    return '';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public registerSchemaContribution(_contribution: KeybindingsSchemaContribution): void {
    // noop
  }
}
