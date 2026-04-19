import React from 'react';
import { styles } from '@/mobile/theme';

interface PageStateProps {
  label: string;
  link?: {
    text: string;
    href: string;
  } | null;
}

export const PageState: React.FC<PageStateProps> = ({ label, link }) => {
  return (
    <div className={styles.pageStateRoot}>
      <p className={styles.pageStateLabel}>{label}</p>
      {link && (
        <a href={link.href} target="_blank" rel="noopener noreferrer" className={styles.pageStateLink}>
          {link.text}
        </a>
      )}
    </div>
  );
};
