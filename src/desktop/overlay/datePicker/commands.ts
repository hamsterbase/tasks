import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { KeyCode } from '@hamsterbase/foundation/keybinding';
import { KeybindingsRegistry, KeybindingWeight } from '@hamsterbase/foundation/keybinding';
import { DatePickerOverlayController } from './DatePickerOverlayController';
import { DatePickerFocus } from './contextKey';

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'DatePickerSave',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: DatePickerFocus,
  primary: KeyCode.Enter,
  handler: (acc) => {
    const overlayService = acc.get(IWorkbenchOverlayService);
    const controller = overlayService.getOverlay(OverlayEnum.desktopDatePicker) as DatePickerOverlayController;
    if (controller) {
      controller.saveCurrentDate();
    }
  },
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'DatePickerCancel',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: DatePickerFocus,
  primary: KeyCode.Escape,
  handler: (acc) => {
    const overlayService = acc.get(IWorkbenchOverlayService);
    const controller = overlayService.getOverlay(OverlayEnum.desktopDatePicker) as DatePickerOverlayController;
    if (controller) {
      controller.dispose();
    }
  },
});
