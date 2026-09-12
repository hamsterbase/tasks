import { buildCli } from '../utils/buildCli.js';

export async function cliBuildCommand(): Promise<void> {
  try {
    console.log('[cli] Building CLI...');
    await buildCli();
    console.log('[cli] Build completed successfully!');
  } catch (error) {
    console.error('Error building CLI:', error);
    process.exit(1);
  }
}
