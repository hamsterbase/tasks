import { Arch, Platform } from 'electron-builder';
import { resolveRoot } from '../../../utils/paths';

interface ElectronPackConfigOption {
  appDirectory: string;
  outputDirectory: string;
  codeSign: boolean;
}

export const getWin32X64Config = (options: ElectronPackConfigOption) => {
  return {
    targets: Platform.WINDOWS.createTarget(['nsis'], Arch.x64),
    config: {
      appId: 'com.hamsterbase.tasks-desktop',
      productName: 'Hamsterbase Tasks Desktop',
      asar: false,
      directories: {
        output: options.outputDirectory,
        app: options.appDirectory,
      },
      files: ['main.js', 'preload.js', 'frontend/**/*'],
      win: {
        icon: resolveRoot('assets/desktop-icon.ico'),
        target: 'nsis',
      },
      nsis: {
        oneClick: false,
        allowToChangeInstallationDirectory: true,
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
      },
    },
  };
};
