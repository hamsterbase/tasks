import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { KeyCode } from 'vscf/internal/base/common/keyCodes';
import { KeybindingsRegistry, KeybindingWeight } from 'vscf/platform/keybinding/common';
import { TimePickerFocus } from './contextKey';
import { TimePickerOverlayController } from './TimePickerOverlayController';

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'TimePickerCancel',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: TimePickerFocus,
  primary: KeyCode.Escape,
  handler: (acc) => {
    const overlayService = acc.get(IWorkbenchOverlayService);
    const controller = overlayService.getOverlay(OverlayEnum.desktopTimePicker) as TimePickerOverlayController;
    if (controller) {
      controller.dispose();
    }
  },
});
