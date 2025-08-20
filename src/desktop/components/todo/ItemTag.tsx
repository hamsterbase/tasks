import {
  AreaIcon,
  CalendarCheckIcon,
  CalendarRangeIcon,
  CalendarXIcon,
  DueIcon,
  SubtaskIcon,
  TagIcon,
} from '@/components/icons';
import { ProjectStatusBox } from '@/components/icons/ProjectStatusBox';
import { ItemStatus } from '@/core/type';
import { desktopStyles } from '@/desktop/theme/main';
import classNames from 'classnames';
import React from 'react';

export interface ItemTagProps {
  icon?: {
    type: string;
    props?: Record<string, unknown>;
  };
  label: string;
  isSelected?: boolean;
}

export const ItemTag: React.FC<ItemTagProps> = ({ icon, label, isSelected }) => {
  const renderIcon = () => {
    if (!icon) return null;

    switch (icon.type) {
      case 'AreaIcon':
        return <AreaIcon />;

      case 'ProjectStatusBox':
        return (
          <ProjectStatusBox
            progress={icon.props?.progress as number}
            status={icon.props?.status as ItemStatus}
            border={icon.props?.border as string}
            color="t3"
          />
        );
      case 'CalendarCheckIcon':
        return <CalendarCheckIcon />;
      case 'CalendarXIcon':
        return <CalendarXIcon />;
      case 'CalendarRangeIcon':
        return <CalendarRangeIcon />;
      case 'TagIcon':
        return <TagIcon />;
      case 'DueIcon':
        return <DueIcon />;
      case 'ChecklistIcon': {
        return <SubtaskIcon />;
      }
      default: {
        console.log(`Unknown icon type: ${icon.type}`);
        return null;
      }
    }
  };
  return (
    <div
      className={classNames(desktopStyles.ItemTagContainer, {
        [desktopStyles.ItemTagSelected]: isSelected,
        [desktopStyles.ItemTagUnselected]: !isSelected,
      })}
    >
      {icon && <span className={desktopStyles.ItemTagIcon}>{renderIcon()}</span>}
      <span className={desktopStyles.ItemTagLabel}>{label}</span>
    </div>
  );
};
