import { formatItemId } from '@/base/common/itemId';
import { HashIcon } from '@/components/icons';
import { HeaderAction } from '@/desktop/components/common/EntityHeader';
import { useDesktopMessage } from '@/desktop/overlay/desktopMessage/useDesktopMessage';
import { useService } from '@/hooks/use-service';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { TestIds } from '@/testIds';
import { TreeID } from 'loro-crdt';
import React from 'react';

export const useCopyItemIdAction = (itemId: TreeID): HeaderAction | null => {
  const todoService = useService(ITodoService);
  const desktopMessage = useDesktopMessage();
  const uid = todoService.modelState.taskObjectMap.get(itemId)?.uid;

  if (!uid) {
    return null;
  }

  const displayId = formatItemId(uid);

  return {
    icon: <HashIcon />,
    title: localize('tasks.id.copy', 'Copy ID'),
    testId: TestIds.DetailPanel.IdField,
    handleClick: async () => {
      await navigator.clipboard.writeText(displayId);
      desktopMessage({
        type: 'success',
        message: localize('tasks.id.copySuccess', 'ID copied to clipboard'),
      });
    },
  };
};
