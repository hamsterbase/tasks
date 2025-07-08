import { useDesktopDndSensors } from '@/base/hooks/useDesktopDndSensors';
import { ProjectInfoState } from '@/core/state/type';
import { calculateDragPosition } from '@/core/dnd/calculateDragPosition';
import { useService } from '@/hooks/use-service';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TreeID } from 'loro-crdt';
import React from 'react';
import { DragOverlayItem } from '../../../components/drag/DragOverlayItem';
import { EmptyState } from '../../../components/EmptyState';
import { DesktopProjectListItem } from '../../../components/todo/DesktopProjectListItem';

interface AreaProjectListProps {
  projects: ProjectInfoState[];
  emptyStateLabel?: string;
}

export const AreaProjectList: React.FC<AreaProjectListProps> = ({
  projects,
  emptyStateLabel = localize('area.noProjects', 'No projects in this area'),
}) => {
  const todoService = useService(ITodoService);
  const sensors = useDesktopDndSensors();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const position = calculateDragPosition(
      active.id as string,
      over.id as string,
      projects.map((p) => p.id)
    );
    if (position) {
      todoService.updateProject(active.id as TreeID, {
        position,
      });
    }
  };

  if (projects.length === 0) {
    return <EmptyState label={emptyStateLabel} />;
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {projects.map((project) => (
            <DesktopProjectListItem key={project.id} project={project} />
          ))}
        </div>
      </SortableContext>
      <DragOverlayItem />
    </DndContext>
  );
};
