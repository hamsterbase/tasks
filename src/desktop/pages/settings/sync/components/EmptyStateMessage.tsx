import React from 'react';

interface EmptyStateMessageProps {
  message: string;
}

export const EmptyStateMessage: React.FC<EmptyStateMessageProps> = ({ message }) => {
  return (
    <div className="text-center py-12 w-full">
      <p className="text-sm text-t2 mb-6 max-w-sm mx-auto">{message}</p>
    </div>
  );
};
