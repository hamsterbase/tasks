import { RawContextKey } from 'vscf/platform/contextkey/common';

export const MainListFocus = new RawContextKey<boolean>('HasListFocus', false);
export const MainListCursorHasNextItem = new RawContextKey<boolean>('MainListCursorHasNextItem', false);
export const MainListCursorHasPreviousItem = new RawContextKey<boolean>('MainListCursorHasPreviousItem', false);
export const MainListIsInputValueEmpty = new RawContextKey<boolean>('MainListIsInputValueEmpty', false);

export const SubListFocus = new RawContextKey<boolean>('SubListFocus', false);
export const SubListCursorHasNextItem = new RawContextKey<boolean>('SubListCursorHasNextItem', false);
export const SubListCursorHasPreviousItem = new RawContextKey<boolean>('SubListCursorHasPreviousItem', false);
export const SubListIsInputValueEmpty = new RawContextKey<boolean>('SubListIsInputValueEmpty', false);
