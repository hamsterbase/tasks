import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc.ts';
import { areaPageTitleInputId, projectPageTitleInputId } from '@/components/edit/inputId';
import { PlusIcon, SettingsIcon, SyncIcon } from '@/components/icons';
import { FlattenedResult } from '@/core/state/home/flattenedItemsToResult';
import { flattenRootCollections } from '@/core/state/home/getFlattenRootCollections';
import { getFutureProjects } from '@/core/state/home/getFutureProjects';
import { AreaInfoState, ProjectInfoState } from '@/core/state/type';
import { useShouldShowOnDesktopMac } from '@/desktop/hooks/useShouldShowOnDesktopMac.ts';
import { DesktopMenuController } from '@/desktop/overlay/desktopMenu/DesktopMenuController';
import { useDesktopMessage } from '@/desktop/overlay/desktopMessage/useDesktopMessage.ts';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useConfig } from '@/hooks/useConfig';
import { useDragSensors } from '@/hooks/useDragSensors';
import { localize } from '@/nls';
import { toggleAreaConfigKey } from '@/services/config/config';
import { ISelfhostedSyncService } from '@/services/selfhostedSync/common/selfhostedSyncService.ts';
import { ITodoService } from '@/services/todo/common/todoService';
import { DragDropElements } from '@/utils/dnd/dragDropCollision';
import { getFlattenedItemsCollisionDetectionStrategy } from '@/utils/dnd/flattenedItemsCollisionDetectionStrategy';
import { getFlattenedItemsDragEndPosition } from '@/utils/dnd/flattenedItemsDragPosition';
import { DndContext, DragEndEvent, useDndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import classNames from 'classnames';
import React from 'react';
import { flushSync } from 'react-dom';
import { Link, useNavigate } from 'react-router';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import { desktopStyles } from '../../theme/main';
import { DragOverlayItem } from '../drag/DragOverlayItem';
import { DragHandle } from '../DragHandle';
import { SidebarAreaItem } from './SidebarAreaItem/SidebarAreaItem.tsx';
import { SidebarFutureProjectsItem } from './SidebarFutureProjectsItem/SidebarFutureProjectsItem.tsx';
import { SidebarMenu } from './SidebarMenu/SidebarMenu.tsx';
import { SidebarProjectItem as SidebarProjectItemComponent } from './SidebarProjectItem/SidebarProjectItem.tsx';

interface SidebarProjectAndAreaProps {
  flattenedResult: FlattenedResult<AreaInfoState, ProjectInfoState>;
  unstartedProjects: ProjectInfoState[];
}

const SidebarProjectsAndAreas: React.FC<SidebarProjectAndAreaProps> = ({ flattenedResult, unstartedProjects }) => {
  const { active } = useDndContext();

  return (
    <div>
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
              return <SidebarFutureProjectsItem key={item.id} count={unstartedProjects.length} />;
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
  const sidebarContainerNoPaddingTop = useShouldShowOnDesktopMac();
  const instantiationService = useService(IInstantiationService);
  const selfhostedSyncService = useService(ISelfhostedSyncService);
  const navigate = useNavigate();
  useWatchEvent(todoService.onStateChange);
  useWatchEvent(selfhostedSyncService.onStateChange);
  const { value: config, setValue } = useConfig(toggleAreaConfigKey());
  const sensors = useDragSensors();
  const desktopMessage = useDesktopMessage();

  const handleSync = async () => {
    if (selfhostedSyncService.hasServer && !selfhostedSyncService.syncing) {
      try {
        await selfhostedSyncService.sync();
        desktopMessage({
          type: 'success',
          message: localize('sync.sync_success', 'Sync completed successfully.'),
        });
      } catch (error) {
        desktopMessage({
          type: 'error',
          message: (error as Error).message,
        });
      }
    }
  };

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
              const projectId = flushSync(() => {
                return todoService.addProject({ title: '' });
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
            },
          },
          {
            label: localize('create_popup.create_area', 'Create Area'),
            onSelect: () => {
              const areaId = flushSync(() => {
                return todoService.addArea({ title: '' });
              });

              if (areaId) {
                const areaUid = todoService.modelState.taskObjectMap.get(areaId)?.uid;
                if (areaUid) {
                  navigate(`/desktop/area/${areaUid}`, {
                    state: {
                      focusInput: areaPageTitleInputId(areaId),
                    },
                  });
                }
              }
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

  const futureProjects = getFutureProjects(todoService.modelState, getTodayTimestampInUtc());
  const sidebarProjectAreaListNoTopPadding =
    rootCollections.flattenedItems && rootCollections.flattenedItems[0]?.type === 'header';

  return (
    <div
      className={classNames(desktopStyles.sidebarBackground, desktopStyles.sidebarContainerStyle, {
        [desktopStyles.sidebarContainerNoPaddingTop]: sidebarContainerNoPaddingTop,
      })}
    >
      <DragHandle></DragHandle>
      <SidebarMenu />
      <div
        className={classNames(desktopStyles.SidebarProjectAreaList, {
          [desktopStyles.SidebarProjectAreaListNoTopPadding]: sidebarProjectAreaListNoTopPadding,
        })}
      >
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
      <div className={desktopStyles.SidebarActionsContainer}>
        <button onClick={handleCreateMenu} className={desktopStyles.SidebarCreateButton}>
          <PlusIcon className={desktopStyles.SidebarCreateButtonIcon} />
          <span>{localize('sidebar.create_menu', 'Create New')}</span>
        </button>

        <Link to="/desktop/settings" className={desktopStyles.SidebarSettingsButton}>
          <SettingsIcon className={desktopStyles.SidebarSettingsButtonIcon} />
        </Link>

        {selfhostedSyncService.showSyncIcon && (
          <button onClick={handleSync} className={desktopStyles.SidebarSettingsButton}>
            <SyncIcon
              className={`${desktopStyles.SidebarSettingsButtonIcon} ${selfhostedSyncService.syncing ? 'animate-spin' : ''}`}
            />
          </button>
        )}
      </div>
    </div>
  );
};
