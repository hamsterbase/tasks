import React from 'react';
interface TaskItemSubtitleProps {
  title?: string;
  hide?: boolean;
}

export const TaskItemSubtitle: React.FC<TaskItemSubtitleProps> = ({ title, hide = false }) => {
  if (hide || !title) {
    return null;
  }
  return <div className="text-sm text-t3 overflow-hidden text-ellipsis whitespace-nowrap">{title}</div>;
};
