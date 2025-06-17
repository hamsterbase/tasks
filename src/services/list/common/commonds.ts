import { KeyCode } from '@/packages/vscf/internal/base/common/keyCodes';
import { ContextKeyExpr } from '@/packages/vscf/platform/contextkey/common';
import { KeybindingsRegistry, KeybindingWeight } from '@/packages/vscf/platform/keybinding/common';
import { IListService } from '@/services/list/common/listService';
import { MainListCursorHasNextItem, MainListCursorHasPreviousItem, MainListFocus } from './contextKey';

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'MainListSelectNext',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.and(MainListFocus, MainListCursorHasNextItem),
  primary: KeyCode.DownArrow,
  handler: (acc) => {
    const currentList = acc.get(IListService).mainList;
    if (currentList) {
      currentList.selectNext();
    }
  },
});

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: 'MainListSelectPrevious',
  weight: KeybindingWeight.WorkbenchContrib + 5,
  when: ContextKeyExpr.and(MainListFocus, MainListCursorHasPreviousItem),
  primary: KeyCode.UpArrow,
  handler: (acc) => {
    const currentList = acc.get(IListService).mainList;
    if (currentList) {
      currentList.selectPrevious();
    }
  },
});
