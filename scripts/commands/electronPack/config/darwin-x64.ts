import { notarize } from '@electron/notarize';
import { Arch, Platform } from 'electron-builder';
import { resolveRoot } from '../../../utils/paths';

interface ElectronPackConfigOption {
  appDirectory: string;
  outputDirectory: string;
  codeSign: boolean;
}

export const getDarwinX64Config = (options: ElectronPackConfigOption) => {
  return {
    targets: Platform.MAC.createTarget(['dmg'], Arch.x64),
    config: {
      afterSign: options.codeSign
        ? async (context) => {
            const { electronPlatformName, appOutDir } = context;
            if (electronPlatformName !== 'darwin') {
              return;
            }
            console.log('[electron] Notarizing macOS app...');
            const appName = context.packager.appInfo.productFilename;
            return notarize({
              appPath: `${appOutDir}/${appName}.app`,
              appleId: process.env.NOTARIZE_APPLE_ID!,
              appleIdPassword: process.env.NOTARIZE_APPLE_ID_PASSWORD!,
              teamId: process.env.NOTARIZE_APPLE_TEAM_ID!,
            });
          }
        : null,
      appId: 'com.hamsterbase.tasks-desktop',
      productName: 'Hamsterbase Tasks Desktop',
      asar: false,
      directories: {
        output: options.outputDirectory,
        app: options.appDirectory,
      },
      files: ['main.js', 'preload.js', 'frontend/**/*'],
      dmg: {
        sign: false,
        artifactName: '${productName}-${version}-darwin-x64.${ext}',
      },
      mac: {
        category: 'public.app-category.productivity',
        icon: resolveRoot('assets/desktop-icon.png'),
        hardenedRuntime: true,
        gatekeeperAssess: false,
        ...(options.codeSign
          ? {}
          : {
              identity: null,
            }),
      },
    },
  };
};
