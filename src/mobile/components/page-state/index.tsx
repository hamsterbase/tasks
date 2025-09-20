import React from 'react';

interface PageStateProps {
  label: string;
}

export const PageState: React.FC<PageStateProps> = ({ label }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm text-t2 mb-6 px-4">{label}</p>
    </div>
  );
};
