import { DeleteIcon, DueIcon, EditIcon, HeadingIcon, MoveIcon, ScheduledIcon, TagIcon } from '@/components/icons';
import { ProjectInfoState } from '@/core/state/type';
import { ItemStatus } from '@/core/type';
import { useBack } from '@/hooks/useBack.ts';
import { ProjectStatusBox } from '@/components/icons/ProjectStatusBox.tsx';
import { TaskStatusBox } from '@/mobile/components/taskItem/TaskStatusBox';
import { useDatepicker } from '@/mobile/overlay/datePicker/useDatepicker';
import { useDialog } from '@/mobile/overlay/dialog/useDialog.ts';
import { PopupActionItem } from '@/mobile/overlay/popupAction/PopupActionController';
import { usePopupAction } from '@/mobile/overlay/popupAction/usePopupAction';
import { useProjectAreaSelector } from '@/mobile/overlay/projectAreaSelector/useProjectAreaSelector';
import { useTagEditor } from '@/mobile/overlay/tagEditor/useTagEditor';
import { ITodoService } from '@/services/todo/common/todoService';
import { localize } from '@/nls';
import React from 'react';
import { useService } from './use-service';

const useProject = (project: ProjectInfoState | null) => {
  const todoService = useService(ITodoService);
  const back = useBack();

  const popupAction = usePopupAction();
  const tagEditor = useTagEditor();
  const datepicker = useDatepicker();
  const projectAreaSelector = useProjectAreaSelector();

  const handleEditTag = () => {
    if (!project) return;
    tagEditor(project.tags, (tags) => {
      todoService.updateProject(project.id, { tags });
    });
  };

  const handleEditStartDate = () => {
    if (!project) return;
    datepicker(project.startDate, (date) => {
      todoService.updateProject(project!.id, { startDate: date });
    });
  };

  const handleEditDueDate = () => {
    if (!project) return;
    datepicker(project.dueDate, (date) => {
      todoService.updateProject(project!.id, { dueDate: date });
    });
  };

  const handleClearStartDate = () => {
    if (!project) return;
    todoService.updateProject(project!.id, { startDate: null });
  };

  const handleClearDueDate = () => {
    if (!project) return;
    todoService.updateProject(project!.id, { dueDate: null });
  };

  const handleAddHeading = () => {
    if (!project) return;
    const id = todoService.addProjectHeading({
      title: '',
      position: {
        type: 'firstElement',
        parentId: project.id,
      },
    });
    todoService.editItem(id);
  };

  const handleAddTask = () => {
    if (!project) return;
    const id = todoService.addTask({
      title: '',
      position: {
        type: 'firstElement',
        parentId: project.id,
      },
    });
    setTimeout(() => {
      todoService.editItem(id);
    }, 1);
  };

  const handleEditTitle = () => {
    if (!project) return;
    todoService.editItem(project.id);
  };

  const dialog = useDialog();
  function handleDeleteProject() {
    if (!project) return;
    dialog({
      title: localize('project.delete_project', 'Delete Project'),
      description: localize('project.delete_project_description', 'Are you sure you want to delete this project?'),
      confirmText: localize('project.delete', 'Delete'),
      onConfirm: () => {
        todoService.deleteItem(project.id);
        back();
      },
      onCancel: () => {},
    });
  }

  const handleMoveProject = () => {
    if (!project) return;
    projectAreaSelector({
      currentItemId: project.id,
      onConfirm: (parentId) => {
        if (!parentId) {
          todoService.updateProject(project.id, {
            position: {
              type: 'firstElement',
            },
          });
          return;
        }
        todoService.updateProject(project.id, {
          position: {
            parentId: parentId,
            type: 'firstElement',
          },
        });
      },
    });
  };

  const handleMoreOptions = () => {
    popupAction({
      items: [
        {
          icon: <EditIcon />,
          name: localize('project.edit_title', 'Edit Title'),
          onClick: handleEditTitle,
        },
        {
          icon: <HeadingIcon />,
          name: localize('project.add_heading', 'Add Heading'),
          onClick: handleAddHeading,
        },
        {
          icon: <ScheduledIcon />,
          name: localize('project.edit_start_date', 'Edit Start Date'),
          onClick: handleEditStartDate,
        },
        {
          icon: <DueIcon />,
          name: localize('project.edit_due_date', 'Edit Due Date'),
          onClick: handleEditDueDate,
        },
        {
          icon: <TagIcon />,
          name: localize('project.edit_tags', 'Edit Tags'),
          onClick: handleEditTag,
        },
        {
          icon: <MoveIcon />,
          name: localize('project.move_project', 'Move Project'),
          onClick: handleMoveProject,
        },
        {
          icon: <DeleteIcon />,
          name: localize('project.delete_project', 'Delete Project'),
          onClick: handleDeleteProject,
        },
      ] as PopupActionItem[],
    });
  };

  function updateTaskStatus(tragetStatus: ItemStatus) {
    if (!project) return;
    const leftProject = project.totalTasks - project.completedTasks;
    if (leftProject === 0) {
      todoService.transitionProjectState({ projectId: project.id, projectStatus: tragetStatus });
      return;
    }
    popupAction({
      // 还有 leftProject 个任务未完成，你要如何操作
      description: localize(
        'project.toggle_status_description',
        'There are {0} tasks left, what do you want to do?',
        leftProject
      ),
      items: [
        {
          icon: <TaskStatusBox status={'completed'} />,
          name: localize('tasks.mark_as_completed', 'Mark as Completed'),
          onClick: () => {
            todoService.transitionProjectState({
              projectId: project.id,
              projectStatus: tragetStatus,
              taskStatus: 'completed',
            });
          },
        },
        {
          icon: <TaskStatusBox status={'canceled'} />,
          name: localize('tasks.mark_as_canceled', 'Mark as Canceled'),
          onClick: () => {
            todoService.transitionProjectState({
              projectId: project.id,
              projectStatus: tragetStatus,
              taskStatus: 'canceled',
            });
          },
        },
      ] as PopupActionItem[],
    });
  }

  const handleToggleProjectStatus = () => {
    if (!project) return;
    switch (project.status) {
      case 'created': {
        updateTaskStatus('completed');
        break;
      }
      case 'canceled': {
        todoService.transitionProjectState({ projectId: project.id, projectStatus: 'created' });
        break;
      }
      case 'completed': {
        todoService.transitionProjectState({ projectId: project.id, projectStatus: 'created' });
        break;
      }
    }
  };

  const handleLongPressStatusIcon = () => {
    if (!project) return;
    popupAction({
      items: [
        {
          condition: project.status !== 'created',
          icon: <ProjectStatusBox status={'created'} progress={project.progress} />,
          name: localize('project.mark_as_created', 'Mark as Created'),
          onClick: () => {
            todoService.transitionProjectState({ projectId: project.id, projectStatus: 'created' });
          },
        },
        {
          condition: project.status !== 'completed',
          icon: <ProjectStatusBox status={'completed'} progress={project.progress} />,
          name: localize('project.mark_as_completed', 'Mark as Completed'),
          onClick: () => {
            updateTaskStatus('completed');
          },
        },
        {
          condition: project.status !== 'canceled',
          icon: <ProjectStatusBox status={'canceled'} progress={project.progress} />,
          name: localize('project.mark_as_canceled', 'Mark as Canceled'),
          onClick: () => {
            updateTaskStatus('canceled');
          },
        },
      ] as PopupActionItem[],
    });
  };
  const handleUpdateNotes = (notes?: string) => {
    if (!project) return;
    todoService.updateProject(project!.id, { notes });
  };

  return {
    project,
    handleLongPressStatusIcon,
    handleToggleProjectStatus,
    handleEditStartDate,
    handleEditDueDate,
    handleEditTag,
    handleClearStartDate,
    handleClearDueDate,
    handleMoreOptions,
    handleUpdateNotes,
    handleAddTask,
  };
};

export default useProject;
