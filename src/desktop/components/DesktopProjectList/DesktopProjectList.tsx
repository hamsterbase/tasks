import { useDesktopDndSensors } from '@/base/hooks/useDesktopDndSensors';
import { calculateDragPosition } from '@/core/dnd/calculateDragPosition';
import { ProjectInfoState } from '@/core/state/type';
import { useService } from '@/hooks/use-service';
import { ITodoService } from '@/services/todo/common/todoService';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TreeID } from 'loro-crdt';
import React from 'react';
import { DragOverlayItem } from '../drag/DragOverlayItem';
import { EmptyState } from '../EmptyState';
import { DesktopProjectListItem } from '../todo/DesktopProjectListItem';

interface DesktopProjectListProps {
  projects: ProjectInfoState[];
  emptyStateLabel: string;
  useDateAssignedMove?: boolean;
  hideProjectTitle?: boolean;
}

export const DesktopProjectList: React.FC<DesktopProjectListProps> = ({
  projects,
  emptyStateLabel,
  hideProjectTitle,
  useDateAssignedMove = false,
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
      if (useDateAssignedMove) {
        todoService.moveDateAssignedList(active.id as TreeID, position);
      } else {
        todoService.updateProject(active.id as TreeID, {
          position,
        });
      }
    }
  };

  if (projects.length === 0) {
    return <EmptyState label={emptyStateLabel} />;
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        {projects.map((project) => (
          <DesktopProjectListItem hideProjectTitle={hideProjectTitle} key={project.id} project={project} />
        ))}
      </SortableContext>
      <DragOverlayItem projectVariant="desktop" />
    </DndContext>
  );
};
