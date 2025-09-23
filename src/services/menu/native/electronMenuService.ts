import { localize } from '@/nls';
import { ElectronMenuServiceClient } from '../electron/menuService-ipc';
import { IMenuService } from '../common/menuService';
import { checkPlatform } from '@/base/browser/checkPlatform';

export class ElectronMenuService implements IMenuService {
  public readonly _serviceBrand: undefined;
  private readonly client = new ElectronMenuServiceClient();

  async updateMenu(): Promise<void> {
    if (!checkPlatform().isElectron) {
      return;
    }
    const template: Electron.MenuItemConstructorOptions[] = [
      ...(checkPlatform().isMac
        ? [
            {
              label: 'HamsterBase Tasks',
              submenu: [
                { label: localize('menu.about', 'About HamsterBase Tasks'), role: 'about' as const },
                { type: 'separator' as const },
                { label: localize('menu.quit', 'Quit HamsterBase Tasks'), role: 'quit' as const },
              ],
            },
          ]
        : []),
      {
        label: localize('menu.edit', 'Edit'),
        submenu: [
          { label: localize('menu.cut', 'Cut'), role: 'cut' as const },
          { label: localize('menu.copy', 'Copy'), role: 'copy' as const },
          { label: localize('menu.paste', 'Paste'), role: 'paste' as const },
          { label: localize('menu.selectAll', 'Select All'), role: 'selectAll' as const },
        ],
      },
      {
        label: localize('menu.view', 'View'),
        submenu: [
          { label: localize('menu.reload', 'Reload'), role: 'reload' as const },
          { label: localize('menu.forceReload', 'Force Reload'), role: 'forceReload' as const },
          { type: 'separator' as const },
          { label: localize('menu.toggleFullscreen', 'Toggle Full Screen'), role: 'togglefullscreen' as const },
        ],
      },
      {
        label: localize('menu.developer', 'Developer'),
        submenu: [{ label: localize('menu.toggleDevTools', 'Developer Tools'), role: 'toggleDevTools' as const }],
      },
    ];

    return this.client.setApplicationMenu(template);
  }
}
