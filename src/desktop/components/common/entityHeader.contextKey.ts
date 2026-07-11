import { RawContextKey } from '@hamsterbase/foundation/contextkey';

export const EntityHeaderPageFocus = new RawContextKey<boolean>('entityHeaderPageFocus', false);
export const EntityHeaderDetailFocus = new RawContextKey<boolean>('entityHeaderDetailFocus', false);
export const EntityHeaderDisableNewLine = new RawContextKey<boolean>('entityHeaderDisableNewLine', false);
