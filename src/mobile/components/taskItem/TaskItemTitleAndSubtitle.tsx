import { ItemStatus } from '@/core/type';
import React from 'react';

interface TaskItemTitleAndSubtitleProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  hideSubtitle?: boolean;
  dueDate?: React.ReactNode;
  status?: ItemStatus;
}

export const TaskItemTitleAndSubtitle: React.FC<TaskItemTitleAndSubtitleProps> = ({
  title,
  subtitle,
  hideSubtitle,
  dueDate,
  status,
}) => {
  const hasValidChildren = React.isValidElement(subtitle);
  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <div className="flex-1 min-w-0 flex items-center">
        <div className="flex flex-1 min-w-0 items-center gap-2">
          <div className="flex-1 items-center gap-1 min-w-0 overflow-hidden flex">{title}</div>
          {dueDate && status === 'created' && <div className="shrink-0">{dueDate}</div>}
        </div>
      </div>
      {!hideSubtitle && subtitle && hasValidChildren && <div className="flex-1 min-w-0 mt-0.5">{subtitle}</div>}
    </div>
  );
};
