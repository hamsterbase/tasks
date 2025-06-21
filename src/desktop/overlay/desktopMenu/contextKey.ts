import { RawContextKey } from 'vscf/platform/contextkey/common';

export const DesktopMenuFocus = new RawContextKey<boolean>('DesktopMenuFocus', false);
export const DesktopMenuCanMoveDown = new RawContextKey<boolean>('DesktopMenuCanMoveDown', false);
export const DesktopMenuCanMoveUp = new RawContextKey<boolean>('DesktopMenuCanMoveUp', false);
export const DesktopMenuHasSubmenu = new RawContextKey<boolean>('DesktopMenuHasSubmenu', false);
export const DesktopMenuIsSubmenuOpen = new RawContextKey<boolean>('DesktopMenuIsSubmenuOpen', false);
