import { localize } from '@/nls.ts';
import React from 'react';
import { ClearSelectionButton } from './ClearSelectionButton';

interface MultipleSelectionViewProps {
  selectedCount: number;
  onClearSelection?: () => void;
}

export const MultipleSelectionView: React.FC<MultipleSelectionViewProps> = ({ selectedCount, onClearSelection }) => {
  return (
    <div className="h-full flex flex-col bg-bg1">
      <div className="flex items-center justify-center flex-1">
        <p className="text-t2 text-center">{localize('tasks.selected_count', 'Selected {0} items', selectedCount)}</p>
      </div>

      {onClearSelection && <ClearSelectionButton onClearSelection={onClearSelection} />}
    </div>
  );
};
