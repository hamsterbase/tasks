import { z } from 'zod';
import { ParsedArgs } from './args';

export function parseCommandFlags<T extends z.ZodType>(args: ParsedArgs, schema: T): z.output<T> {
  const flags = { ...args.flags };
  delete flags.json;
  const result = schema.safeParse(flags);
  if (result.success) {
    return result.data;
  }
  const details = result.error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `--${issue.path.join('.')}` : 'arguments';
    return `  ${path}: ${issue.message}`;
  });
  throw new Error(['invalid arguments', ...details].join('\n'));
}
