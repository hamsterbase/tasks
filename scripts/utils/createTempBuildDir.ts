import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { resolveRoot } from './paths';

export async function createTempBuildDir() {
  const tempDirBase = await fs.realpath(os.tmpdir());
  const tempDir = await fs.mkdtemp(path.join(tempDirBase, 'tasks-build-'));

  const webDistSource = resolveRoot('dist');
  await fs.cp(webDistSource, path.join(tempDir, 'frontend'), { recursive: true, dereference: true });

  const electronDistSource = resolveRoot('electron-dist');
  await fs.cp(electronDistSource, tempDir, {
    recursive: true,
    dereference: true,
  });
  await fs.writeFile(path.join(tempDir, '.npmrc'), 'registry=https://registry.npmmirror.com/');
  // Create minimal package.json with electron dependency
  const originalPackage = JSON.parse(await fs.readFile(resolveRoot('package.json'), 'utf-8'));
  const minimalPackage = {
    name: originalPackage.name,
    version: originalPackage.version,
    main: 'main.js',
    devDependencies: {
      electron: originalPackage.devDependencies.electron,
    },
  };

  await fs.writeFile(path.join(tempDir, 'package.json'), JSON.stringify(minimalPackage, null, 2));

  await new Promise((resolve, reject) => {
    const pnpmProcess = spawn('npm', ['install', '--production'], {
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
