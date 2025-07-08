import React from 'react';

interface EmptyStateProps {
  label: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ label }) => {
  return (
    <div className="text-center py-12 text-t3">
      <p className="text-sm">{label}</p>
    </div>
  );
};