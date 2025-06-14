import { NavIcon, NoteIcon, SubtaskIcon, TagIcon } from '@/components/icons';
import React from 'react';

export const TaskItemIcons: React.FC<{
  tags?: string[];
  notes?: string;
  subtasks?: unknown[];
  navIcon?: boolean;
}> = ({ tags, notes, subtasks, navIcon }) => {
  return (
    <React.Fragment>
      {notes && <NoteIcon className="size-3 text-t3 flex-shrink-0" />}
      {subtasks && subtasks.length > 0 && <SubtaskIcon className="size-3 text-t3 flex-shrink-0" />}
      {tags && tags.length > 0 && <TagIcon className="size-3 text-t3 flex-shrink-0" />}
      {navIcon && <NavIcon className="size-3 text-t3 flex-shrink-0" />}
    </React.Fragment>
  );
};
