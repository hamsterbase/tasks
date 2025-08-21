import { desktopStyles } from '@/desktop/theme/main';
import { localize } from '@/nls.ts';
import React from 'react';

export const EmptyPanel = () => {
  return (
    <div className={desktopStyles.EmptyPanelContainer}>
      <div className={desktopStyles.EmptyPanelText}>
        {localize('tasks.select_task', 'Select a task to view details')}
      </div>
    </div>
  );
};
