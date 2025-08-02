import { EditableTextArea } from '@/components/edit/EditableTextArea.tsx';
import { projectHeadingTitleInputKey } from '@/components/edit/inputKeys.ts';
import { MenuIcon } from '@/components/icons';
import { ProjectHeadingInfo } from '@/core/state/type.ts';
import { useDesktopProjectHeader } from '@/desktop/hooks/useDesktopProjectHeader';
import { useService } from '@/hooks/use-service.ts';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService.ts';
import React from 'react';
import { ClearSelectionButton } from './ClearSelectionButton';
import { TaskLocationField } from './components/TaskLocationField';

interface HeadingDetailViewProps {
  heading: ProjectHeadingInfo;
  onClearSelection?: () => void;
}

export const HeadingDetailView: React.FC<HeadingDetailViewProps> = ({ heading, onClearSelection }) => {
  const todoService = useService(ITodoService);

  const handleTitleSave = (value: string) => {
    todoService.updateProjectHeading(heading.id, { title: value });
  };

  const { handleMenuClick } = useDesktopProjectHeader({ projectHeadingInfo: heading });

  return (
    <div className="h-full flex flex-col bg-bg1">
      <div className="flex items-center justify-between px-6 py-4 border-b border-line-light">
        <EditableTextArea
          inputKey={projectHeadingTitleInputKey(heading.id)}
          defaultValue={heading.title}
          placeholder={localize('heading.title_placeholder', 'Add heading title...')}
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
          <TaskLocationField itemId={heading.id} />
        </div>
      </div>

      {onClearSelection && <ClearSelectionButton onClearSelection={onClearSelection} />}
    </div>
  );
};
