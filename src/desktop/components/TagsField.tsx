import { TagIcon } from '@/components/icons';
import { getAllTags } from '@/core/state/getAllTags';
import { getAreaDetail } from '@/core/state/getArea';
import { getProject } from '@/core/state/getProject';
import { getTaskInfo } from '@/core/state/getTaskInfo';
import { useTagEditor } from '@/desktop/overlay/tagEditor/useTagEditor';
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
      x: rect.left - 320 - 10,
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

  const labelKey =
    itemData.itemType === 'project'
      ? localize('project.detail.tags', 'Tags')
      : itemData.itemType === 'area'
        ? localize('area.detail.tags', 'Tags')
        : localize('tasks.tags', 'Tags');

  return (
    <div
      className="flex items-center justify-between py-2 gap-3 cursor-pointer hover:bg-bg2 rounded-md px-2 -mx-2 transition-colors"
      onClick={handleTagsClick}
    >
      <div className="flex items-center gap-2 text-t2">
        <TagIcon className="size-4" />
        <span className="text-sm">{labelKey}</span>
      </div>
      <div className="flex flex-wrap gap-1 justify-end">
        {itemData.tags.length > 0 ? (
          itemData.tags.map((tag, index) => (
            <span key={index} className="text-brand rounded-md text-xs font-medium">
              #{tag}
            </span>
          ))
        ) : (
          <span className="text-sm text-t3">{localize('tasks.edit_tags', 'Edit tags')}</span>
        )}
      </div>
    </div>
  );
};
