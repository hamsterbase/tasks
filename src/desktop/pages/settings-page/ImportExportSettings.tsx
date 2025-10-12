import { decodePatch } from '@/core/export/decode';
import { encodePatch } from '@/core/export/encode';
import { ItemGroup } from '@/desktop/components/Settings/ItemGroup';
import { SettingsContent } from '@/desktop/components/Settings/SettingsContent/SettingsContent';
import { SettingsItem } from '@/desktop/components/Settings/SettingsItem';
import { SettingsTitle } from '@/desktop/components/Settings/SettingsTitle';
import { useService } from '@/hooks/use-service.ts';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
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
    <SettingsContent>
      <SettingsTitle title={localize('settings.import_export', 'Import & Export')} />
      <ItemGroup>
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
        <SettingsItem
          title={localize('settings.import', 'Import')}
          description={localize('settings.import.description', 'Import your tasks from a backup file')}
          action={{
            type: 'button',
            label: importing ? localize('common.importing', 'Importing...') : localize('settings.import', 'Import'),
            onClick: handleImport,
            disabled: importing,
          }}
        />
      </ItemGroup>
    </SettingsContent>
  );
};
