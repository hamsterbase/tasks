import { KeyCode } from '@hamsterbase/foundation/keybinding';
import { InputFocusedContext } from '@hamsterbase/foundation/contextkey';
import { KeybindingsRegistry, KeybindingWeight } from '@hamsterbase/foundation/keybinding';

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'BlurInput',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: InputFocusedContext,
  primary: KeyCode.Escape,
  handler: () => {
    const inputElement = document.activeElement as HTMLInputElement;
    if (inputElement) {
      inputElement.blur();
      let parentNode = inputElement.parentNode as HTMLElement;
      while (parentNode && parentNode !== document.body) {
        if (parentNode.hasAttribute && parentNode.hasAttribute('tabindex')) {
          parentNode.focus();
          break;
        }
        parentNode = parentNode.parentNode as HTMLElement;
      }
    }
  },
});
