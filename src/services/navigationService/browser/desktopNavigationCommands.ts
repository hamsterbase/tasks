import { KeyCode, KeyMod } from '@hamsterbase/foundation/keybinding';
import { KeybindingsRegistry, KeybindingWeight } from '@hamsterbase/foundation/keybinding';
import { INavigationService } from '../common/navigationService';

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'NavigateBack',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  primary: KeyCode.Minus | KeyMod.WinCtrl | KeyMod.Alt,
  mac: {
    primary: KeyCode.Minus | KeyMod.WinCtrl,
  },
  handler: (accessor) => {
    const navigationService = accessor.get(INavigationService);
    navigationService.goBack();
  },
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'NavigateForward',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  primary: KeyCode.Minus | KeyMod.WinCtrl | KeyMod.Shift,
  handler: (accessor) => {
    const navigationService = accessor.get(INavigationService);
    navigationService.goForward();
  },
});
