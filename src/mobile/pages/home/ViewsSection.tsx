import { ViewIcon } from '@/components/icons';
import { getAllViews } from '@/core/state/views/getAllViews';
import { useService } from '@/hooks/use-service';
import { useDragSensors } from '@/hooks/useDragSensors';
import { useWatchEvent } from '@/hooks/use-watch-event';
import useNavigate from '@/hooks/useNavigate';
import { DragItem } from '@/mobile/components/dnd/DragItem';
import { computeSectionRounding } from '@/mobile/components/dnd/projectedRounding';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { closestCenter, DndContext, DragEndEvent, DragOverlay, useDndContext } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React from 'react';

const ViewItemContent: React.FC<{ name: string }> = ({ name }) => (
  <React.Fragment>
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
  </React.Fragment>
);

const HomePageViewItem: React.FC<{ uid: string; name: string; className?: string }> = ({ uid, name, className }) => {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: uid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (isDragging) {
    return <DragItem ref={setNodeRef} attributes={attributes} listeners={listeners} style={style} />;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={classNames(styles.homeProjectItemRoot, className)}
      onClick={() => navigate({ path: `/views/${uid}` })}
    >
      <ViewItemContent name={name} />
    </div>
  );
};

const ViewsDragOverlay: React.FC<{ views: { uid: string; name: string }[] }> = ({ views }) => {
  const { active } = useDndContext();
  const activeView = active ? views.find((view) => view.uid === active.id) : undefined;
  return (
    <DragOverlay>
      {activeView ? (
        <div
          className={classNames(
            styles.taskItemOverlayBackground,
            styles.taskItemOverlayShadow,
            styles.taskItemOverlayRound,
            styles.homeProjectItemRoot
          )}
        >
          <ViewItemContent name={activeView.name} />
        </div>
      ) : null}
    </DragOverlay>
  );
};

const ViewsList: React.FC<{ views: { uid: string; name: string }[] }> = ({ views }) => {
  const { active, over } = useDndContext();
  const rounding = computeSectionRounding(
    views.map((view) => view.uid),
    active?.id as string | undefined,
    over?.id as string | undefined
  );

  return (
    <React.Fragment>
      {views.map((view) => (
        <HomePageViewItem
          key={view.uid}
          uid={view.uid}
          name={view.name}
          className={classNames(styles.taskItemGroupBackground, {
            [styles.taskItemGroupTopRound]: rounding.top.has(view.uid),
            [styles.taskItemGroupBottomRound]: rounding.bottom.has(view.uid),
          })}
        />
      ))}
    </React.Fragment>
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
      <div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={views.map((v) => v.uid)} strategy={verticalListSortingStrategy}>
            <ViewsDragOverlay views={views} />
            <ViewsList views={views} />
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
