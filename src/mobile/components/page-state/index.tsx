import React from 'react';

interface PageStateProps {
  label: string;
  link?: {
    text: string;
    href: string;
  } | null;
}

export const PageState: React.FC<PageStateProps> = ({ label, link }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm text-t2 mb-6 px-4">{label}</p>
      {link && (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand hover:text-brand/80 text-sm font-medium transition-colors"
        >
          {link.text}
        </a>
      )}
    </div>
  );
};
