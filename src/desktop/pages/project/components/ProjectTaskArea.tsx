import { useDesktopDndSensors } from '@/base/hooks/useDesktopDndSensors';
import { HeadingIcon } from '@/components/icons';
import { ITaskList } from '@/components/taskList/type.ts';
import { getProject } from '@/core/state/getProject';
import { FlattenedItem, FlattenedResult } from '@/core/state/home/flattenedItemsToResult.ts';
import { ProjectHeadingInfo, TaskInfo } from '@/core/state/type';
import { DesktopHeadingListItem } from '@/desktop/components/desktopHeadingListItem/desktopHeadingListItem';
import { DragOverlayItem } from '@/desktop/components/drag/DragOverlayItem';
import { InboxTaskInput } from '@/desktop/components/inboxTaskInput/InboxTaskInput';
import { CreateTaskEvent } from '@/desktop/components/inboxTaskInput/InboxTaskInputController';
import { TaskListItem } from '@/desktop/components/todo/TaskListItem';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { IListService } from '@/services/list/common/listService';
import { ITodoService } from '@/services/todo/common/todoService';
import { getFlattenedItemsCollisionDetectionStrategy } from '@/utils/dnd/flattenedItemsCollisionDetectionStrategy';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { TreeID } from 'loro-crdt';
import React, { useCallback } from 'react';
import { flushSync } from 'react-dom';

interface ProjectTaskListProps {
  items: FlattenedItem<ProjectHeadingInfo, TaskInfo>[];
  result: FlattenedResult<ProjectHeadingInfo, TaskInfo>;
  willDisappearObjectIdSet: Set<TreeID>;
  taskList: ITaskList;
}

const ProjectTaskList: React.FC<ProjectTaskListProps> = ({ items, willDisappearObjectIdSet, taskList }) => {
  return (
    <>
      {items.map((item, index) => {
        if (item.type === 'header') {
          return (
            <DesktopHeadingListItem
              key={item.id}
              hideDividers={index === 0}
              projectHeadingInfo={item.content}
              taskList={taskList}
            />
          );
        }
        if (item.type === 'item') {
          return (
            <TaskListItem
              key={item.id}
              hideProjectTitle={true}
              task={item.content}
              willDisappear={willDisappearObjectIdSet.has(item.id)}
              taskList={taskList}
            />
          );
        }
        return null;
      })}
    </>
  );
};

interface ProjectTaskAreaProps {
  project: ReturnType<typeof getProject>;
  flattenedItems: FlattenedItem<ProjectHeadingInfo, TaskInfo>[];
  flattenedItemsResult: FlattenedResult<ProjectHeadingInfo, TaskInfo>;
  willDisappearObjectIdSet: Set<TreeID>;
  taskList: ITaskList;
  onDragEnd: (event: DragEndEvent) => void;
}

export const ProjectTaskArea: React.FC<ProjectTaskAreaProps> = ({
  project,
  flattenedItems,
  flattenedItemsResult,
  willDisappearObjectIdSet,
  taskList,
  onDragEnd,
}) => {
  const todoService = useService(ITodoService);
  const listService = useService(IListService);
  const sensors = useDesktopDndSensors();

  const setFocus = useCallback(() => {
    listService.mainList?.setFocus(true);
  }, [listService]);

  const clearFocus = useCallback(() => {
    listService.mainList?.setFocus(false);
  }, [listService]);

  const handleCreateTask = (event: CreateTaskEvent) => {
    todoService.addTask({
      title: event.title,
      position: {
        type: 'firstElement',
        parentId: project.id,
      },
    });
  };

  const handleAddHeading = () => {
    const headingId = flushSync(() => {
      return todoService.addProjectHeading({
        title: '',
        position: {
          type: 'firstElement',
          parentId: project.id,
        },
      });
    });

    if (headingId) {
      listService.mainList?.select(headingId, {
        multipleMode: false,
        offset: 0,
        fireEditEvent: true,
      });
    }
  };

  return (
    <div className={desktopStyles.ProjectTaskAreaContainer}>
      <div className={desktopStyles.InboxAreaContainer}>
        <div className={desktopStyles.InboxAreaInputWrapper}>
          <InboxTaskInput onCreateTask={handleCreateTask} />
        </div>
        <div className={desktopStyles.InboxAreaHeadingButton} onClick={handleAddHeading}>
          <HeadingIcon className={desktopStyles.InboxAreaHeadingIcon} />
          <div className={desktopStyles.InboxAreaHeadingBadge}>
            <span className={desktopStyles.InboxAreaHeadingBadgeIcon}>+</span>
          </div>
        </div>
      </div>
      <div tabIndex={1} onFocus={setFocus} onBlur={clearFocus}>
        <DndContext
          sensors={sensors}
          collisionDetection={getFlattenedItemsCollisionDetectionStrategy(flattenedItemsResult)}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={flattenedItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <ProjectTaskList
              items={flattenedItems}
              result={flattenedItemsResult}
              willDisappearObjectIdSet={willDisappearObjectIdSet}
              taskList={taskList}
            />
          </SortableContext>
          <DragOverlayItem taskProps={{ hideProjectTitle: true }} />
        </DndContext>
      </div>
    </div>
  );
};
