// @ts-nocheck
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AutorunObserver } from 'vscf/internal/base/common/observableImpl/autorun.ts';
import { IObservable, ObservableValue, TransactionImpl } from 'vscf/internal/base/common/observableImpl/base.ts';
import { Derived } from 'vscf/internal/base/common/observableImpl/derived.ts';
import { FromEventObservable } from 'vscf/internal/base/common/observableImpl/utils.ts';

let globalObservableLogger: IObservableLogger | undefined;

export function setLogger(logger: IObservableLogger): void {
  globalObservableLogger = logger;
}

export function getLogger(): IObservableLogger | undefined {
  return globalObservableLogger;
}

interface IChangeInformation {
  oldValue: unknown;
  newValue: unknown;
  change: unknown;
  didChange: boolean;
}

export interface IObservableLogger {
  handleObservableChanged(observable: ObservableValue<unknown, unknown>, info: IChangeInformation): void;
  handleFromEventObservableTriggered(observable: FromEventObservable<any, any>, info: IChangeInformation): void;

  handleAutorunCreated(autorun: AutorunObserver): void;
  handleAutorunTriggered(autorun: AutorunObserver): void;

  handleDerivedCreated(observable: Derived<unknown>): void;
  handleDerivedRecomputed(observable: Derived<unknown>, info: IChangeInformation): void;

  handleBeginTransaction(transaction: TransactionImpl): void;
  handleEndTransaction(): void;
}

export class ConsoleObservableLogger implements IObservableLogger {
  private indentation = 0;

  private textToConsoleArgs(text: ConsoleText): unknown[] {
    return consoleTextToArgs([normalText(repeat('|  ', this.indentation)), text]);
  }

  private formatInfo(info: IChangeInformation): ConsoleText[] {
    return info.didChange
      ? [
          normalText(` `),
          styled(formatValue(info.oldValue, 70), {
            color: 'red',
            strikeThrough: true,
          }),
          normalText(` `),
          styled(formatValue(info.newValue, 60), {
            color: 'green',
          }),
        ]
      : [normalText(` (unchanged)`)];
  }

  handleObservableChanged(observable: IObservable<unknown, unknown>, info: IChangeInformation): void {
    console.log(
      ...this.textToConsoleArgs([
        formatKind('observable value changed'),
        styled(observable.debugName, { color: 'BlueViolet' }),
        ...this.formatInfo(info),
      ])
    );
  }

  private readonly changedObservablesSets = new WeakMap<object, Set<IObservable<any, any>>>();

  formatChanges(changes: Set<IObservable<any, any>>): ConsoleText | undefined {
    if (changes.size === 0) {
      return undefined;
    }
    return styled(' (changed deps: ' + [...changes].map((o) => o.debugName).join(', ') + ')', { color: 'gray' });
  }

  handleDerivedCreated(derived: Derived<unknown>): void {
    const existingHandleChange = derived.handleChange;
    this.changedObservablesSets.set(derived, new Set());
    derived.handleChange = (observable, change) => {
      this.changedObservablesSets.get(derived)!.add(observable);
      return existingHandleChange.apply(derived, [observable, change]);
    };
  }

  handleDerivedRecomputed(derived: Derived<unknown>, info: IChangeInformation): void {
    const changedObservables = this.changedObservablesSets.get(derived)!;
    console.log(
      ...this.textToConsoleArgs([
        formatKind('derived recomputed'),
        styled(derived.debugName, { color: 'BlueViolet' }),
        ...this.formatInfo(info),
        this.formatChanges(changedObservables),
      ])
    );
    changedObservables.clear();
  }

  handleFromEventObservableTriggered(observable: FromEventObservable<any, any>, info: IChangeInformation): void {
    console.log(
      ...this.textToConsoleArgs([
        formatKind('observable from event triggered'),
        styled(observable.debugName, { color: 'BlueViolet' }),
        ...this.formatInfo(info),
      ])
    );
  }

  handleAutorunCreated(autorun: AutorunObserver): void {
    const existingHandleChange = autorun.handleChange;
    this.changedObservablesSets.set(autorun, new Set());
    autorun.handleChange = (observable, change) => {
      this.changedObservablesSets.get(autorun)!.add(observable);
      return existingHandleChange.apply(autorun, [observable, change]);
    };
  }

