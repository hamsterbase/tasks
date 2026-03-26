import { CalendarIcon, FlagIcon, NotesIcon, TagIcon } from '@/components/icons';
import { ProjectInfoState } from '@/core/state/type';
import { getDateFromUTCTimeStamp } from '@/core/time/getDateFromUTCTimeStamp';
import { getDateFnsLocale } from '@/locales/common/locale';
import useProject from '@/mobile/hooks/useProject';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import classNames from 'classnames';
import { format } from 'date-fns';
import Textarea from 'rc-textarea';
import React, { useEffect, useState } from 'react';
import { AttrContainer, AttrStyleContext, AttrStyles } from '@/mobile/components/attr/AttrContainer';
import { AttrLabel } from '@/mobile/components/attr/AttrLabel';
import { AttrTags } from '@/mobile/components/attr/AttrTags';
import { MobileProjectCheckbox } from '@/mobile/components/icon/MobileProjectCheckbox';

const projectInfoAttrStyles: AttrStyles = {
  row: styles.projectInfoAttrRow,
  iconContainer: styles.projectInfoAttrIconContainer,
  content: styles.projectInfoAttrContent,
  labelTitleColor: 'text-t2',
};

function formatDateLabel(timestamp: number): string {
  const date = getDateFromUTCTimeStamp(timestamp);
  return format(date, 'MMM d', { locale: getDateFnsLocale() });
}

const ProjectMeta: React.FC<{ project: ProjectInfoState }> = ({ project }) => {
  const {
    handleEditTag,
    handleEditStartDate,
    handleEditDueDate,
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

  return (
    <div className={classNames(styles.screenEdgePadding, 'flex flex-col gap-2')}>
      <div className={styles.projectInfoRoot}>
        <div className={styles.projectInfoLogoContainer}>
          <MobileProjectCheckbox
            size="large"
            onLongPress={handleLongPressStatusIcon}
            progress={project.progress * 100}
            status={project.status}
            onClick={handleToggleProjectStatus}
          />
        </div>
        <div className={styles.projectInfoContent}>
          <Textarea
            className={styles.projectInfoTitle}
            autoSize={{ minRows: 1 }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => handleUpdateTitle(title ?? '')}
            style={{ border: 'none', padding: 0 }}
          />
          <AttrStyleContext.Provider value={projectInfoAttrStyles}>
            {project.startDate && (
              <AttrLabel
                icon={<CalendarIcon className={styles.projectInfoMetaIcon} strokeWidth={1.5} />}
                placeholder=""
                value={{ title: formatDateLabel(project.startDate) }}
                onClick={handleEditStartDate}
              />
            )}
            {project.dueDate && (
              <AttrLabel
                icon={<FlagIcon className={styles.projectInfoMetaIcon} strokeWidth={1.5} />}
                placeholder=""
                value={{ title: formatDateLabel(project.dueDate), titleType: 'danger' }}
                onClick={handleEditDueDate}
              />
            )}
            {project.tags && project.tags.length > 0 && (
              <AttrTags
                icon={<TagIcon className={styles.projectInfoMetaIcon} strokeWidth={1.5} />}
                placeholder=""
                tags={project.tags}
                onClick={handleEditTag}
              />
            )}
            <AttrContainer icon={<NotesIcon className={styles.projectInfoMetaIcon} strokeWidth={1.5} />}>
              <Textarea
                autoSize={{ minRows: 2 }}
                placeholder={localize('project.notes', 'Notes')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={() => handleUpdateNotes(notes)}
                className={styles.createTaskNotesTextarea}
                style={{ border: 'none', padding: 0 }}
              />
            </AttrContainer>
          </AttrStyleContext.Provider>
        </div>
      </div>
    </div>
  );
};

export default ProjectMeta;
