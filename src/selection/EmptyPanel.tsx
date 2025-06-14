import { localize } from '@/nls';
import React from 'react';

export const EmptyPanel = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-t3">{localize('tasks.select_task', 'Select a task to view details')}</div>
    </div>
  );
};
