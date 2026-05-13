import { desktopStyles } from '@/desktop/theme/main';
import { localize } from '@/nls';
import { TaskTokenItem } from '@/packages/cloud/server/tasks';
import React from 'react';

interface CloudDatabaseTokenSectionProps {
  tokens: TaskTokenItem[];
  onCopy: (tokenValue: string) => void;
  onRevoke: (tokenId: string) => void;
}

export const CloudDatabaseTokenSection: React.FC<CloudDatabaseTokenSectionProps> = ({ tokens, onCopy, onRevoke }) => {
  if (tokens.length === 0) {
    return null;
  }

  const sectionLabel = localize('database.token.section', 'Inbox Tokens');

  return (
    <div className={desktopStyles.DatabaseTokenSection}>
      {tokens.map((token) => (
        <div key={token.id} data-testid="cloud-database-inbox-token-row" className={desktopStyles.DatabaseTokenRow}>
          <span className={desktopStyles.DatabaseTokenLine}>
            {sectionLabel} · {token.name}
          </span>
          <div className={desktopStyles.DatabaseTokenActions}>
            <button
              type="button"
              className={desktopStyles.DatabaseTokenCopyLink}
              onClick={() => onCopy(token.token)}
            >
              {localize('common.copy', 'Copy')}
            </button>
            <span className={desktopStyles.DatabaseTokenActionSeparator}>·</span>
            <button
              type="button"
              className={desktopStyles.DatabaseTokenRevokeLink}
              onClick={() => onRevoke(token.id)}
            >
              {localize('database.token.revoke', 'Revoke')}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
