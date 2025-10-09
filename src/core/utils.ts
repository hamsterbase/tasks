import { LoroMap, LoroMovableList } from 'loro-crdt';
import { ModelKeys } from './enum';

export type ArrayUpdateOptions = {
  type: 'array';
  key: keyof typeof ModelKeys;
  oldValue?: string[];
  newValue: string[];
};

export type UpdateOptions =
  | ArrayUpdateOptions
  | {
      type: 'date-time';
      key: keyof typeof ModelKeys;
      oldValue?: number | null;
      newValue?: number | null;
    }
  | {
      type: 'text';
      key: keyof typeof ModelKeys;
      oldValue?: string;
      newValue?: string;
    };

export function updateTaskItem(map: LoroMap, options: UpdateOptions[]) {
  options.forEach((option) => {
    switch (option.type) {
      case 'array': {
        updateArray(map, {
          type: 'array',
          newValue: option.newValue,
          oldValue: option.oldValue,
          key: option.key as keyof typeof ModelKeys,
        });
        break;
      }
      case 'date-time':
        if (typeof option.newValue === 'number' && option.oldValue !== option.newValue) {
          map.set(option.key, option.newValue);
        }
        if (option.newValue === null && option.oldValue !== null) {
          map.delete(option.key);
        }
        break;

      case 'text':
        if (typeof option.newValue === 'string' && option.oldValue !== option.newValue) {
          map.set(option.key, option.newValue);
        }
        break;
    }
  });
}

function updateArray(map: LoroMap, options: ArrayUpdateOptions) {
  const { oldValue, newValue, key } = options;
  if (!newValue || JSON.stringify(oldValue!.sort()) === JSON.stringify(newValue.sort())) {
    return;
  }
  const tags = map.get(key) as LoroMovableList<string>;
  oldValue?.forEach((tag) => {
    if (!newValue.includes(tag)) {
      const index = tags.toArray().indexOf(tag);
      tags.delete(index, 1);
    }
  });
  newValue.forEach((tag) => {
    if (!tags.toArray().includes(tag)) {
      tags.push(tag);
    }
  });
}

export const PathTypeMap = {
  title: 'text',
  notes: 'text',
  dueDate: 'date-time',
  startDate: 'date-time',
  tags: 'array',
  archivedDate: 'date-time',
} as const;

export function patch<A, B, C extends Record<string, unknown>>(
  a: A,
  b: B,
  map: LoroMap<C>,
  keys: (keyof A & keyof B & keyof typeof PathTypeMap)[]
) {
  updateTaskItem(
    map,
    keys.map((key): UpdateOptions => {
      return {
        type: PathTypeMap[key],
        key,
        // @eslint-disable-next-line
        // @ts-expect-error TypeScript can't infer the correct type for the key access
        oldValue: a[key],
        // @eslint-disable-next-line
        // @ts-expect-error TypeScript can't infer the correct type for the key access
        newValue: b[key],
      };
    })
  );
}
