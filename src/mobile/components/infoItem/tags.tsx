import React from 'react';

interface InfoItemTagsProps {
  tags: string[];
}

export const InfoItemTags: React.FC<InfoItemTagsProps> = ({ tags }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span key={tag} className="text-sm text-brand">
          #{tag}
        </span>
      ))}
    </div>
  );
};
