import { CalendarIcon, FlagIcon, NotesIcon, TagIcon } from '@/components/icons';
import { ProjectInfoState } from '@/core/state/type';
import { getDateFromUTCTimeStamp } from '@/core/time/getDateFromUTCTimeStamp';
import { getDateFnsLocale } from '@/locales/common/locale';
import useProject from '@/mobile/hooks/useProject';
import { MobileTestIds } from '@/mobile/testids';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import classNames from 'classnames';
import { format } from 'date-fns';
import Textarea from 'rc-textarea';
import React, { useEffect, useState } from 'react';
import { AttrContainer, AttrStyles } from '@/mobile/components/attr/AttrContainer';
import { AttrLabel } from '@/mobile/components/attr/AttrLabel';
import { AttrTags } from '@/mobile/components/attr/AttrTags';
import { MobileProjectCheckbox } from '@/mobile/components/icon/MobileProjectCheckbox';
import { getItemStatusVisual, itemToneClass } from '@/components/todo/itemStatusVisual';
import { useItemStatusAnimation } from '@/hooks/useItemStatusAnimation';

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
  const animationPhase = useItemStatusAnimation(project.status);
  const visual = getItemStatusVisual(project.status);
  const attrStyles: AttrStyles = {
    ...projectInfoAttrStyles,
    iconContainer: classNames(styles.projectInfoAttrIconContainer, visual.closed ? '!text-t3' : '!text-t2'),
    labelTitleColor: itemToneClass(visual.metadataTone),
  };
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
            data-testid={MobileTestIds.ProjectMeta.Checkbox}
            onLongPress={handleLongPressStatusIcon}
            progress={project.progress * 100}
            status={project.status}
            animationPhase={animationPhase}
            onClick={handleToggleProjectStatus}
          />
        </div>
        <div className={styles.projectInfoContent}>
          <Textarea
            className={classNames(
              styles.projectInfoTitle,
              project.title && (visual.closed ? '!text-t3' : '!text-t1'),
              visual.closed && 'item-status-title-closed'
            )}
            autoSize={{ minRows: 1 }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => handleUpdateTitle(title ?? '')}
            style={{ border: 'none', padding: 0 }}
          />
          {project.startDate && (
            <AttrLabel
              icon={<CalendarIcon className={styles.projectInfoMetaIcon} strokeWidth={1.5} />}
              placeholder=""
              value={{ title: formatDateLabel(project.startDate) }}
              onClick={handleEditStartDate}
              attrStyles={attrStyles}
            />
          )}
          {project.dueDate && (
            <AttrLabel
              icon={<FlagIcon className={styles.projectInfoMetaIcon} strokeWidth={1.5} />}
              placeholder=""
              value={{
                title: formatDateLabel(project.dueDate),
                titleType: visual.closed ? undefined : 'danger',
              }}
              onClick={handleEditDueDate}
              attrStyles={attrStyles}
            />
          )}
          {project.tags && project.tags.length > 0 && (
            <AttrTags
              icon={<TagIcon className={styles.projectInfoMetaIcon} strokeWidth={1.5} />}
              placeholder=""
              tags={project.tags}
              onClick={handleEditTag}
              attrStyles={attrStyles}
              tagClassName={visual.closed ? '!text-t3' : '!text-t2'}
            />
          )}
          <AttrContainer
            icon={<NotesIcon className={styles.projectInfoMetaIcon} strokeWidth={1.5} />}
            attrStyles={attrStyles}
          >
            <Textarea
              autoSize={{ minRows: 2, maxRows: 4 }}
              placeholder={localize('project.notes', 'Notes')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => handleUpdateNotes(notes)}
              className={classNames(styles.createTaskNotesTextarea, visual.closed && '!text-t3')}
              style={{ border: 'none', padding: 0 }}
            />
          </AttrContainer>
        </div>
      </div>
    </div>
  );
};

export default ProjectMeta;
