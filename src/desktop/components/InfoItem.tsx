import React from 'react';
import { CopyIcon } from '@/components/icons';

interface InfoItemProps {
  label: string;
  value: string;
  showCopyButton?: boolean;
  onCopy?: (value: string) => void;
}

export const InfoItem: React.FC<InfoItemProps> = ({ label, value, showCopyButton = false, onCopy }) => {
  const handleCopyValue = () => {
    if (onCopy) {
      onCopy(value);
    }
  };

  return (
    <div className="flex flex-row justify-between items-center gap-3 w-full h-5 font-normal text-balance leading-5">
      <span className="text-t3">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-t1">{value}</span>
        {showCopyButton && (
          <button onClick={handleCopyValue} className="text-t3 hover:text-t1 transition-colors" aria-label="Copy">
            <CopyIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
