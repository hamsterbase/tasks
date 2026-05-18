/* eslint-disable react-refresh/only-export-components -- CLI runner module, not a fast-refresh boundary */
import React, { ReactElement, useEffect } from 'react';
import { render, useApp } from 'ink';
import { ErrorView } from '../components/ErrorView';

/**
 * Wraps a one-shot view so the ink app exits once the frame is painted. Keeps
 * every view file free of lifecycle/exit logic — they only map props to JSX.
 */
function AutoExit({ children }: { children: React.ReactNode }) {
  const { exit } = useApp();
  useEffect(() => {
    exit();
  }, [exit]);
  return <>{children}</>;
}

/**
 * The single entry point for running a command and rendering its result.
 *
 * `exec` carries all logic; `view` only renders the result. Any thrown error
 * is caught and routed through the generic {@link ErrorView}. With
 * `opts.json`, the raw result is serialized to stdout instead of rendered.
 */
export async function runCommand<T>(
  exec: () => Promise<T>,
  view: (result: T) => ReactElement,
  opts: { json?: boolean } = {}
): Promise<void> {
  if (opts.json) {
    try {
      const result = await exec();
      process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    } catch (err) {
      process.exitCode = 1;
      process.stderr.write(`✗ ${(err as Error).message}\n`);
    }
    return;
  }

  let element: ReactElement;
  try {
    element = view(await exec());
  } catch (err) {
    process.exitCode = 1;
    element = <ErrorView message={(err as Error).message} />;
  }

  const { waitUntilExit } = render(<AutoExit>{element}</AutoExit>);
  await waitUntilExit();
}
