import { AreaExpandedIcon, AreaIcon } from '@/components/icons';
import { AreaInfoState } from '@/core/state/type';
import { useConfig } from '@/hooks/useConfig';
import { localize } from '@/nls';
import { toggleAreaConfigKey } from '@/services/config/config';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React from 'react';
import { Link, useLocation } from 'react-router';
import { desktopStyles } from '../../theme/main';

interface SidebarAreaItemProps {
  areaInfo: AreaInfoState;
}

export const SidebarAreaItem: React.FC<SidebarAreaItemProps> = ({ areaInfo }) => {
  const { value: config, setValue: setConfig } = useConfig(toggleAreaConfigKey());
  const location = useLocation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: areaInfo.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    pointerEvents: (isDragging ? 'none' : 'auto') as React.CSSProperties['pointerEvents'],
  };

  const isExpanded = !config.includes(areaInfo.id);
  const isActive = location.pathname === `/desktop/area/${areaInfo.uid}`;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (config.includes(areaInfo.id)) {
      setConfig(config.filter((item: string) => item !== areaInfo.id));
    } else {
      setConfig([...config, areaInfo.id]);
    }
  };

  if (isDragging) {
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="pt-4">
        <div className={classNames(desktopStyles.sidebarItemContainerStyle, 'bg-bg1 shadow-md')}>
          <div
            className={classNames(
              desktopStyles.sidebarItemHeight,
              desktopStyles.sidebarItemTextStyle,
              'flex items-center gap-2'
            )}
          >
            <div className={desktopStyles.sidebarIconSize}>
              <AreaIcon />
            </div>
            <span className={classNames({ 'text-t3': !areaInfo.title })}>
              {areaInfo.title || localize('area.untitled', 'New Area')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="pt-4">
        <Link
          to={`/desktop/area/${areaInfo.uid}`}
          className={classNames(desktopStyles.sidebarItemContainerStyle, {
            [desktopStyles.sidebarLinkActive]: isActive,
            [desktopStyles.sidebarLinkInactive]: !isActive,
          })}
        >
          <div
            className={classNames(
              desktopStyles.sidebarItemHeight,
              desktopStyles.sidebarItemTextStyle,
              'flex items-center gap-2'
            )}
          >
            <div
              className={classNames(desktopStyles.sidebarIconSize, {
                'text-white': isActive,
                'text-t1': !isActive && areaInfo.title,
                'text-t3': !isActive && !areaInfo.title,
              })}
            >
              <AreaIcon />
            </div>
            <span className={classNames('flex-1 truncate', { 'text-t3': !areaInfo.title })}>
              {areaInfo.title || localize('area.untitled', 'New Area')}
            </span>
            <button
              onClick={handleToggle}
              onPointerDown={(e) => e.stopPropagation()}
              className="flex-shrink-0 p-1 hover:bg-bg2 rounded transition-colors"
            >
              <AreaExpandedIcon
                className={classNames('size-3 text-t3 transition-transform', isExpanded ? 'rotate-90' : '')}
              />
            </button>
          </div>
        </Link>
      </div>
    </div>
  );
};
