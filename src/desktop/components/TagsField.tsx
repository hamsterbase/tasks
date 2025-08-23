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

  const handleTagsClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
      <div className={desktopStyles.TagsFieldEmptyButton} onClick={handleTagsClick}>
        <TagIcon className={desktopStyles.TagsFieldIcon} />
        <span className={desktopStyles.TagsFieldText}>{localize('tasks.add.tags', 'Add Tags')}</span>
      </div>
    );
  }

  return (
    <div className={desktopStyles.TagsFieldWithTagsButton} onClick={handleTagsClick}>
      <TagIcon className={desktopStyles.TagsFieldIconWithTags} />
      <div className={desktopStyles.TagsFieldTagsContainer}>
        {itemData.tags.map((tag, index) => (
          <span key={index} className={desktopStyles.TagsFieldTag}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};
