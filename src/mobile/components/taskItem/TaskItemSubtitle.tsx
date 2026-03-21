import React from 'react';
interface TaskItemSubtitleProps {
  title?: string;
  hide?: boolean;
}

const DEFAULT_CLASS = 'text-xs font-medium text-t3 overflow-hidden text-ellipsis whitespace-nowrap';

export const TaskItemSubtitle: React.FC<TaskItemSubtitleProps> = ({ title, hide = false }) => {
  if (hide || !title) {
    return null;
  }
  return <div className={DEFAULT_CLASS}>{title}</div>;
};
