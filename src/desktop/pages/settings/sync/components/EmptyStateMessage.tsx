import React from 'react';

interface EmptyStateMessageProps {
  message: string;
  link?: {
    text: string;
    href: string;
  } | null;
}

export const EmptyStateMessage: React.FC<EmptyStateMessageProps> = ({ message, link }) => {
  return (
    <div className="text-center py-12 w-full">
      <p className="text-sm text-t2 mb-4 max-w-sm mx-auto">{message}</p>
      {link && (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-brand hover:text-brand/80 text-sm font-medium transition-colors"
        >
          {link.text}
        </a>
      )}
    </div>
  );
};
