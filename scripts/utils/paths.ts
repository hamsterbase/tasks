import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export function resolveRoot(...segments: string[]): string {
  return path.resolve(__dirname, '..', '..', ...segments);
}
