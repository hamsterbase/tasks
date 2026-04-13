import {
  AreaIcon,
  CalendarIcon,
  CalendarCheckIcon,
  CalendarRangeIcon,
  CalendarXIcon,
  FlagIcon,
  SubtaskIcon,
  TagIcon,
} from '@/components/icons';
import { ItemStatus } from '@/core/type';
import { desktopStyles } from '@/desktop/theme/main';
import classNames from 'classnames';
import React from 'react';
import { ProjectIcon } from './ProjectIcon';

export interface ItemTagProps {
  icon?: {
    type: string;
    props?: Record<string, unknown>;
  };
  label: string;
  isSelected?: boolean;
}

export const ItemTag: React.FC<ItemTagProps> = ({ icon, label, isSelected }) => {
  const isDanger = icon?.type === 'DueIcon' && /\bago\b/i.test(label);

  const renderIcon = () => {
    if (!icon) return null;

    switch (icon.type) {
      case 'AreaIcon':
        return <AreaIcon />;

      case 'ProjectStatusBox':
        return (
          <ProjectIcon progress={icon.props?.progress as number} status={icon.props?.status as ItemStatus} size="xs" />
        );
      case 'CalendarCheckIcon':
        return <CalendarCheckIcon />;
      case 'CalendarXIcon':
        return <CalendarXIcon />;
      case 'CalendarIcon':
        return <CalendarIcon />;
      case 'CalendarRangeIcon':
        return <CalendarRangeIcon />;
      case 'TagIcon':
        return <TagIcon />;
      case 'DueIcon':
        return <FlagIcon />;
      case 'ChecklistIcon': {
        return <SubtaskIcon />;
      }
      default: {
        console.log(`Unknown icon type: ${icon.type}`);
        return null;
      }
    }
  };

  const iconNode = renderIcon();
  const sizedIconNode = React.isValidElement<{ className?: string }>(iconNode)
    ? React.cloneElement(iconNode, {
        className: classNames(desktopStyles.ItemTagIconSvg, iconNode.props.className),
      })
    : iconNode;

  return (
    <div
      className={classNames(desktopStyles.ItemTagContainer, {
        [desktopStyles.ItemTagSelected]: isSelected,
        [desktopStyles.ItemTagUnselected]: !isSelected,
        [desktopStyles.ItemTagDanger]: isDanger,
        [desktopStyles.ItemTagNormal]: !isDanger,
      })}
    >
      {icon && <span className={desktopStyles.ItemTagIcon}>{sizedIconNode}</span>}
      <span className={desktopStyles.ItemTagLabel}>{label}</span>
    </div>
  );
};
