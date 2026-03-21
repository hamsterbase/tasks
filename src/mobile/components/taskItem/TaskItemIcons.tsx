import { NavIcon, NotesIcon, SubtaskIcon, TagIcon } from '@/components/icons';
import React from 'react';

interface TaskItemIconsProps {
  tags?: string[];
  notes?: string;
  subtasks?: unknown[];
  navIcon?: boolean;
}

const META_ICON_CLASS = 'size-3.5 text-t3 flex-shrink-0';
const NAV_ICON_CLASS = 'size-4 text-t3 flex-shrink-0';

export const TaskItemIcons: React.FC<TaskItemIconsProps> = ({ tags, notes, subtasks, navIcon }) => (
  <React.Fragment>
    {notes && <NotesIcon className={META_ICON_CLASS} strokeWidth={1.5} />}
    {subtasks && subtasks.length > 0 && <SubtaskIcon className={META_ICON_CLASS} strokeWidth={1.5} />}
    {tags && tags.length > 0 && <TagIcon className={META_ICON_CLASS} strokeWidth={1.5} />}
    {navIcon && <NavIcon className={NAV_ICON_CLASS} strokeWidth={1.5} />}
  </React.Fragment>
);
