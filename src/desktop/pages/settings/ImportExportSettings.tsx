import { encodePatch } from '@/core/export/encode';
import { decodePatch } from '@/core/export/decode';
import { useService } from '@/hooks/use-service.ts';
import { ITodoService } from '@/services/todo/common/todoService';
import { localize } from '@/nls';
import { SettingsItem } from '@/desktop/components/settings/SettingsItem';
import React, { useState } from 'react';

export const ImportExportSettings: React.FC = () => {
  const todoService = useService(ITodoService);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const { dataStr } = encodePatch(todoService.exportPatch({}, todoService.storageId));

      // Create download link for desktop
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute('href', dataStr);
      downloadAnchorNode.setAttribute('download', 'todo-export.hbTask');
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (error) {
      console.error('Export failed:', error);
      // TODO: Add proper error handling notification
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      setImporting(true);
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.hbTask';
      input.onchange = async (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
          const file = target.files[0];
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              if (event.target && event.target.result) {
                await todoService.import([decodePatch(event.target.result as string)], todoService.storageId);
                // TODO: Add success notification
              }
            } catch (error) {
              console.error('Import failed:', error);
              // TODO: Add proper error handling notification
            } finally {
              setImporting(false);
            }
          };

          reader.onerror = () => {
            console.error('File reading failed');
            setImporting(false);
          };

          reader.readAsText(file);
        } else {
          setImporting(false);
        }
      };
      input.click();
    } catch (error) {
      console.error('Import failed:', error);
      setImporting(false);
    }
  };

  return (
    <div className="p-6 w-full">
      <div className="space-y-8">
        <div>
          <div className="space-y-6">
            <SettingsItem
              title={localize('settings.export', 'Export')}
              description={localize(
                'settings.export.description',
                'Export your database to back up your data or transfer it to another device.'
              )}
              action={{
                type: 'button',
                label: exporting ? localize('common.exporting', 'Exporting...') : localize('settings.export', 'Export'),
                onClick: handleExport,
                disabled: exporting,
              }}
            />

            <div className="border-t border-line-light">
              <SettingsItem
                title={localize('settings.import', 'Import')}
                description={localize('settings.import.description', 'Import your tasks from a backup file')}
                action={{
                  type: 'button',
                  label: importing
                    ? localize('common.importing', 'Importing...')
                    : localize('settings.import', 'Import'),
                  onClick: handleImport,
                  disabled: importing,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
