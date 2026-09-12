import { CopyIcon } from '@/components/icons';
import { useDesktopMessage } from '@/desktop/overlay/desktopMessage/useDesktopMessage';
import { localize } from '@/nls';
import { TestIds } from '@/testIds';
import React from 'react';

/**
 * Instructions for an agent, not for the reader — kept in English on purpose
 * and out of the localization files. Every line is a command or a path, and a
 * translated copy would only drift from what the CLI actually prints.
 */
const AGENT_PROMPT = `Set up the HamsterBase Tasks CLI so you can manage my tasks:

1. Run \`npm install -g @hamsterbase/tasks-cli\` (requires Node.js 20 or newer).
2. Run \`hamsterbase-tasks skill-dir --json\`. It prints {"dir": "<path>", "version": "<version>"}.
3. Copy the whole directory at "dir" into your skills directory, keeping the folder name hamsterbase-tasks.
4. Read SKILL.md inside it and follow it whenever I ask about my tasks.

The CLI talks to the running HamsterBase Tasks desktop app, so keep that app open.`;

export const CliApprovalSetupGuide: React.FC = () => {
  const desktopMessage = useDesktopMessage();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(AGENT_PROMPT);
    desktopMessage({
      type: 'success',
      message: localize('cliApproval.setup.copySuccess', 'Prompt copied to clipboard'),
    });
  };

  return (
    <div className="flex max-w-2xl flex-col gap-3 py-6" data-test-id={TestIds.CliApproval.SetupGuide}>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-sm font-semibold text-t1">
          {localize('cliApproval.setup.title', 'Let an AI agent manage your tasks')}
        </h2>
        <p className="text-xs leading-5 text-t3">
          {localize(
            'cliApproval.setup.description',
            'With the HamsterBase Tasks CLI installed, an AI agent can read your tasks and queue changes here for your approval. It works only while the desktop app is open — nothing changes until you approve it.'
          )}
        </p>
      </div>

      <div className="rounded-lg border border-line-light bg-bg2">
        <div className="flex items-center justify-between gap-2 border-b border-line-light px-3 py-1.5">
          <span className="text-xs text-t3">{localize('cliApproval.setup.promptLabel', 'Send this to your AI')}</span>
          <button
            data-test-id={TestIds.CliApproval.SetupGuideCopyButton}
            className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs text-t2 transition-colors hover:bg-bg3 hover:text-t1"
            onClick={handleCopy}
          >
            <CopyIcon className="size-3.5" />
            {localize('cliApproval.setup.copy', 'Copy')}
          </button>
        </div>
        <pre className="overflow-x-auto px-3 py-2.5 font-mono text-xs leading-5 whitespace-pre-wrap text-t2">
          {AGENT_PROMPT}
        </pre>
      </div>
    </div>
  );
};
