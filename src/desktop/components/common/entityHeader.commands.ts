import { KeyCode, KeyMod } from 'vscf/internal/base/common/keyCodes';
import { ContextKeyExpr } from 'vscf/platform/contextkey/common';
import { KeybindingsRegistry, KeybindingWeight } from 'vscf/platform/keybinding/common';
import { EntityHeaderDetailFocus, EntityHeaderDisableNewLine, EntityHeaderPageFocus } from './entityHeader.contextKey';

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'EntityHeaderSubmit',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.or(EntityHeaderPageFocus, EntityHeaderDetailFocus),
  primary: KeyCode.Enter,
  handler: () => {
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLTextAreaElement) {
      activeElement.blur();
    }
  },
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'EntityHeaderDisableNewLine',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.and(EntityHeaderDetailFocus, EntityHeaderDisableNewLine),
  primary: KeyMod.Shift | KeyCode.Enter,
  handler: () => {},
});
