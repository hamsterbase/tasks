import { LeftIcon } from '@/components/icons';
import { desktopStyles } from '@/desktop/theme/main';
import React from 'react';
import { Link } from 'react-router';

interface BackButtonProps {
  label: string;
  to: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ label, to }) => {
  return (
    <Link to={to} className={desktopStyles.BackButtonLink}>
      <div className={desktopStyles.BackButtonContainer}>
        <div className={desktopStyles.BackButtonIcon}>
          <LeftIcon />
        </div>
        <span className={desktopStyles.BackButtonLabel}>{label}</span>
      </div>
    </Link>
  );
};
