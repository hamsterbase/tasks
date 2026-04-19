import { ProjectInfoState } from '@/core/state/type.ts';
import { useSortable } from '@dnd-kit/sortable';
import { DragDropElements } from '@/utils/dnd/dragDropCollision.ts';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import { styles } from '@/mobile/theme';
import { LaterProjectsIcon } from '@/components/icons';
import { localize } from '@/nls.ts';
import React from 'react';
import useNavigate from '@/hooks/useNavigate';

interface FutureProjectsProps {
  unstartedProjects: ProjectInfoState[];
  className?: string;
}

export const FutureProjects: React.FC<FutureProjectsProps> = ({
  unstartedProjects,
  className,
}: FutureProjectsProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: DragDropElements.futureProjects,
    disabled: true,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const navigate = useNavigate();
  return (
    <div
      className={classNames(styles.homeProjectItemRoot, className)}
      {...attributes}
      {...listeners}
      style={style}
      ref={setNodeRef}
      onClick={() => {
        navigate({ path: '/future_projects' });
      }}
    >
      <div className={styles.homeProjectItemCheckboxContainer}>
        <LaterProjectsIcon className={styles.areaHeaderIconSize}></LaterProjectsIcon>
      </div>
      <span className={classNames(styles.homeProjectItemTitle, styles.homeProjectItemTitleNormal)}>
        {unstartedProjects.length} {localize('home.futureProjects', 'Future Projects')}
      </span>
    </div>
  );
};
