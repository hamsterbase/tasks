import { DeleteIcon, EditIcon, MoveIcon } from '@/components/icons';
import { ProjectHeadingInfo } from '@/core/state/type';
import { ProjectStatusBox } from '@/mobile/components/taskItem/ProjectStatusBox';
import { useDialog } from '@/mobile/overlay/dialog/useDialog';
import { usePopupAction } from '@/mobile/overlay/popupAction/usePopupAction';
import { useProjectAreaSelector } from '@/mobile/overlay/projectAreaSelector/useProjectAreaSelector';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { TreeID } from 'loro-crdt';
import React from 'react';
import { useService } from './use-service';
import { useToast } from '@/mobile/overlay/toast/useToast';

interface IUseProjectHeaderOptions {
  projectHeadingInfo: ProjectHeadingInfo;
}

export const useProjectHeader = (options: IUseProjectHeaderOptions) => {
  const { projectHeadingInfo } = options;
  const popupAction = usePopupAction();
  const todoService = useService(ITodoService);
  const dialog = useDialog();
  const toast = useToast();
  const projectAreaSelector = useProjectAreaSelector();

  function handleDeleteHeading() {
    dialog({
      title: localize('project_heading.delete_heading', 'Delete Heading'),
      description: localize(
        'project_heading.delete_heading_description',
        'Are you sure you want to delete this heading?'
      ),
      confirmText: localize('project_heading.delete', 'Delete'),
      onConfirm: () => {
        todoService.deleteItem(projectHeadingInfo.id);
      },
      onCancel: () => {},
    });
  }

  function handleConvertToProject() {
    dialog({
      title: localize('project_heading.convert_to_project', 'Convert to Project'),
      description: localize(
        'project_heading.convert_to_project_description',
        'Are you sure you want to convert this heading to a project?'
      ),
      confirmText: localize('project_heading.convert', 'Convert'),
      onConfirm: () => {
        todoService.covertToProject(projectHeadingInfo.id);
      },
      onCancel: () => {},
    });
  }

  const handleMoveToProject = () => {
    projectAreaSelector({
      allowMoveToArea: false,
      onConfirm: (id: TreeID) => {
        todoService.updateProjectHeading(projectHeadingInfo.id, {
          position: { parentId: id, type: 'firstElement' },
        });
        toast({
          message: localize('move_success', 'Moved successfully'),
        });
      },
    });
  };

  function handleMenuClick() {
    popupAction({
      items: [
        {
          icon: <EditIcon />,
          name: localize('project_heading.edit_title', 'Edit Title'),
          onClick: () => {
            todoService.editItem(projectHeadingInfo.id);
          },
        },
        {
          icon: <ProjectStatusBox status={'created'} progress={1} />,
          name: localize('project_heading.convert_to_project', 'Convert to Project'),
          onClick: handleConvertToProject,
        },
        {
          icon: <MoveIcon />,
          name: localize('project_heading.move', 'Move'),
          onClick: handleMoveToProject,
        },
        {
          icon: <DeleteIcon />,
          name: localize('project_heading.delete_heading', 'Delete Heading'),
          onClick: handleDeleteHeading,
        },
      ],
    });
  }

  return {
    projectHeadingInfo,
    handleMenuClick,
  };
};
