import { LeftIcon } from '@/components/icons';
import React from 'react';
import { Link } from 'react-router';

interface BackButtonProps {
  label: string;
  to: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ label, to }) => {
  return (
    <Link
      to={to}
      className="flex flex-row items-center h-12 no-underline text-t1 hover:bg-bg2 mb-2 rounded-lg px-3 w-fit"
    >
      <div className="flex flex-row items-center gap-1">
        <div className="w-6 h-6 flex items-center justify-center">
          <LeftIcon />
        </div>
        <span className="text-xl leading-5">{label}</span>
      </div>
    </Link>
  );
};
