import { RawContextKey } from 'vscf/platform/contextkey/common';

export const CommandPaletteFocus = new RawContextKey<boolean>('commandPaletteFocus', false);
export const CommandPaletteHasResults = new RawContextKey<boolean>('commandPaletteHasResults', false);
export const CommandPaletteHasSelection = new RawContextKey<boolean>('commandPaletteHasSelection', false);
