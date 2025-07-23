import { notarize } from '@electron/notarize';
import { spawn } from 'child_process';
import { Arch, build, Configuration, Platform } from 'electron-builder';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ProjectRoot = path.resolve(__dirname, '..');

async function loadEnv() {
  const envConfig = resolve(ProjectRoot, 'scripts/env.json');
  try {
    const content = await fs.readFile(envConfig, 'utf-8');
    const envJSON = JSON.parse(content);
    Object.keys(envJSON).forEach((key) => {
      process.env[key] = envJSON[key];
    });
  } catch {
    console.log('env not found');
  }
}

// Get platform from command line argument or detect current platform
const targetPlatform: string = process.argv[2] || process.platform;

interface PlatformBuildConfig {
  targets: Map<Platform, Map<Arch, string[]>>;
  config: Configuration;
}

// Platform-specific configurations
const platformConfigs: Record<string, PlatformBuildConfig> = {
  mac: {
    targets: Platform.MAC.createTarget(['dmg'], Arch.arm64),
    config: {
      afterSign: async (context) => {
        const { electronPlatformName, appOutDir } = context;
        if (electronPlatformName !== 'darwin') {
          return;
        }
        const appName = context.packager.appInfo.productFilename;
        console.log('start notarize');
        console.log('appid: ', !!process.env.NOTARIZE_APPLE_ID!);
        console.log('appidPassword: ', !!process.env.NOTARIZE_APPLE_ID!);
        console.log(
          JSON.stringify(
            {
              appPath: `${appOutDir}/${appName}.app`,
              appleId: process.env.NOTARIZE_APPLE_ID!,
              appleIdPassword: process.env.NOTARIZE_APPLE_ID_PASSWORD!,
              teamId: process.env.NOTARIZE_APPLE_TEAM_ID!,
            },
            null,
            2
          )
        );
        return notarize({
          appPath: `${appOutDir}/${appName}.app`,
          appleId: process.env.NOTARIZE_APPLE_ID!,
          appleIdPassword: process.env.NOTARIZE_APPLE_ID_PASSWORD!,
          teamId: process.env.NOTARIZE_APPLE_TEAM_ID!,
        });
      },
      appId: 'com.hamsterbase.tasks-desktop',
      productName: 'Hamsterbase Tasks Desktop',
      asar: false,
      directories: {
        output: 'release',
      },
      files: ['dist/**/*'],
      dmg: {
        sign: false,
      },
      mac: {
        category: 'public.app-category.productivity',
        icon: 'assets/desktop-icon.png',
        hardenedRuntime: true,
        gatekeeperAssess: false,
      },
    },
  },
};

async function createTempBuildDir() {
  // Use realpath to resolve any symlinks in the temp directory path
  const tempDirBase = await fs.realpath(os.tmpdir());
  const tempDir = await fs.mkdtemp(path.join(tempDirBase, 'tasks-build-'));

  // Copy dist folder to temp directory, dereferencing symlinks
  const distSource = path.join(ProjectRoot, 'dist');
  const distDest = path.join(tempDir, 'dist');
  await fs.cp(distSource, distDest, { recursive: true, dereference: true });

  await fs.writeFile(path.join(tempDir, '.npmrc'), 'registry=https://registry.npmmirror.com/');

  // Create minimal package.json with electron dependency
  const originalPackage = JSON.parse(await fs.readFile(path.join(ProjectRoot, 'package.json'), 'utf-8'));
  const minimalPackage = {
    name: originalPackage.name,
    version: originalPackage.version,
    main: 'dist/electron/main.js',
    devDependencies: {
      electron: originalPackage.devDependencies.electron,
    },
  };

  await fs.writeFile(path.join(tempDir, 'package.json'), JSON.stringify(minimalPackage, null, 2));

  await new Promise((resolve, reject) => {
    const pnpmProcess = spawn('npm', ['install'], {
      cwd: tempDir,
      stdio: 'inherit',
    });

    pnpmProcess.on('close', (code) => {
      if (code === 0) {
        resolve(void 0);
      } else {
        reject(new Error(`pnpm install failed with code ${code}`));
      }
    });
  });
  return tempDir;
}

async function pack() {
  let tempDir: string | null = null;

  try {
    await loadEnv();

    // Normalize platform name
    const platform = targetPlatform === 'darwin' ? 'mac' : targetPlatform;

    // Check if platform is supported
    if (!platformConfigs[platform]) {
      console.error(`[pack] ❌ Unsupported platform: ${platform}`);
      console.error(`[pack] Supported platforms: ${Object.keys(platformConfigs).join(', ')}`);
      process.exit(1);
    }

    // Create temporary build directory
    console.log('[pack] Creating temporary build directory...');
    tempDir = await createTempBuildDir();
    console.log(`[pack] Temporary directory: ${tempDir}`);

    const config: PlatformBuildConfig = platformConfigs[platform];

    // Update config to use temp directory
    const buildConfig = {
      ...config.config,
      directories: {
        ...config.config.directories,
        app: tempDir,
      },
    };

    console.log(`[pack] Building for platform: ${platform}`);
    console.log(`[pack] Target: ${platform}`);

    // Build using electron-builder API
    await build({
      targets: config.targets,
      config: buildConfig,
    });

    console.log(`[pack] ✅ ${platform} build completed successfully!`);
    console.log(`[pack] Output location: release/`);
  } catch (error: unknown) {
    console.error('[pack] ❌ Build failed:', error);
    process.exit(1);
  } finally {
    // Clean up temporary directory
    if (tempDir) {
      try {
        console.log('[pack] Cleaning up temporary directory...');
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.warn('[pack] ⚠️ Failed to clean up temporary directory:', cleanupError);
      }
    }
  }
}

// Handle termination
process.on('SIGINT', () => {
  console.log('\n[pack] Build cancelled by user');
  process.exit(0);
});

// Start packing
pack();
