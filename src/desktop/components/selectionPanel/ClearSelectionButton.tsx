import { desktopStyles } from '@/desktop/theme/main';
import { localize } from '@/nls';
import React from 'react';

interface ClearSelectionButtonProps {
  onClearSelection: () => void;
}

export const ClearSelectionButton: React.FC<ClearSelectionButtonProps> = ({ onClearSelection }) => {
  return (
    <div className={desktopStyles.ClearSelectionButton} onClick={onClearSelection}>
      {localize('selection.clear_selection', 'Clear Selection')}
    </div>
  );
};
