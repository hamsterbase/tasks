import { NotebookIcon, ScheduledIcon, TagIcon } from '@/components/icons';
import { ProjectInfoState } from '@/core/state/type';
import useProject from '@/mobile/hooks/useProject';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import classNames from 'classnames';
import Textarea from 'rc-textarea';
import React, { useEffect, useState } from 'react';
import { InfoItemGroup } from '@/mobile/components/InfoItem';
import { InfoItemTags } from '@/mobile/components/infoItem/tags';
import { StartDateInfoItem } from '@/mobile/components/infoItem/startDate';
import { DueDateInfoItem, DueDateInfoItemIcon } from '@/mobile/components/infoItem/dueDate';
import { MobileProjectCheckbox } from '@/mobile/components/icon/MobileProjectCheckbox';

const ProjectMeta: React.FC<{ project: ProjectInfoState }> = ({ project }) => {
  const {
    handleEditTag,
    handleEditStartDate,
    handleEditDueDate,
    handleClearStartDate,
    handleClearDueDate,
    handleUpdateNotes,
    handleUpdateTitle,
    handleToggleProjectStatus,
    handleLongPressStatusIcon,
  } = useProject(project);

  const [title, setTitle] = useState(project?.title);
  useEffect(() => {
    setTitle(project?.title);
  }, [project?.title]);

  const [notes, setNotes] = useState(project?.notes);
  useEffect(() => {
    setNotes(project?.notes);
  }, [project?.notes]);

  const projectDetailItems = [
    {
      itemKey: 'title',
      show: true,
      icon: (
        <MobileProjectCheckbox
          onLongPress={handleLongPressStatusIcon}
          progress={project.progress * 100}
          status={project.status}
          onClick={handleToggleProjectStatus}
        />
      ),
      content: (
        <Textarea
          className={classNames('leading-4 text-sm font-medium text-t1 bg-transparent flex-1 break-all', 'flex-1')}
          autoSize={{ minRows: 1 }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => handleUpdateTitle(title ?? '')}
        />
      ),
    },
    {
      itemKey: 'notes',
      show: true,
      icon: <NotebookIcon />,
      content: (
        <Textarea
          className={''}
          autoSize={{ minRows: 2 }}
          placeholder={localize('project.notes', 'Notes')}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => handleUpdateNotes(notes)}
        />
      ),
    },
    {
      itemKey: 'tags',
      show: project.tags && project.tags.length > 0,
      icon: <TagIcon />,
      content: <InfoItemTags tags={project.tags} />,
      onClick: handleEditTag,
    },
    {
      itemKey: 'startDate',
      show: !!project.startDate,
      icon: <ScheduledIcon />,
      content: <StartDateInfoItem startDate={project.startDate} />,
      onClick: handleEditStartDate,
      onClear: () => handleClearStartDate(),
    },
    {
      itemKey: 'dueDate',
      show: !!project.dueDate,
      icon: <DueDateInfoItemIcon dueDate={project.dueDate} />,
      content: <DueDateInfoItem dueDate={project.dueDate} />,
      onClick: handleEditDueDate,
      onClear: () => handleClearDueDate(),
    },
  ];

  return (
    <div className={classNames(styles.screenEdgePadding, 'flex flex-col gap-2')}>
      <InfoItemGroup items={projectDetailItems} className={'bg-bg1 p-1 rounded-lg'} />
    </div>
  );
};

export default ProjectMeta;