  handleAutorunTriggered(autorun: AutorunObserver): void {
    const changedObservables = this.changedObservablesSets.get(autorun)!;
    console.log(
      ...this.textToConsoleArgs([
        formatKind('autorun'),
        styled(autorun.debugName, { color: 'BlueViolet' }),
        this.formatChanges(changedObservables),
      ])
    );
    changedObservables.clear();
  }

  handleBeginTransaction(transaction: TransactionImpl): void {
    let transactionName = transaction.getDebugName();
    if (transactionName === undefined) {
      transactionName = '';
    }
    console.log(
      ...this.textToConsoleArgs([formatKind('transaction'), styled(transactionName, { color: 'BlueViolet' })])
    );
    this.indentation++;
  }

  handleEndTransaction(): void {
    this.indentation--;
  }
}

type ConsoleText =
  | (ConsoleText | undefined)[]
  | { text: string; style: string; data?: Record<string, unknown> }
  | { data: Record<string, unknown> };

function consoleTextToArgs(text: ConsoleText): unknown[] {
  const styles = new Array<any>();
  const initial = {};
  const data = initial;
  let firstArg = '';

  function process(t: ConsoleText): void {
    if ('length' in t) {
      for (const item of t) {
        if (item) {
          process(item);
        }
      }
    } else if ('text' in t) {
      firstArg += `%c${t.text}`;
      styles.push(t.style);
      if (t.data) {
        Object.assign(data, t.data);
      }
    } else if ('data' in t) {
      Object.assign(data, t.data);
    }
  }

  process(text);

  const result = [firstArg, ...styles];
  if (Object.keys(data).length > 0) {
    result.push(data);
  }

  return result;
}

function normalText(text: string): ConsoleText {
  return styled(text, { color: 'black' });
}

function formatKind(kind: string): ConsoleText {
  return styled(padStr(`${kind}: `, 10), { color: 'black', bold: true });
}

function styled(
  text: string,
  options: { color: string; strikeThrough?: boolean; bold?: boolean } = {
    color: 'black',
  }
): ConsoleText {
  function objToCss(styleObj: Record<string, string>): string {
    return Object.entries(styleObj).reduce((styleString, [propName, propValue]) => {
      return `${styleString}${propName}:${propValue};`;
    }, '');
  }

  const style: Record<string, string> = {
    color: options.color,
  };
  if (options.strikeThrough) {
    style['text-decoration'] = 'line-through';
  }
  if (options.bold) {
    style['font-weight'] = 'bold';
  }

  return {
    text,
    style: objToCss(style),
  };
}

function formatValue(value: unknown, availableLen: number): string {
  switch (typeof value) {
    case 'number':
      return '' + value;
    case 'string':
      if (value.length + 2 <= availableLen) {
        return `"${value}"`;
      }
      return `"${value.substr(0, availableLen - 7)}"+...`;

    case 'boolean':
      return value ? 'true' : 'false';
    case 'undefined':
      return 'undefined';
    case 'object':
      if (value === null) {
        return 'null';
      }
      if (Array.isArray(value)) {
        return formatArray(value, availableLen);
      }
      return formatObject(value, availableLen);
    case 'symbol':
      return value.toString();
    case 'function':
      return `[[Function${value.name ? ' ' + value.name : ''}]]`;
    default:
      return '' + value;
  }
}

function formatArray(value: unknown[], availableLen: number): string {
  let result = '[ ';
  let first = true;
  for (const val of value) {
    if (!first) {
      result += ', ';
    }
    if (result.length - 5 > availableLen) {
      result += '...';
      break;
    }
    first = false;
    result += `${formatValue(val, availableLen - result.length)}`;
  }
  result += ' ]';
  return result;
}

function formatObject(value: object, availableLen: number): string {
  let result = '{ ';
  let first = true;
  for (const [key, val] of Object.entries(value)) {
    if (!first) {
      result += ', ';
    }
    if (result.length - 5 > availableLen) {
      result += '...';
      break;
    }
    first = false;
    result += `${key}: ${formatValue(val, availableLen - result.length)}`;
  }
  result += ' }';
  return result;
}

function repeat(str: string, count: number): string {
  let result = '';
  for (let i = 1; i <= count; i++) {
    result += str;
  }
  return result;
}

function padStr(str: string, length: number): string {
  while (str.length < length) {
    str += ' ';
  }
  return str;
}
