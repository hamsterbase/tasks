import { ItemTag, ItemTagProps } from '@/desktop/components/todo/ItemTag';
import React from 'react';

interface ItemTagsListProps {
  tags: ItemTagProps[];
  isSelected?: boolean;
  maxVisibleTags?: number;
}

export const ItemTagsList: React.FC<ItemTagsListProps> = ({ tags, isSelected, maxVisibleTags = 6 }) => {
  if (tags.length === 0) return null;
  return (
    <div className="flex gap-2 items-center">
      {tags.slice(0, maxVisibleTags).map((tag) => {
        return <ItemTag isSelected={isSelected} key={tag.label} label={tag.label} icon={tag.icon} />;
      })}
      {tags.length > maxVisibleTags && <ItemTag isSelected={isSelected} label={`+${tags.length - maxVisibleTags}`} />}
    </div>
  );
};
