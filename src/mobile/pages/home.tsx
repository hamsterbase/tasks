import { getTodayTimestampInUtc } from '@/base/common/time.ts';
import { AreaIcon, HomeIcon, SettingsIcon } from '@/components/icons';
import { flattenRootCollections } from '@/core/state/home/getFlattenRootCollections.ts';
import { getRootCollectionsState } from '@/core/state/home/getRootCollectionsState.ts';
import { FlattenedResult } from '@/core/state/home/flattenedItemsToResult.ts';
import { AreaInfoState, ProjectInfoState } from '@/core/state/type.ts';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useConfig } from '@/hooks/useConfig.ts';
import { useDragSensors } from '@/hooks/useDragSensors.ts';
import useNavigate from '@/hooks/useNavigate.ts';
import { useScrollPosition } from '@/hooks/useScrollPosition.ts';
import { FutureProjects } from '@/mobile/components/dnd/futureProjects.tsx';
import { HomeProjectItem } from '@/mobile/components/todo/HomeProjectItem.tsx';
import { localize } from '@/nls.ts';
import { toggleAreaConfigKey } from '@/services/config/config.ts';
import { INavigationService } from '@/services/navigationService/common/navigationService.ts';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import { DragDropElements } from '@/utils/dnd/dragDropCollision.ts';
import { getFlattenedItemsCollisionDetectionStrategy } from '@/utils/dnd/flattenedItemsCollisionDetectionStrategy.ts';
import { getFlattenedItemsDragEndPosition } from '@/utils/dnd/flattenedItemsDragPosition.ts';
import { DragEndEvent, useDndContext } from '@dnd-kit/core';
import classNames from 'classnames';
import React from 'react';
import { InboxDropZone } from '../components/dnd/InboxDropZone.tsx';
import { LastPlacement } from '../components/dnd/lastPlacement.tsx';
import { PageLayout } from '../components/PageLayout.tsx';
import { ProjectStatusBox } from '../components/taskItem/ProjectStatusBox.tsx';
import { TaskStatusBox } from '../components/taskItem/TaskStatusBox.tsx';
import { AreaHeader } from '../components/todo/AreaHeader.tsx';
import { usePopupAction } from '../overlay/popupAction/usePopupAction.ts';
import { styles } from '../theme.ts';
import { MobileHomeTopMenu } from './home/TopMenu';

interface HomeProjectAndAreaProps {
  flattenedResult: FlattenedResult<AreaInfoState, ProjectInfoState>;
  unstartedProjects: ProjectInfoState[];
}

const HomeProjectAndArea: React.FC<HomeProjectAndAreaProps> = ({ flattenedResult, unstartedProjects }) => {
  const { active } = useDndContext();
  return (
    <React.Fragment>
      <div>
        {flattenedResult.flattenedItems.slice(0, -2).map((item) => {
          if (item.type === 'special') {
            if (item.id === DragDropElements.futureProjects) {
              return (
                <FutureProjects
                  key={item.id}
                  unstartedProjects={unstartedProjects}
                  className={classNames(styles.taskItemGroupBackground, {
                    [styles.taskItemGroupTopRound]: flattenedResult.borderTop(item.id),
                    [styles.taskItemGroupBottomRound]: flattenedResult.borderBottom(item.id),
                  })}
                />
              );
            }
            return null;
          }
          if (item.type === 'header') {
            return (
              <AreaHeader
                key={item.content.id}
                areaInfo={item.content}
                className={classNames(styles.taskItemGroupBackground, {
                  [styles.taskItemGroupTopRound]: flattenedResult.borderTop(item.id),
                  [styles.taskItemGroupBottomRound]: flattenedResult.borderBottom(item.id),
                })}
              />
            );
          } else {
            if (active?.id && active.id === item.headerId) {
              return null;
            }
            return (
              <HomeProjectItem
                key={item.content.id}
                projectInfo={item.content}
                hideStartDate={true}
                hideNavIcon={true}
                hideSubtitle
                className={classNames(styles.taskItemGroupBackground, {
                  [styles.taskItemGroupTopRound]: flattenedResult.borderTop(item.id),
                  [styles.taskItemGroupBottomRound]: flattenedResult.borderBottom(item.id),
                })}
              />
            );
          }
        })}
      </div>
      <LastPlacement />
    </React.Fragment>
  );
};

