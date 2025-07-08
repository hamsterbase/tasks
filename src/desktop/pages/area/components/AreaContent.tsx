import { getAreaDetail } from '@/core/state/getArea';
import { ProjectInfoState, TaskInfo } from '@/core/state/type';
import { DesktopProjectList } from '@/desktop/components/DesktopProjectList/DesktopProjectList';
import { InboxTaskInput } from '@/desktop/components/inboxTaskInput/InboxTaskInput';
import { CreateTaskEvent } from '@/desktop/components/inboxTaskInput/InboxTaskInputController';
import { useService } from '@/hooks/use-service';
import { useArea } from '@/hooks/useArea';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import React from 'react';
import { TaskListSection } from './TaskListSection';

interface AreaContentProps {
  area: ReturnType<typeof getAreaDetail>;
  areaDetail: ReturnType<typeof useArea>['areaDetail'];
  projects: ProjectInfoState[];
  tasks: TaskInfo[];
  willDisappearObjectIdSet: Set<string>;
}

export const AreaContent: React.FC<AreaContentProps> = ({ area, projects, tasks, willDisappearObjectIdSet }) => {
  const todoService = useService(ITodoService);

  const handleCreateTask = (event: CreateTaskEvent) => {
    todoService.addTask({
      title: event.title,
      position: {
        type: 'firstElement',
        parentId: area.id,
      },
    });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto p-6 space-y-6">
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-t2 uppercase tracking-wide">
            {localize('area.projects', 'Projects')}
          </h2>
          <DesktopProjectList
            projects={projects}
            emptyStateLabel={localize('area.noProjects', 'No projects in this area')}
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-t2 uppercase tracking-wide">{localize('area.tasks', 'Tasks')}</h2>

          <InboxTaskInput onCreateTask={handleCreateTask} />
          <TaskListSection tasks={tasks} willDisappearObjectIdSet={willDisappearObjectIdSet} areaId={area.id} />
        </div>
      </div>
    </div>
  );
};
