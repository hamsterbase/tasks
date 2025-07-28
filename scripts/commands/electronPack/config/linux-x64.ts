import { Arch, Platform } from 'electron-builder';
import { resolveRoot } from '../../../utils/paths';

interface ElectronPackConfigOption {
  appDirectory: string;
  outputDirectory: string;
  codeSign: boolean;
}

export const getLinuxX64Config = (options: ElectronPackConfigOption) => {
  return {
    targets: Platform.LINUX.createTarget(['AppImage'], Arch.x64),
    config: {
      appId: 'com.hamsterbase.tasks-desktop',
      productName: 'Hamsterbase Tasks Desktop',
      asar: false,
      directories: {
        output: options.outputDirectory,
        app: options.appDirectory,
      },
      files: ['main.js', 'preload.js', 'frontend/**/*'],
      linux: {
        category: 'Office',
        icon: resolveRoot('assets/desktop-icon.png'),
      },
    },
  };
};
