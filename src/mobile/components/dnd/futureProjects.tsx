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
      className={classNames('flex items-center gap-2', styles.taskItemPaddingX, styles.taskItemHeight, className)}
      {...attributes}
      {...listeners}
      style={style}
      ref={setNodeRef}
      onClick={() => {
        navigate({ path: '/future_projects' });
      }}
    >
      <button className={'w-5 text-t3'}>
        <LaterProjectsIcon className="size-5"></LaterProjectsIcon>
      </button>
      <span className={'text-lg'}>
        {unstartedProjects.length} {localize('home.futureProjects', 'Future Projects')}
      </span>
    </div>
  );
};
