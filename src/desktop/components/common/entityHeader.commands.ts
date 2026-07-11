import { KeyCode, KeyMod } from '@hamsterbase/foundation/keybinding';
import { ContextKeyExpr } from '@hamsterbase/foundation/contextkey';
import { KeybindingsRegistry, KeybindingWeight } from '@hamsterbase/foundation/keybinding';
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
