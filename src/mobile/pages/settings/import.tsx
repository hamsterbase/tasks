import { SettingsIcon } from '@/components/icons';
import { decodePatch } from '@/core/export/decode';
import { useService } from '@/hooks/use-service.ts';
import { ListItemGroup } from '@/mobile/components/listItem/listItem';
import { PageLayout } from '@/mobile/components/PageLayout.tsx';
import { useToast } from '@/mobile/overlay/toast/useToast';
import { localize } from '@/nls.ts';
import { ITodoService } from '@/services/todo/common/todoService';
import React, { useState } from 'react';

export const ImportPage = () => {
  const todoService = useService(ITodoService);
  const [importing, setImporting] = useState(false);
  const toast = useToast();

  const Messages = {
    importedSuccessfully: localize('settings.import.importedSuccessfully', 'Imported successfully'),
    fileReadingFailed: localize('settings.import.fileReadingFailed', 'File reading failed'),
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
                toast({ message: Messages.importedSuccessfully });
              }
            } catch (error) {
              toast({ message: (error as Error).message });
            } finally {
              setImporting(false);
            }
          };

          reader.onerror = () => {
            toast({ message: Messages.fileReadingFailed });
            setImporting(false);
          };

          reader.readAsText(file);
        } else {
          setImporting(false);
        }
      };
      input.click();
    } catch (error) {
      toast({ message: (error as Error).message });
    } finally {
      setImporting(false);
    }
  };

  return (
    <PageLayout
      header={{
        showBack: true,
        id: 'import',
        title: localize('settings.import', 'Import'),
        renderIcon: (className: string) => <SettingsIcon className={className} />,
      }}
    >
      <ListItemGroup
        items={[
          {
            testId: 'import-button',
            title: localize('settings.import', 'Import'),
            mode: {
              type: 'button',
              theme: 'primary',
              align: 'center',
            },
            onClick: importing ? undefined : handleImport,
          },
        ]}
        subtitle={localize('settings.import.description', 'Import your tasks from a backup file')}
      />
    </PageLayout>
  );
};
