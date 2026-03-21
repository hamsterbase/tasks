import { ItemStatus } from '@/core/type';
import React from 'react';

interface TaskItemTitleAndSubtitleProps {
  title: React.ReactNode;
  titleMeta?: React.ReactNode;
  subtitle?: React.ReactNode;
  hideSubtitle?: boolean;
  dueDate?: React.ReactNode;
  status?: ItemStatus;
}

export const TaskItemTitleAndSubtitle: React.FC<TaskItemTitleAndSubtitleProps> = ({
  title,
  titleMeta,
  subtitle,
  hideSubtitle,
  dueDate,
  status,
}) => {
  const hasValidChildren = React.isValidElement(subtitle);
  return (
    <div className="flex-1 min-w-0 flex flex-col gap-1">
      <div className="flex-1 min-w-0 flex items-center">
        <div className="flex flex-1 min-w-0 items-center gap-2">
          <div className="flex flex-1 min-w-0 items-center gap-2 overflow-hidden">
            {title}
            {titleMeta && <div className="flex shrink-0 items-center gap-1 text-t3">{titleMeta}</div>}
          </div>
          {dueDate && status === 'created' && <div className="shrink-0">{dueDate}</div>}
        </div>
      </div>
      {!hideSubtitle && subtitle && hasValidChildren && <div className="flex-1 min-w-0">{subtitle}</div>}
    </div>
  );
};
