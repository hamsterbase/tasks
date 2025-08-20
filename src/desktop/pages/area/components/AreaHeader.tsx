import { areaPageTitleInputId, projectPageTitleInputId } from '@/components/edit/inputId';
import { areaTitleInputKey } from '@/components/edit/inputKeys';
import { AreaIcon, CircleIcon } from '@/components/icons';
import { getAreaDetail } from '@/core/state/getArea';
import { EntityHeader, EntityHeaderAction } from '@/desktop/components/common/EntityHeader';
import { useDesktopTaskDisplaySettings } from '@/desktop/hooks/useDesktopTaskDisplaySettings';
import { useService } from '@/hooks/use-service';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import type { TreeID } from 'loro-crdt';
import React from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router';

interface AreaHeaderProps {
  area: ReturnType<typeof getAreaDetail>;
  areaId: TreeID;
}

export const AreaHeader: React.FC<AreaHeaderProps> = ({ area, areaId }) => {
  const todoService = useService(ITodoService);
  const navigate = useNavigate();
  const { openTaskDisplaySettings } = useDesktopTaskDisplaySettings(`area-${areaId}`);

  const handleCreateProject = () => {
    const projectId = flushSync(() => {
      return todoService.addProject({
        title: '',
        position: {
          type: 'firstElement',
          parentId: areaId,
        },
      });
    });

    if (projectId) {
      const projectUid = todoService.modelState.taskObjectMap.get(projectId)?.uid;
      if (projectUid) {
        navigate(`/desktop/project/${projectUid}`, {
          state: {
            focusInput: projectPageTitleInputId(projectId),
          },
        });
      }
    }
  };

  const actions: EntityHeaderAction[] = [
    {
      icon: (
        <div className="relative">
          <CircleIcon className="size-4" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full flex items-center justify-center">
            <span className="text-xs leading-none">+</span>
          </div>
        </div>
      ),
      handleClick: handleCreateProject,
      title: localize('area.createProject', 'Create Project'),
      className:
        'flex items-center gap-2 px-3 py-1.5 text-sm text-t2 hover:text-t1 hover:bg-bg2 rounded-md transition-colors',
    },
  ];

  return (
    <EntityHeader
      editable
      inputKey={areaTitleInputKey(areaId)}
      inputId={areaPageTitleInputId(areaId)}
      renderIcon={() => <AreaIcon className="size-5 text-t2" />}
      title={area.title}
      placeholder={localize('area.untitled', 'New Area')}
      actions={actions}
      internalActions={{ displaySettings: { onOpen: openTaskDisplaySettings } }}
      onSave={(title) => {
        todoService.updateArea(areaId, { title });
      }}
    />
  );
};
