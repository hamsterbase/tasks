import { resolveRoot } from './paths';
import { promises as fs } from 'fs';

export async function loadElectronPackEnv() {
  const envConfig = resolveRoot('scripts/electronPackEnv.json');
  try {
    const content = await fs.readFile(envConfig, 'utf-8');
    const envJSON = JSON.parse(content);
    Object.keys(envJSON).forEach((key) => {
      process.env[key] = envJSON[key];
    });
    return true;
  } catch {
    return false;
  }
}
