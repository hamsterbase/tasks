import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { KeyCode, KeyMod } from 'vscf/internal/base/common/keyCodes';
import { ContextKeyExpr } from 'vscf/platform/contextkey/common';
import { KeybindingsRegistry, KeybindingWeight } from 'vscf/platform/keybinding/common';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { CommandPaletteController } from './CommandPaletteController';
import { CommandPaletteFocus, CommandPaletteHasResults, CommandPaletteHasSelection } from './contextKey';

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'OpenCommandPalette',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: undefined,
  primary: KeyCode.KeyK | KeyMod.CtrlCmd,
  handler: (acc) => {
    const instantiationService = acc.get(IInstantiationService);
    CommandPaletteController.create(instantiationService);
  },
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'commandPalette.focusNext',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.and(CommandPaletteFocus, CommandPaletteHasResults),
  primary: KeyCode.DownArrow,
  handler: (acc) => {
    const workbenchOverlayService = acc.get(IWorkbenchOverlayService);
    const controller: CommandPaletteController | null = workbenchOverlayService.getOverlay(OverlayEnum.commandPalette);
    controller?.moveSelectionDown();
  },
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'commandPalette.focusPrevious',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.and(CommandPaletteFocus, CommandPaletteHasResults),
  primary: KeyCode.UpArrow,
  handler: (acc) => {
    const workbenchOverlayService = acc.get(IWorkbenchOverlayService);
    const controller: CommandPaletteController | null = workbenchOverlayService.getOverlay(OverlayEnum.commandPalette);
    controller?.moveSelectionUp();
  },
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'commandPalette.confirm',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.and(CommandPaletteFocus, CommandPaletteHasSelection),
  primary: KeyCode.Enter,
  handler: (acc) => {
    const workbenchOverlayService = acc.get(IWorkbenchOverlayService);
    const controller: CommandPaletteController | null = workbenchOverlayService.getOverlay(OverlayEnum.commandPalette);
    controller?.confirmSelection();
  },
});
