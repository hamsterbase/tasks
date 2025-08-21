import { desktopStyles } from '@/desktop/theme/main';
import { localize } from '@/nls.ts';
import React from 'react';
import { ClearSelectionButton } from './ClearSelectionButton';

interface MultipleSelectionViewProps {
  selectedCount: number;
  onClearSelection?: () => void;
}

export const MultipleSelectionView: React.FC<MultipleSelectionViewProps> = ({ selectedCount, onClearSelection }) => {
  return (
    <div className={desktopStyles.MultipleSelectionViewContainer}>
      <div className={desktopStyles.MultipleSelectionViewContent}>
        <p className={desktopStyles.MultipleSelectionViewText}>
          {localize('tasks.selected_count', 'Selected {0} items', selectedCount)}
        </p>
      </div>

      {onClearSelection && <ClearSelectionButton onClearSelection={onClearSelection} />}
    </div>
  );
};
