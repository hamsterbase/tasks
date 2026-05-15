import { CloseIcon, TagIcon } from '@/components/icons';
import { localize } from '@/nls';
import { styles } from '@/mobile/theme';
import React from 'react';
import { TagFilter } from './tagFilter';

interface TagFilterBarProps {
  filter: TagFilter;
  onOpen: () => void;
  onClear: () => void;
}

export const TagFilterBar: React.FC<TagFilterBarProps> = ({ filter, onOpen, onClear }) => {
  if (filter.type === 'all') {
    return null;
  }

  const label = filter.type === 'tag' ? filter.value : localize('project.tagFilter.untagged', 'No Tags');

  return (
    <div className={styles.tagFilterBarRoot}>
      <div className={styles.tagFilterBarChip} onClick={onOpen}>
        <TagIcon className={styles.tagFilterBarChipIcon} strokeWidth={1.5} />
        <span>{label}</span>
        <CloseIcon
          className={styles.tagFilterBarChipClose}
          strokeWidth={1.5}
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
        />
      </div>
    </div>
  );
};
