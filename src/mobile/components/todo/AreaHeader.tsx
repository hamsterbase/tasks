import { AreaExpandedIcon, AreaIcon } from '@/components/icons';
import { AreaInfoState } from '@/core/state/type';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useCancelEdit } from '@/hooks/useCancelEdit';
import { useConfig } from '@/hooks/useConfig';
import { useEdit } from '@/hooks/useEdit';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import { toggleAreaConfigKey } from '@/services/config/config';
import { ITodoService } from '@/services/todo/common/todoService';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React from 'react';
import { DragItem } from '../dnd/DragItem';
import useNavigate from '@/hooks/useNavigate';

interface AreaHeaderProps {
  areaInfo: AreaInfoState;
  className?: string;
}

export const AreaHeader: React.FC<AreaHeaderProps> = ({ areaInfo, className }) => {
  const { value: config, setValue: setConfig } = useConfig(toggleAreaConfigKey());
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, node } = useSortable({
    id: areaInfo.id,
  });
  const { itemClassName, shouldIgnoreClick, isEditing, endEditing } = useCancelEdit(node, areaInfo.id);
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const { textAreaProps } = useEdit({
    isEditing,
    title: areaInfo.title,
    onSave: (title: string) => {
      todoService.updateArea(areaInfo.id, { title });
    },
    onConfirm: endEditing,
    singleLine: true,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const navigate = useNavigate();
  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (shouldIgnoreClick(e)) {
      return;
    }
    if (isDragging) return;
    navigate({ path: `/area/${areaInfo.uid}` });
  };
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (config.includes(areaInfo.id)) {
      setConfig(config.filter((item: string) => item !== areaInfo.id));
    } else {
      setConfig([...config, areaInfo.id]);
    }
  };

  const isExpanded = !config.includes(areaInfo.id);
  if (isDragging) {
    return <DragItem ref={setNodeRef} attributes={attributes} listeners={listeners} style={style} />;
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={styles.taskItemGroupHeaderPadding}>
      <div
        onClick={handleClick}
        className={classNames(styles.areaHeaderRoot, styles.listItemRound, itemClassName, className, {
          [styles.taskItemEditingShadow]: isEditing,
          [styles.taskItemEditingRound]: isEditing,
        })}
      >
        <span className={styles.areaHeaderIconContainer}>
          <AreaIcon className={styles.areaHeaderIconSize} strokeWidth={1.5} />
        </span>
        <div className={styles.areaHeaderTitle}>
          {isEditing ? (
            <input {...textAreaProps} className={styles.areaHeaderEditingInput} />
          ) : (
            <span
              className={classNames(
                styles.homeProjectItemTitle,
                areaInfo.title ? styles.homeProjectItemTitleNormal : styles.homeProjectItemTitlePlaceholder
              )}
            >
              {areaInfo.title || localize('area.untitled', 'New Area')}
            </span>
          )}
        </div>
        <span onClick={handleToggle} className={classNames(styles.areaHeaderArrowContainer, { hidden: isEditing })}>
          <AreaExpandedIcon
            className={classNames(styles.areaHeaderArrowSize, 'transition-transform', isExpanded ? 'rotate-90' : '')}
            strokeWidth={1.5}
          />
        </span>
      </div>
    </div>
  );
};
