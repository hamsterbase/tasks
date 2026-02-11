import { DeleteIcon, EditIcon, TagIcon } from '@/components/icons';
import { getAreaDetail } from '@/core/state/getArea';
import { AreaDetailState } from '@/core/state/type';
import { ItemPosition } from '@/core/type';
import { useBack } from '@/hooks/useBack';
import { PopupActionItem } from '@/mobile/overlay/popupAction/PopupActionController';
import { usePopupAction } from '@/mobile/overlay/popupAction/usePopupAction';
import { useTagEditor } from '@/mobile/overlay/tagEditor/useTagEditor';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import type { TreeID } from 'loro-crdt';
import React from 'react';
import { useService } from '../../hooks/use-service';
import { useWatchEvent } from '../../hooks/use-watch-event';
import { MobileProjectCheckbox } from '../components/icon/MobileProjectCheckbox';
import { useDialog } from '../overlay/dialog/useDialog';

export const useArea = (areaId?: TreeID) => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const popupAction = usePopupAction();
  const tagEditor = useTagEditor();
  const back = useBack();

  let areaDetail: AreaDetailState | null = null;
  try {
    if (areaId) {
      areaDetail = getAreaDetail(todoService.modelState, areaId);
    }
  } catch (error) {
    console.error(error);
  }
  const handleEditTag = () => {
    if (!areaDetail) return;
    tagEditor(areaDetail.tags, (tags) => {
      todoService.updateArea(areaDetail.id, { tags });
    });
  };

  const handleCreateProject = () => {
    if (!areaDetail) return;
    const project = todoService.addProject({
      title: localize('area.new_project', 'New Project'),
      position: {
        type: 'firstElement',
        parentId: areaDetail.id,
      },
    });
    todoService.editItem(project);
  };

  const handleAddTask = (position?: ItemPosition) => {
    if (!areaDetail) return;
    const taskId = todoService.addTask({
      title: '',
      position: position ?? {
        type: 'firstElement',
        parentId: areaDetail.id,
      },
    });
    setTimeout(() => {
      todoService.editItem(taskId);
    }, 100);
  };

  function handleEditTitle() {
    if (!areaDetail) return;
    todoService.editItem(areaDetail.id);
  }

  const handleUpdateTitle = (title: string) => {
    if (!areaDetail) return;
    todoService.updateArea(areaDetail.id, { title });
  };
  const dialog = useDialog();
  const handleDeleteArea = () => {
    if (!areaDetail) return;
    dialog({
      title: localize('area.delete', 'Delete Area'),
      description: localize(
        'area.delete_description',
        'Are you sure you want to delete this area? This action cannot be undone.'
      ),
      confirmText: localize('area.delete_confirm', 'Delete'),
      onConfirm: () => {
        todoService.deleteItem(areaDetail.id);
        back();
      },
      onCancel: () => {},
    });
  };

  const handleMoreOptions = () => {
    popupAction({
      groups: [
        {
          items: [
            {
              icon: <EditIcon />,
              name: localize('area.edit_title', 'Edit Title'),
              onClick: handleEditTitle,
            },
            {
              icon: <MobileProjectCheckbox progress={0.6} status={'created'} />,
              name: localize('area.create_project', 'Add Project'),
              onClick: handleCreateProject,
            },
            {
              icon: <TagIcon />,
              name: localize('project.edit_tags', 'Edit Tags'),
              onClick: handleEditTag,
            },
            {
              icon: <DeleteIcon />,
              name: localize('area.delete', 'Delete Area'),
              onClick: handleDeleteArea,
            },
          ] as PopupActionItem[],
        },
      ],
    });
  };

  const isTask = (id: string): boolean => {
    return todoService.modelState.taskObjectMap.get(id)?.type === 'task';
  };
  const isProject = (id: string): boolean => {
    return todoService.modelState.taskObjectMap.get(id)?.type === 'project';
  };

  return {
    areaDetail,
    isTask,
    isProject,
    handleEditTag,
    handleMoreOptions,
    handleAddTask,
    handleUpdateTitle,
  };
};
