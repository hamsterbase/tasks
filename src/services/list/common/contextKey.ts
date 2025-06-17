import { RawContextKey } from '@/packages/vscf/platform/contextkey/common';

export const MainListFocus = new RawContextKey<boolean>('HasListFocus', false);
export const MainListCursorHasNextItem = new RawContextKey<boolean>('MainListCursorHasNextItem', false);
export const MainListCursorHasPreviousItem = new RawContextKey<boolean>('MainListCursorHasPreviousItem', false);
