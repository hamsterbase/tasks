import { KeyCode } from 'vscf/internal/base/common/keyCodes';
import { ContextKeyExpr } from 'vscf/platform/contextkey/common';
import { KeybindingsRegistry, KeybindingWeight } from 'vscf/platform/keybinding/common';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { DesktopMenuController } from './DesktopMenuController';
import {
  DesktopMenuFocus,
  DesktopMenuCanMoveDown,
  DesktopMenuCanMoveUp,
  DesktopMenuHasSubmenu,
  DesktopMenuIsSubmenuOpen,
} from './contextKey';

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'DesktopMenuMoveDown',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.and(DesktopMenuFocus, DesktopMenuCanMoveDown),
  primary: KeyCode.DownArrow,
  handler: (acc) => {
    const overlayService = acc.get(IWorkbenchOverlayService);
    const controller = overlayService.getOverlay(OverlayEnum.desktopMenu) as DesktopMenuController;
    if (controller) {
      controller.moveDown();
    }
  },
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'DesktopMenuMoveUp',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.and(DesktopMenuFocus, DesktopMenuCanMoveUp),
  primary: KeyCode.UpArrow,
  handler: (acc) => {
    const overlayService = acc.get(IWorkbenchOverlayService);
    const controller = overlayService.getOverlay(OverlayEnum.desktopMenu) as DesktopMenuController;
    if (controller) {
      controller.moveUp();
    }
  },
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'DesktopMenuOpenSubmenu',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.and(DesktopMenuFocus, DesktopMenuHasSubmenu, ContextKeyExpr.not(DesktopMenuIsSubmenuOpen.key)),
  primary: KeyCode.RightArrow,
  handler: (acc) => {
    const overlayService = acc.get(IWorkbenchOverlayService);
    const controller = overlayService.getOverlay(OverlayEnum.desktopMenu) as DesktopMenuController;
    if (controller) {
      controller.openSubmenu();
    }
  },
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'DesktopMenuCloseSubmenu',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.and(DesktopMenuFocus, DesktopMenuIsSubmenuOpen),
  primary: KeyCode.LeftArrow,
  handler: (acc) => {
    const overlayService = acc.get(IWorkbenchOverlayService);
    const controller = overlayService.getOverlay(OverlayEnum.desktopMenu) as DesktopMenuController;
    if (controller) {
      controller.closeSubmenu();
    }
  },
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'DesktopMenuSelectCurrent',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: DesktopMenuFocus,
  primary: KeyCode.Enter,
  handler: (acc) => {
    const overlayService = acc.get(IWorkbenchOverlayService);
    const controller = overlayService.getOverlay(OverlayEnum.desktopMenu) as DesktopMenuController;
    if (controller) {
      controller.selectCurrent();
    }
  },
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'DesktopMenuCancel',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: DesktopMenuFocus,
  primary: KeyCode.Escape,
  handler: (acc) => {
    const overlayService = acc.get(IWorkbenchOverlayService);
    const controller = overlayService.getOverlay(OverlayEnum.desktopMenu) as DesktopMenuController;
    if (controller) {
      controller.dispose();
    }
  },
});
