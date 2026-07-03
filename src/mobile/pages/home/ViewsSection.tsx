import { ViewIcon } from '@/components/icons';
import { getAllViews } from '@/core/state/views/getAllViews';
import { useService } from '@/hooks/use-service';
import { useDragSensors } from '@/hooks/useDragSensors';
import { useWatchEvent } from '@/hooks/use-watch-event';
import useNavigate from '@/hooks/useNavigate';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React from 'react';

const HomePageViewItem: React.FC<{ uid: string; name: string }> = ({ uid, name }) => {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: uid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={styles.homeProjectItemRoot}
      onClick={() => navigate({ path: `/views/${uid}` })}
    >
      <div className={styles.homeProjectItemCheckboxContainer}>
        <ViewIcon className="size-5.5" strokeWidth={1.5} />
      </div>
      <div className={styles.homeProjectItemContent}>
        <div className={styles.homeProjectItemTitleRow}>
          <span
            className={classNames(
              styles.homeProjectItemTitle,
              name ? styles.homeProjectItemTitleNormal : styles.homeProjectItemTitlePlaceholder
            )}
          >
            {name || localize('view.detail.untitled', 'Untitled view')}
          </span>
        </div>
      </div>
    </div>
  );
};

export const MobileHomeViewsSection = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const sensors = useDragSensors();
  const views = getAllViews(todoService.modelState);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const toIndex = views.findIndex((v) => v.uid === over.id);
    if (toIndex === -1) return;
    todoService.moveView(active.id as string, toIndex);
  };

  if (views.length === 0) {
    return null;
  }

  return (
    <div className={classNames(styles.screenEdgePadding, 'mt-6')}>
      <div className={classNames(styles.areaDetailSectionHeader, styles.areaDetailSectionHeaderIndent)}>
        <span className={styles.areaDetailSectionTitle}>{localize('view.sidebar.title', 'Views')}</span>
      </div>
      <div className={styles.areaDetailSectionCard}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={views.map((v) => v.uid)} strategy={verticalListSortingStrategy}>
            {views.map((view) => (
              <HomePageViewItem key={view.uid} uid={view.uid} name={view.name} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
