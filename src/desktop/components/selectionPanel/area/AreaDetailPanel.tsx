import { getAreaDetail } from '@/core/state/getArea';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import { EditableTextArea } from '@/components/edit/EditableTextArea.tsx';
import { areaTitleInputKey } from '@/components/edit/inputKeys.ts';
import { MenuIcon } from '@/components/icons';
import type { TreeID } from 'loro-crdt';
import React from 'react';
import { useParams } from 'react-router';
import { useAreaDesktopProjectMenu } from './useAreaDesktopProjectMenu';
import { TagsField } from '../../TagsField';

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

  return (
    <div className="h-full flex flex-col bg-bg1">
      <div className="flex items-center justify-between px-6 py-4 border-b border-line-light">
        <EditableTextArea
          inputKey={areaTitleInputKey(areaId)}
          defaultValue={area.title}
          placeholder={localize('area.untitled', 'New Area')}
          onSave={handleTitleSave}
          className="flex-1 text-xl font-medium outline-none"
          autoSize={{ minRows: 1 }}
        />
        <div className="flex items-center gap-2">
          <button onClick={handleMenuClick} className="p-1.5 hover:bg-bg3 rounded-md transition-colors">
            <MenuIcon className="size-4 text-t2" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div>
            <TagsField itemId={areaId} />
          </div>
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
