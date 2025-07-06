import { localize } from '@/nls';
import React from 'react';

interface ClearSelectionButtonProps {
  onClearSelection: () => void;
}

export const ClearSelectionButton: React.FC<ClearSelectionButtonProps> = ({ onClearSelection }) => {
  return (
    <div className="border-t border-line-light p-4">
      <button
        onClick={onClearSelection}
        className="w-full py-2 px-4 text-sm text-t2 hover:text-t1 hover:bg-bg2 rounded-md transition-colors"
      >
        {localize('selection.clear_selection', 'Clear Selection')}
      </button>
    </div>
  );
};