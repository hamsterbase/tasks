import { Arch, Platform } from 'electron-builder';
import { resolveRoot } from '../../../utils/paths';

interface ElectronPackConfigOption {
  appDirectory: string;
  outputDirectory: string;
  codeSign: boolean;
}

export const getMasUniversalConfig = (options: ElectronPackConfigOption) => {
  return {
    targets: Platform.MAC.createTarget(['mas'], Arch.universal),
    config: {
      appId: 'com.hamsterbase.tasks-desktop-mas',
      productName: 'Hamsterbase Tasks Desktop',
      asar: false,
      directories: {
        output: options.outputDirectory,
        app: options.appDirectory,
      },
      files: ['main.js', 'preload.js', 'frontend/**/*'],
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
      mas: {
        entitlements: resolveRoot('scripts/mas/entitlements.mas.plist'),
        entitlementsInherit: resolveRoot('scripts/mas/entitlements.mas.inherit.plist'),
        provisioningProfile: resolveRoot('scripts/mas/embedded.provisionprofile'),
        artifactName: '${productName}-${version}-mas-universal.${ext}',
      },
    },
  };
};
