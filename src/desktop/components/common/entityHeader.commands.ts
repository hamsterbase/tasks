import { KeyCode } from 'vscf/internal/base/common/keyCodes';
import { ContextKeyExpr } from 'vscf/platform/contextkey/common';
import { KeybindingsRegistry, KeybindingWeight } from 'vscf/platform/keybinding/common';
import { EntityHeaderDetailFocus, EntityHeaderPageFocus } from './entityHeader.contextKey';

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
