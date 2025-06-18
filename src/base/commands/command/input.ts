import { KeyCode } from 'vscf/internal/base/common/keyCodes';
import { InputFocusedContext } from 'vscf/platform/contextkey/common';
import { KeybindingsRegistry, KeybindingWeight } from 'vscf/platform/keybinding/common';

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
