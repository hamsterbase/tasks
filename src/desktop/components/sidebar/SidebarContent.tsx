import { getTodayTimestampInUtc } from '@/base/common/time';
import { PlusIcon } from '@/components/icons';
import { FlattenedResult } from '@/core/state/home/flattenedItemsToResult';
import { flattenRootCollections } from '@/core/state/home/getFlattenRootCollections';
import { getRootCollectionsState } from '@/core/state/home/getRootCollectionsState';
import { AreaInfoState, ProjectInfoState } from '@/core/state/type';
import { DesktopMenuController } from '@/desktop/overlay/desktopMenu/DesktopMenuController';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useConfig } from '@/hooks/useConfig';
import { useDragSensors } from '@/hooks/useDragSensors';
import { localize } from '@/nls';
import { toggleAreaConfigKey } from '@/services/config/config';
import { ITodoService } from '@/services/todo/common/todoService';
import { DragDropElements } from '@/utils/dnd/dragDropCollision';
import { getFlattenedItemsCollisionDetectionStrategy } from '@/utils/dnd/flattenedItemsCollisionDetectionStrategy';
import { getFlattenedItemsDragEndPosition } from '@/utils/dnd/flattenedItemsDragPosition';
import { DndContext, DragEndEvent, useDndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import classNames from 'classnames';
import React from 'react';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { desktopStyles } from '../../theme/main';
import { DragOverlayItem } from '../drag/DragOverlayItem';
import { SidebarAreaItem } from './SidebarAreaItem';
import { SidebarFutureTasksItem } from './SidebarFutureTasksItem';
import { SidebarNavigation } from './SidebarNavigation';
import { SidebarProjectItem as SidebarProjectItemComponent } from './SidebarProjectItem';

interface SidebarProjectAndAreaProps {
  flattenedResult: FlattenedResult<AreaInfoState, ProjectInfoState>;
  unstartedProjects: ProjectInfoState[];
}

const SidebarProjectsAndAreas: React.FC<SidebarProjectAndAreaProps> = ({ flattenedResult, unstartedProjects }) => {
  const { active } = useDndContext();

  return (
    <div className="space-y-1">
      {flattenedResult.flattenedItems.map((item) => {
        switch (item.type) {
          case 'header':
            return <SidebarAreaItem key={item.id} areaInfo={item.content} />;
          case 'item': {
            if (item.headerId === active?.id && item.headerId) {
              return null;
            }
            return <SidebarProjectItemComponent key={item.id} projectInfo={item.content} />;
          }
          case 'special': {
            if (item.id === DragDropElements.futureProjects) {
              return <SidebarFutureTasksItem key={item.id} count={unstartedProjects.length} />;
            }
            return null;
          }
          default:
            return null;
        }
      })}
    </div>
  );
};

export const SidebarContent: React.FC = () => {
  const todoService = useService(ITodoService);
  const instantiationService = useService(IInstantiationService);
  useWatchEvent(todoService.onStateChange);
  const { value: config, setValue } = useConfig(toggleAreaConfigKey());
  const sensors = useDragSensors();

  const rootCollections = flattenRootCollections(todoService.modelState, {
    currentDate: getTodayTimestampInUtc(),
    colspanAreaList: config,
    disableCreate: true,
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return null;
    const overId = over.id as string;
    const activeId = active.id as string;
    if (overId === DragDropElements.inbox) {
      return;
    }
    const res = getFlattenedItemsDragEndPosition(activeId, overId, rootCollections);
    if (res) {
      if (res.type === 'moveItem') {
        todoService.updateProject(res.activeId, {
          position: res.position,
        });
        const position = res.position;
        if (position.type === 'firstElement' && position.parentId) {
          if (config.includes(position.parentId)) {
            setValue(config.filter((id) => id !== position.parentId));
          }
        }
      }
      if (res.type === 'moveHeader') {
        todoService.updateArea(res.activeId, {
          position: res.position,
        });
      }
    }
  };

  const handleCreateMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    DesktopMenuController.create(
      {
        menuConfig: [
          {
            label: localize('create_popup.create_project', 'Create Project'),
            onSelect: () => {
              todoService.addProject({ title: '' });
            },
          },
          {
            label: localize('create_popup.create_area', 'Create Area'),
            onSelect: () => {
              todoService.addArea({ title: '' });
            },
          },
        ],
        x: rect.left,
        y: rect.top,
        placement: 'top-start',
      },
      instantiationService
    );
  };

  const { futureProjects } = getRootCollectionsState(todoService.modelState, getTodayTimestampInUtc());
  return (
    <div className={classNames(desktopStyles.sidebarBackground, desktopStyles.sidebarContainerStyle)}>
      <div className="flex flex-col h-full gap-2">
        <SidebarNavigation />
        <div className="flex-1 overflow-y-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={getFlattenedItemsCollisionDetectionStrategy(rootCollections)}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={rootCollections.flattenedItems.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <SidebarProjectsAndAreas flattenedResult={rootCollections} unstartedProjects={futureProjects} />
            </SortableContext>
            <DragOverlayItem />
          </DndContext>
        </div>
        <div>
          <button
            onClick={handleCreateMenu}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-t2 hover:bg-bg2 rounded-md transition-colors"
          >
            <PlusIcon className="size-4" />
            <span>{localize('sidebar.create_menu', 'Create New')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