export const MobileHome = () => {
  const navigationService = useService(INavigationService);
  const popupAction = usePopupAction();
  const todoService = useService(ITodoService);
  const navigate = useNavigate();
  useWatchEvent(todoService.onStateChange);
  const { futureProjects: unstartedProjects } = getRootCollectionsState(
    todoService.modelState,
    getTodayTimestampInUtc()
  );
  const { value: config, setValue } = useConfig(toggleAreaConfigKey());
  const flattenedItemsResult = flattenRootCollections(todoService.modelState, {
    currentDate: getTodayTimestampInUtc(),
    colspanAreaList: config,
  });
  const sensors = useDragSensors();
  useScrollPosition('homeScrollPosition');

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return null;
    const overId = over.id as string;
    const activeId = active.id as string;
    if (overId === DragDropElements.inbox) {
      navigationService.navigate({ path: '/create_task' });
      return;
    }
    const res = getFlattenedItemsDragEndPosition(activeId, overId, flattenedItemsResult);
    if (res) {
      if (res.type === 'createItem') {
        const id = todoService.addProject({
          title: '',
          position: res.position,
        });
        const position = res.position;
        if (position.type === 'firstElement' && position.parentId) {
          if (config.includes(position.parentId)) {
            setValue(config.filter((id) => id !== position.parentId));
          }
        }
        setTimeout(() => {
          todoService.editItem(id);
        }, 50);
      }
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

  return (
    <PageLayout
      header={{
        renderIcon: (className: string) => <HomeIcon className={className} />,
        title: localize('home.title', 'Home'),
      }}
      bottomMenu={{
        left: {
          icon: <HomeIcon className="w-6 h-6" />,
          status: 'active',
        },
        right: {
          icon: <SettingsIcon className="w-6 h-6" data-testid="settings-icon" />,
          status: 'inactive',
          onClick: () => {
            navigate({ path: '/settings', replace: true });
          },
        },
        mid: {
          onClick: () => {
            popupAction({
              items: [
                {
                  icon: <TaskStatusBox status={'completed'} />,
                  name: localize('create_popup.create_task', 'Create Task'),
                  onClick: () => {
                    navigationService.navigate({ path: '/create_task' });
                  },
                },
                {
                  icon: <ProjectStatusBox progress={0.6} status={'created'} />,
                  name: localize('create_popup.create_project', 'Create Project'),
                  onClick: () => {
                    const id = todoService.addProject({ title: '' });
                    todoService.editItem(id);
                  },
                },
                {
                  icon: <AreaIcon />,
                  name: localize('create_popup.create_area', 'Create Area'),
                  onClick: () => {
                    const id = todoService.addArea({ title: '' });
                    todoService.editItem(id);
                  },
                },
              ],
            });
          },
        },
      }}
      meta={<MobileHomeTopMenu></MobileHomeTopMenu>}
      dragOption={{
        sortable: {
          items: flattenedItemsResult.flattenedItems.map((item): string => item.id),
        },
        overlayItem: {
          projectProps: { hideStartDate: true, hideNavIcon: true, hideSubtitle: true },
        },
        sensors,
        collisionDetection: getFlattenedItemsCollisionDetectionStrategy(flattenedItemsResult),
        onDragEnd: handleDragEnd,
      }}
    >
      <HomeProjectAndArea
        flattenedResult={flattenedItemsResult}
        unstartedProjects={unstartedProjects}
      ></HomeProjectAndArea>
      <InboxDropZone />
    </PageLayout>
  );
};
