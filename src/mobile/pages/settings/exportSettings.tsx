import { checkPlatform } from '@/base/browser/checkPlatform';
import { SettingsIcon } from '@/components/icons';
import { encodePatch } from '@/core/export/encode';
import { useService } from '@/hooks/use-service.ts';
import { ListItemGroup } from '@/mobile/components/listItem/listItem';
import { PageLayout } from '@/mobile/components/PageLayout.tsx';
import { useToast } from '@/mobile/overlay/toast/useToast';
import { localize } from '@/nls.ts';
import { ITodoService } from '@/services/todo/common/todoService';
import { generateUuid } from 'vscf/base/common/uuid';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import React from 'react';

export const ExportSettings = () => {
  const todoService = useService(ITodoService);
  const toast = useToast();
  async function exportFile(fileName: string, base64Data: string) {
    const randomId = generateUuid();
    await Filesystem.mkdir({
      directory: Directory.Cache,
      path: randomId,
    });
    const filePath = `${randomId}/${fileName}`;
    return Filesystem.writeFile({
      path: filePath,
      data: base64Data,
      encoding: Encoding.UTF8,
      directory: Directory.Cache,
    })
      .then(() => {
        return Filesystem.getUri({
          directory: Directory.Cache,
          path: filePath,
        });
      })
      .then((uriResult) => {
        return Share.share({
          title: fileName,
          text: fileName,
          url: uriResult.uri,
        });
      });
  }

  const handleExport = async () => {
    try {
      const { content, dataStr } = encodePatch(todoService.exportPatch({}, todoService.storageId));
      if (checkPlatform().isNative) {
        await exportFile('todo-export.hbTask', content).catch((error) => {
          toast({ message: (error as Error).message });
        });
      } else {
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute('href', dataStr);
        downloadAnchorNode.setAttribute('download', 'todo-export.hbTask');
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      }
    } catch (error) {
      toast({ message: (error as Error).message });
    }
  };

  return (
    <PageLayout
      header={{
        showBack: true,
        id: 'export',
        title: localize('settings.export', 'Export'),
        renderIcon: (className: string) => <SettingsIcon className={className} />,
      }}
    >
      <ListItemGroup
        items={[
          {
            title: localize('settings.export', 'Export'),
            mode: {
              type: 'button',
              theme: 'primary',
              align: 'center',
            },
            onClick: handleExport,
          },
        ]}
        subtitle={localize(
          'settings.export.description',
          'Export your database to back up your data or transfer it to another device.'
        )}
      />
    </PageLayout>
  );
};
