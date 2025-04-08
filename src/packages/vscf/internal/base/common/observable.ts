// @ts-nocheck
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export {
  IObservable,
  IObserver,
  IReader,
  ISettable,
  ISettableObservable,
  ITransaction,
  observableValue,
  transaction,
} from 'vscf/internal/base/common/observableImpl/base.ts';
export { derived } from 'vscf/internal/base/common/observableImpl/derived.ts';
export {
  autorun,
  autorunDelta,
  autorunHandleChanges,
  autorunWithStore,
} from 'vscf/internal/base/common/observableImpl/autorun.ts';
export * from 'vscf/internal/base/common/observableImpl/utils.ts';

import { ConsoleObservableLogger, setLogger } from 'vscf/internal/base/common/observableImpl/logging.ts';

const enableLogging = false;
if (enableLogging) {
  setLogger(new ConsoleObservableLogger());
}
