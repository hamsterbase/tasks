import { areaTitleInputKey } from '@/components/edit/inputKeys.ts';
import { AreaIcon, MenuIcon } from '@/components/icons';
import { getAreaDetail } from '@/core/state/getArea';
import { EntityHeader } from '@/desktop/components/common/EntityHeader';
import { desktopStyles } from '@/desktop/theme/main.ts';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import type { TreeID } from 'loro-crdt';
import React from 'react';
import { useParams } from 'react-router';
import { TagsField } from '../../TagsField';
import { useAreaDesktopProjectMenu } from './useAreaDesktopProjectMenu';

const ICON_STROKE_WIDTH = 1.5;

const useAreaId = (): TreeID | null => {
  const todoService = useService(ITodoService);
  const { areaUid } = useParams<{ areaUid?: string }>();

  if (!areaUid) {
    return null;
  }

  const areaId = todoService.modelState.taskObjectUidMap.get(areaUid)?.id;
  return areaId || null;
};

interface IAreaDetailPanelContentProps {
  areaId: TreeID;
  area: NonNullable<ReturnType<typeof getAreaDetail>>;
}

const AreaDetailPanelContent: React.FC<IAreaDetailPanelContentProps> = ({ areaId, area }) => {
  const todoService = useService(ITodoService);

  const handleTitleSave = (title: string) => {
    todoService.updateArea(areaId, { title });
  };

  const { openAreaDesktopMenu } = useAreaDesktopProjectMenu(areaId);

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    openAreaDesktopMenu(rect.right, rect.bottom);
  };

  const headerActions = [
    {
      icon: <MenuIcon strokeWidth={ICON_STROKE_WIDTH} />,
      handleClick: handleMenuClick,
      title: localize('common.more', 'More'),
    },
  ];

  return (
    <div className={desktopStyles.DetailViewContainer}>
      <EntityHeader
        editable
        variant="detail"
        inputKey={areaTitleInputKey(areaId)}
        renderIcon={() => <AreaIcon className={desktopStyles.DetailViewHeaderStatusBox} />}
        title={area.title}
        placeholder={localize('area.untitled', 'New Area')}
        onSave={handleTitleSave}
        extraActions={headerActions}
      />

      <div className={desktopStyles.DetailViewContent}>
        <div className={desktopStyles.DetailViewContentInner}>
          <TagsField itemId={areaId} />
        </div>
      </div>
    </div>
  );
};

export const AreaDetailPanel: React.FC = () => {
  const todoService = useService(ITodoService);
  const areaId = useAreaId();

  useWatchEvent(todoService.onStateChange);

  if (!areaId) {
    return null;
  }

  let area = null;
  try {
    area = getAreaDetail(todoService.modelState, areaId);
  } catch {
    return null;
  }

  if (!area) {
    return null;
  }

  return <AreaDetailPanelContent areaId={areaId} area={area} />;
};
