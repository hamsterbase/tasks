import { useEffect, useState } from 'react';
import { TAG_FILTER_ALL, TagFilter } from './tagFilter';

function isSameTags(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((tag, index) => tag === b[index]);
}

export function useTagFilter(allTags: string[]) {
  const [currentTag, selectTag] = useState<TagFilter>(TAG_FILTER_ALL);
  const [tags, setTags] = useState(allTags);

  useEffect(() => {
    setTags((previousTags) => (isSameTags(previousTags, allTags) ? previousTags : allTags));
  }, [allTags]);

  useEffect(() => {
    if (currentTag.type === 'tag' && !tags.includes(currentTag.value)) {
      selectTag(TAG_FILTER_ALL);
    }
  }, [currentTag, tags]);

  return {
    selectTag,
    currentTag,
    tags,
  };
}
