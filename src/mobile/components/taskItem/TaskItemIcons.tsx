import { NavIcon, NotesIcon, SubtaskIcon, TagIcon } from '@/components/icons';
import { ItemTone, itemToneClass } from '@/components/todo/itemStatusVisual';
import classNames from 'classnames';
import React from 'react';

interface TaskItemIconsProps {
  tags?: string[];
  notes?: string;
  subtasks?: unknown[];
  navIcon?: boolean;
  tone?: ItemTone;
}

const META_ICON_CLASS = 'size-3.5 flex-shrink-0';
const NAV_ICON_CLASS = 'size-4 flex-shrink-0';

export const TaskItemIcons: React.FC<TaskItemIconsProps> = ({ tags, notes, subtasks, navIcon, tone = 't2' }) => (
  <React.Fragment>
    {notes && <NotesIcon className={classNames(META_ICON_CLASS, itemToneClass(tone))} strokeWidth={1.5} />}
    {subtasks && subtasks.length > 0 && (
      <SubtaskIcon className={classNames(META_ICON_CLASS, itemToneClass(tone))} strokeWidth={1.5} />
    )}
    {tags && tags.length > 0 && (
      <TagIcon className={classNames(META_ICON_CLASS, itemToneClass(tone))} strokeWidth={1.5} />
    )}
    {navIcon && <NavIcon className={classNames(NAV_ICON_CLASS, itemToneClass(tone))} strokeWidth={1.5} />}
  </React.Fragment>
);
