import { formatItemId } from '@/base/common/itemId';
import { HashIcon } from '@/components/icons';
import { useDesktopMessage } from '@/desktop/overlay/desktopMessage/useDesktopMessage';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { TestIds } from '@/testIds';
import { TreeID } from 'loro-crdt';
import React from 'react';
import { TaskDetailAttributeRow } from './TaskDetailAttributeRow';

interface ItemIdFieldProps {
  itemId: TreeID;
}

export const ItemIdField: React.FC<ItemIdFieldProps> = ({ itemId }) => {
  const todoService = useService(ITodoService);
  const desktopMessage = useDesktopMessage();
  const uid = todoService.modelState.taskObjectMap.get(itemId)?.uid;

  if (!uid) {
    return null;
  }

  const displayId = formatItemId(uid);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayId);
    desktopMessage({
      type: 'success',
      message: localize('tasks.id.copySuccess', 'ID copied to clipboard'),
    });
  };

  return (
    <TaskDetailAttributeRow
      icon={<HashIcon />}
      label={localize('tasks.id', 'ID')}
      content={<span className={desktopStyles.ItemIdFieldValue}>{displayId}</span>}
      onClick={handleCopy}
      dataTestId={TestIds.DetailPanel.IdField}
    />
  );
};
