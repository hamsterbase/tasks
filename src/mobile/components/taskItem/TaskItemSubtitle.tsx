import React from 'react';
import { ItemTone, itemToneClass } from '@/components/todo/itemStatusVisual';
import classNames from 'classnames';
interface TaskItemSubtitleProps {
  title?: string;
  hide?: boolean;
  tone?: ItemTone;
}

const DEFAULT_CLASS = 'text-xs font-medium overflow-hidden text-ellipsis whitespace-nowrap';

export const TaskItemSubtitle: React.FC<TaskItemSubtitleProps> = ({ title, hide = false, tone = 't2' }) => {
  if (hide || !title) {
    return null;
  }
  return <div className={classNames(DEFAULT_CLASS, itemToneClass(tone))}>{title}</div>;
};
