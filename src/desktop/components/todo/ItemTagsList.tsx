import { ItemTag, ItemTagProps } from '@/desktop/components/todo/ItemTag';
import { desktopStyles } from '@/desktop/theme/main';
import React from 'react';
import { ItemTone } from '@/components/todo/itemStatusVisual';

interface ItemTagsListProps {
  tags: ItemTagProps[];
  isSelected?: boolean;
  maxVisibleTags?: number;
  tone?: ItemTone;
}

export const ItemTagsList: React.FC<ItemTagsListProps> = ({ tags, isSelected, maxVisibleTags = 6, tone = 't2' }) => {
  if (tags.length === 0) return null;
  return (
    <div className={desktopStyles.ItemTagsListContainer}>
      {tags.slice(0, maxVisibleTags).map((tag) => {
        return (
          <ItemTag
            isSelected={isSelected}
            key={tag.label}
            label={tag.label}
            icon={tag.icon}
            isDanger={tag.isDanger && tone !== 't3'}
            tone={tone}
          />
        );
      })}
      {tags.length > maxVisibleTags && (
        <ItemTag isSelected={isSelected} label={`+${tags.length - maxVisibleTags}`} tone={tone} />
      )}
    </div>
  );
};
