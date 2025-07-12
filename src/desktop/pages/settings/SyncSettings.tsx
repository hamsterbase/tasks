import { localize } from '@/nls';
import React from 'react';

export const SyncSettings: React.FC = () => {
  return (
    <div className="p-6 w-full">
      <div className="space-y-8">
        <div>
          <div className="text-center py-12">
            <p className="text-t2">{localize('settings.sync.coming_soon', 'Sync functionality coming soon.')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
