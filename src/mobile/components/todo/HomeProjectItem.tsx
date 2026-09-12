import { ProjectInfoState } from '@/core/state/type.ts';
import { ItemVisualContext, getItemStatusVisual } from '@/components/todo/itemStatusVisual';
import { useService } from '@/hooks/use-service';
import { MobileTestIds } from '@/mobile/testids';
import { useCancelEdit } from '@/hooks/useCancelEdit';
import { useEdit } from '@/hooks/useEdit';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import React from 'react';
import { DragItem } from '../dnd/DragItem';
import { TaskItemCompletionAt } from '../taskItem/taskItemCompletionAt';
import { TaskItemDueDate } from '../taskItem/TaskItemDueDate';
import { TaskItemIcons } from '../taskItem/TaskItemIcons';
import { TaskItemSubtitle } from '../taskItem/TaskItemSubtitle';
import { TaskItemTitle } from '../taskItem/taskItemTitle';
import useNavigate from '@/hooks/useNavigate';
import { MobileProjectCheckbox } from '../icon/MobileProjectCheckbox';
import { useItemStatusAnimation } from '@/hooks/useItemStatusAnimation';

interface ProjectItemProps {
  projectInfo: ProjectInfoState;
  hideSubtitle?: boolean;
  className?: string;
  visualContext?: ItemVisualContext;
  willDisappear?: boolean;
}

export const HomeProjectItem: React.FC<ProjectItemProps> = ({
  projectInfo,
  hideSubtitle,
  className,
  visualContext = 'default',
  willDisappear = false,
}) => {
  const navigate = useNavigate();
  const todoService = useService(ITodoService);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, node } = useSortable({
    id: projectInfo.id,
  });
  const { itemClassName, shouldIgnoreClick, isEditing, endEditing } = useCancelEdit(node, projectInfo.id);
  const { textAreaProps } = useEdit({
    isEditing,
    title: projectInfo.title,
    onSave: (title: string) => {
      todoService.updateProject(projectInfo.id, { title });
    },
    singleLine: true,
    onConfirm: endEditing,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const animationPhase = useItemStatusAnimation(projectInfo.status);
  const visual = getItemStatusVisual(projectInfo.status, visualContext);
  const titleNode = isEditing ? (
    <input {...textAreaProps} className={styles.homeProjectItemEditingInput} />
  ) : (
    <TaskItemTitle
      testId={MobileTestIds.ProjectItem.Title}
      title={projectInfo.title}
      status={projectInfo.status}
      emptyText={localize('project.untitled', 'New Project')}
      visualContext={visualContext}
      animationPhase={animationPhase}
    />
  );

  if (isDragging) {
    return <DragItem ref={setNodeRef} attributes={attributes} listeners={listeners} style={style} />;
  }

  return (
    <div
      data-testid={MobileTestIds.ProjectItem.Root}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={classNames(styles.homeProjectItemRoot, itemClassName, className, {
        [styles.taskItemEditingShadow]: isEditing,
        [styles.taskItemEditingRound]: isEditing,
        'item-status-row-exiting': willDisappear,
      })}
      onClick={(e) => {
        if (shouldIgnoreClick(e)) {
          return;
        }
        navigate({ path: `/project/${projectInfo.uid}` });
      }}
      data-status={projectInfo.status}
      data-status-animation={animationPhase}
      data-exiting={willDisappear && animationPhase === 'settling' ? 'true' : undefined}
    >
      <button className={classNames(styles.taskItemIconSize)}>
        <MobileProjectCheckbox
          status={projectInfo.status}
          progress={projectInfo.progress}
          animationPhase={animationPhase}
        />
      </button>
      <div className={styles.homeProjectItemContent}>
        <div className={styles.homeProjectItemTitleRow}>
          {titleNode}
          {!isEditing && (
            <>
              <div className={styles.homeProjectItemMetaIcons}>
                <TaskItemIcons
                  tags={projectInfo.tags}
                  notes={projectInfo.notes}
                  navIcon={false}
                  tone={visual.metadataTone}
                />
              </div>
            </>
          )}
        </div>
        {!hideSubtitle && projectInfo.areaTitle && (
          <TaskItemSubtitle title={projectInfo.areaTitle} tone={visual.metadataTone} />
        )}
      </div>
      <TaskItemCompletionAt completionAt={projectInfo.completionAt} status={projectInfo.status} />
      {projectInfo.status === 'created' && <TaskItemDueDate dueDate={projectInfo.dueDate} />}
    </div>
  );
};
