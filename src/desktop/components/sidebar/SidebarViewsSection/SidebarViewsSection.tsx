import { PlusIcon, ViewIcon } from '@/components/icons';
import { viewPageTitleInputId } from '@/components/edit/inputId';
import { getAllViews } from '@/core/state/views/getAllViews';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React from 'react';
import { flushSync } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router';

interface ViewRowProps {
  uid: string;
  name: string;
  active: boolean;
}

const ViewRow: React.FC<ViewRowProps> = ({ uid, name, active }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: uid });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    opacity: isDragging ? 0.6 : 1,
    pointerEvents: isDragging ? 'none' : 'auto',
  };
  return (
    <Link
      ref={setNodeRef}
      style={style}
      to={`/desktop/views/${uid}`}
      className={classNames(
        desktopStyles.SidebarMenuItem,
        active ? desktopStyles.SidebarViewsItemActive : desktopStyles.SidebarViewsItemInactive
      )}
      {...attributes}
      {...listeners}
    >
      <span className={desktopStyles.SidebarMenuItemIcon}>
        <ViewIcon className={desktopStyles.SidebarMenuItemIconSvg} />
      </span>
      <span className={desktopStyles.SidebarMenuItemLabel}>
        {name || localize('view.detail.untitled', 'Untitled view')}
      </span>
    </Link>
  );
};

export const SidebarViewsSection: React.FC = () => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const navigate = useNavigate();
  const location = useLocation();
  const views = getAllViews(todoService.modelState);
  // Activation distance keeps single clicks from triggering drag; a drag
  // requires moving the pointer beyond the threshold before navigation fires.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const toIndex = views.findIndex((v) => v.uid === over.id);
    if (toIndex < 0) return;
    todoService.moveView(active.id as string, toIndex);
  };

  const handleCreateView = () => {
    const uid = flushSync(() => todoService.addView({ name: '', rule: '' }));
    if (uid) {
      navigate(`/desktop/views/${uid}`, {
        state: { focusInput: viewPageTitleInputId(uid) },
      });
    }
  };

  return (
    <div className={desktopStyles.SidebarViewsContainer}>
      <div className={desktopStyles.SidebarViewsHeader}>
        <span className={desktopStyles.SidebarViewsHeaderLabel}>{localize('view.sidebar.title', 'Views')}</span>
        <button
          type="button"
          className={desktopStyles.SidebarViewsHeaderAddButton}
          onClick={handleCreateView}
          aria-label={localize('view.sidebar.add', 'Add view')}
        >
          <PlusIcon className={desktopStyles.SidebarViewsHeaderAddIcon} />
        </button>
      </div>
      {views.length === 0 ? (
        <div className={desktopStyles.SidebarViewsEmpty}>
          {localize('view.sidebar.empty', 'No views yet')}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={views.map((v) => v.uid)} strategy={verticalListSortingStrategy}>
            <div className={desktopStyles.SidebarMenuItemContainer}>
              {views.map((v) => (
                <ViewRow
                  key={v.uid}
                  uid={v.uid}
                  name={v.name}
                  active={location.pathname === `/desktop/views/${v.uid}`}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
