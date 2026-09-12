/**
 * Display prefix for a task object uid. It travels with the id whenever a user
 * copies one out of the app, so whatever receives the string — the CLI, an
 * agent — can tell it apart from a plain word.
 */
export const ITEM_ID_PREFIX = 'HT#';

/** `V1StGXR8_Z5j` -> `HT#V1StGXR8_Z5j` */
export function formatItemId(uid: string): string {
  return `${ITEM_ID_PREFIX}${uid}`;
}

/** Drops a leading `HT#` (case-insensitive). Values without the prefix pass through. */
export function stripItemIdPrefix(value: string): string {
  if (value.toUpperCase().startsWith(ITEM_ID_PREFIX)) {
    return value.slice(ITEM_ID_PREFIX.length);
  }
  return value;
}
