import { localize } from '@/nls.ts';
import React from 'react';

interface MultipleSelectionViewProps {
  selectedCount: number;
}

export const MultipleSelectionView: React.FC<MultipleSelectionViewProps> = ({ selectedCount }) => {
  return (
    <div className="h-full flex flex-col bg-bg1">
      <div className="flex items-center justify-center h-full">
        <p className="text-t2 text-center">{localize('tasks.selected_count', 'Selected {0} items', selectedCount)}</p>
      </div>
    </div>
  );
};
