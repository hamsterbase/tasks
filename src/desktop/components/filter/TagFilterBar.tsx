import { TAG_FILTER_ALL, TAG_FILTER_UNTAGGED, TagFilter, isSameTagFilter } from './tagFilter';
import { TagIcon } from '@/components/icons';
import { desktopStyles } from '@/desktop/theme/main';
import classNames from 'classnames';
import { localize } from '@/nls';
import React from 'react';

interface TagFilterBarProps {
  tags: string[];
  selected: TagFilter;
  onSelect: (next: TagFilter) => void;
}

export const TagFilterBar: React.FC<TagFilterBarProps> = ({ tags, selected, onSelect }) => {
  const renderChip = (label: string, value: TagFilter, key: string) => {
    const isActive = isSameTagFilter(selected, value);
    return (
      <button
        type="button"
        key={key}
        onClick={() => onSelect(value)}
        className={classNames(
          desktopStyles.tagFilterBarChip,
          isActive ? desktopStyles.tagFilterBarChipActive : desktopStyles.tagFilterBarChipIdle
        )}
      >
        {label}
      </button>
    );
  };

  return (
    <div className={desktopStyles.tagFilterBarContainer}>
      <span className={desktopStyles.tagFilterBarIcon}>
        <TagIcon className={desktopStyles.tagFilterBarIconSvg} strokeWidth={1.5} />
      </span>
      {renderChip(localize('project.tagFilter.all', 'All'), TAG_FILTER_ALL, '__all__')}
      {tags.map((tag) => renderChip(tag, { type: 'tag', value: tag }, `tag:${tag}`))}
      {renderChip(localize('project.tagFilter.untagged', 'No Tags'), TAG_FILTER_UNTAGGED, '__untagged__')}
    </div>
  );
};
