// Magic timestamp meaning "Someday" — midnight UTC on Dec 31, 2999.
// Used as a sentinel so we can store "no specific date, just someday" in the
// same number column as a real start/due date.
export const SOMEDAY_TIMESTAMP = Date.UTC(2999, 11, 31);

export function isSomeday(timestamp: number | null | undefined): boolean {
  return timestamp === SOMEDAY_TIMESTAMP;
}
