import { useDesktopDndSensors } from '@/base/hooks/useDesktopDndSensors';
import { ITaskList } from '@/components/taskList/type.ts';
import { getProject } from '@/core/state/getProject';
import { FlattenedItem, FlattenedResult } from '@/core/state/home/flattenedItemsToResult.ts';
import { ProjectHeadingInfo, TaskInfo } from '@/core/state/type';
import { DragOverlayItem } from '@/desktop/components/drag/DragOverlayItem';
import { InboxTaskInput } from '@/desktop/components/inboxTaskInput/InboxTaskInput';
import { CreateTaskEvent } from '@/desktop/components/inboxTaskInput/InboxTaskInputController';
import { TaskListItem } from '@/desktop/components/taskListItem/TaskListItem';
import { DesktopHeadingListItem } from '@/desktop/components/desktopHeadingListItem/desktopHeadingListItem';
import { useService } from '@/hooks/use-service';
import { IListService } from '@/services/list/common/listService';
import { ITodoService } from '@/services/todo/common/todoService';
import { getFlattenedItemsCollisionDetectionStrategy } from '@/utils/dnd/flattenedItemsCollisionDetectionStrategy';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import classNames from 'classnames';
import type { TreeID } from 'loro-crdt';
import React, { useCallback } from 'react';

interface ProjectTaskListProps {
  items: FlattenedItem<ProjectHeadingInfo, TaskInfo>[];
  result: FlattenedResult<ProjectHeadingInfo, TaskInfo>;
  willDisappearObjectIdSet: Set<TreeID>;
  taskList: ITaskList;
}

const ProjectTaskList: React.FC<ProjectTaskListProps> = ({ items, result, willDisappearObjectIdSet, taskList }) => {
  return (
    <>
      {items.map((item) => {
        if (item.type === 'header') {
          return (
            <DesktopHeadingListItem
              key={item.id}
              projectHeadingInfo={item.content}
              className={classNames({
                'rounded-t-md': result.borderTop(item.id),
                'rounded-b-md': result.borderBottom(item.id),
              })}
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

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4">
        <InboxTaskInput onCreateTask={handleCreateTask} />
      </div>
      <div className="p-4 outline-none" tabIndex={1} onFocus={setFocus} onBlur={clearFocus}>
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
