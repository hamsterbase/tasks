import { TagIcon } from '@/components/icons';
import { getAllTags } from '@/core/state/getAllTags';
import { getAreaDetail } from '@/core/state/getArea';
import { getProject } from '@/core/state/getProject';
import { getTaskInfo } from '@/core/state/getTaskInfo';
import { useTagEditor } from '@/desktop/overlay/tagEditor/useTagEditor';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import type { TreeID } from 'loro-crdt';
import React from 'react';
import { TaskDetailAttributeRow } from './selectionPanel/components/TaskDetailAttributeRow';

interface ITagsFieldProps {
  itemId: TreeID;
}

export const TagsField: React.FC<ITagsFieldProps> = ({ itemId }) => {
  const todoService = useService(ITodoService);
  const { openTagEditor } = useTagEditor();

  const itemData = React.useMemo(() => {
    try {
      const objectData = todoService.modelState.taskObjectMap.get(itemId);
      if (!objectData) return null;

      if (objectData.type === 'project') {
        return { ...getProject(todoService.modelState, itemId), itemType: 'project' as const };
      } else if (objectData.type === 'task') {
        return { ...getTaskInfo(todoService.modelState, itemId), itemType: 'task' as const };
      } else if (objectData.type === 'area') {
        return { ...getAreaDetail(todoService.modelState, itemId), itemType: 'area' as const };
      }
      return null;
    } catch {
      return null;
    }
  }, [itemId, todoService.modelState]);

  if (!itemData) return null;

  const handleTagsClick = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left,
      y: rect.top,
    };
    const allTags = getAllTags(todoService.modelState);
    openTagEditor(
      itemData.tags,
      allTags,
      (tags) => {
        if (itemData.itemType === 'project') {
          todoService.updateProject(itemId, { tags });
        } else if (itemData.itemType === 'task') {
          todoService.updateTask(itemId, { tags });
        } else if (itemData.itemType === 'area') {
          todoService.updateArea(itemId, { tags });
        }
      },
      position
    );
  };

  if (itemData.tags.length === 0) {
    return (
      <TaskDetailAttributeRow
        icon={<TagIcon className={desktopStyles.TaskDetailAttributeIcon} />}
        label={localize('tasks.tags', 'Tags')}
        content={localize('tasks.add.tags', 'Not set')}
        placeholder={true}
        onClick={handleTagsClick}
      />
    );
  }

  return (
    <TaskDetailAttributeRow
      icon={<TagIcon className={desktopStyles.TaskDetailAttributeIcon} />}
      label={localize('tasks.tags', 'Tags')}
      onClick={handleTagsClick}
      content={
        <div className={desktopStyles.TaskDetailAttributeTagList}>
          {itemData.tags.map((tag, index) => (
            <span key={index} className={desktopStyles.TaskDetailAttributeTag}>
              {tag}
            </span>
          ))}
        </div>
      }
    />
  );
};
