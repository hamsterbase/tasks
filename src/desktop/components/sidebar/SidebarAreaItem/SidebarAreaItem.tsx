import { AreaExpandedIcon, AreaIcon } from '@/components/icons';
import { AreaInfoState } from '@/core/state/type';
import { desktopStyles } from '@/desktop/theme/main';
import { useConfig } from '@/hooks/useConfig';
import { localize } from '@/nls';
import { toggleAreaConfigKey } from '@/services/config/config';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React from 'react';
import { Link, useLocation } from 'react-router';

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

  const handleAreaClick = (e: React.MouseEvent) => {
    if (isActive) {
      handleToggle(e);
    }
  };

  const sidebarAreaClass = classNames(desktopStyles.SidebarMenuItem, {
    [desktopStyles.SidebarMenuItemActive]: isActive,
    [desktopStyles.SidebarMenuItemInactive]: !isActive,
  });

  const areaExpandedIconClass = classNames(desktopStyles.SidebarAreaToggleButton, {
    [desktopStyles.SidebarAreaToggleButtonActive]: isActive,
    [desktopStyles.SidebarAreaToggleButtonInactive]: !isActive,
    ['rotate-90']: isExpanded,
  });

  return (
    <div className={desktopStyles.SidebarAreaGap} onClick={handleAreaClick}>
      <Link
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        to={`/desktop/area/${areaInfo.uid}`}
        className={classNames(sidebarAreaClass)}
      >
        <div className={classNames(desktopStyles.SidebarMenuItemIcon)}>
          <AreaIcon />
        </div>
        <span className={classNames(desktopStyles.SidebarMenuItemLabel)}>
          {areaInfo.title || localize('area.untitled', 'New Area')}
        </span>
        <button onClick={handleToggle} onPointerDown={(e) => e.stopPropagation()} className={areaExpandedIconClass}>
          <AreaExpandedIcon />
        </button>
      </Link>
    </div>
  );
};
