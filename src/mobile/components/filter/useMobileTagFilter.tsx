import { CheckIcon, FilterIcon, TagIcon } from '@/components/icons';
import type { HeaderAction } from '@/mobile/components/PageHeader';
import { PopupActionItem } from '@/mobile/overlay/popupAction/PopupActionController';
import { usePopupAction } from '@/mobile/overlay/popupAction/usePopupAction';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import { TestIds } from '@/testIds';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TagFilterBar } from './TagFilterBar';
import { TAG_FILTER_ALL, TAG_FILTER_UNTAGGED, TagFilter, isSameTagFilter } from './tagFilter';

function isSameTags(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((tag, index) => tag === b[index]);
}

export interface MobileTagFilter {
  /** The active filter value, pass it into the core `getXxxItems({ tags })` call. */
  value: TagFilter;
  /**
   * Feed the latest full tag list (returned from the core state function) back
   * into the filter. Stable identity — call it inside a `useEffect` keyed on
   * the latest tag list; the setState is guarded so unchanged lists are no-ops.
   */
  observeTags: (latestAllTags: string[]) => void;
  /** Ready-made header action, spread into `header.actions`. */
  headerAction: HeaderAction;
  /** Ready-made filter chip bar, render it at the top of the page body. */
  filterBar: React.ReactNode;
}

/**
 * Owns the whole mobile tag-filter concern: selected filter state, the
 * available-tags buffer, the filter popup menu, the header action and the
 * filter chip bar. Pages only need to pass `value` into their core state
 * function and feed the result's `allTags` back via `observeTags`.
 */
export function useMobileTagFilter(): MobileTagFilter {
  const [value, selectTag] = useState<TagFilter>(TAG_FILTER_ALL);
  const [tags, setTags] = useState<string[]>([]);
  const popupAction = usePopupAction();

  const observeTags = useCallback((latestAllTags: string[]) => {
    setTags((previousTags) => (isSameTags(previousTags, latestAllTags) ? previousTags : latestAllTags));
  }, []);

  useEffect(() => {
    if (value.type === 'tag' && !tags.includes(value.value)) {
      selectTag(TAG_FILTER_ALL);
    }
  }, [value, tags]);

  const openTagFilter = useCallback(() => {
    const makeItem = (name: string, itemValue: TagFilter): PopupActionItem => ({
      icon: isSameTagFilter(value, itemValue) ? <CheckIcon /> : <TagIcon />,
      name,
      onClick: () => selectTag(itemValue),
    });
    popupAction({
      description: localize('tasks.filterByTag', 'Filter by Tag'),
      groups: [
        {
          items: [
            makeItem(localize('project.tagFilter.all', 'All'), TAG_FILTER_ALL),
            ...tags.map((tag) => makeItem(tag, { type: 'tag', value: tag })),
            makeItem(localize('project.tagFilter.untagged', 'No Tags'), TAG_FILTER_UNTAGGED),
          ],
        },
      ],
    });
  }, [popupAction, tags, value]);

  const headerAction = useMemo<HeaderAction>(
    () => ({
      icon: <FilterIcon className={styles.headerActionButtonIcon} strokeWidth={1.5} />,
      onClick: openTagFilter,
      testId: TestIds.PageHeader.FilterButton,
      isActive: value.type !== 'all',
    }),
    [openTagFilter, value.type]
  );

  const filterBar = <TagFilterBar filter={value} onOpen={openTagFilter} onClear={() => selectTag(TAG_FILTER_ALL)} />;

  return { value, observeTags, headerAction, filterBar };
}
