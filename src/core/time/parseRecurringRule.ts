export interface RecurringDateRule {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
}

/**
 * Parse recurring rule string like "1y2m3w4d" into RecurringDateRule object
 */
export function parseRecurringRule(input: string): RecurringDateRule & { valid: boolean } {
  const rule = input.trim().toLowerCase();
  if (!rule) {
    return { valid: false };
  }

  // Parse pattern like 1y2m3w4d or 1m-1d (negative days supported)
  const pattern = /(?:(\d+)y)?(?:(\d+)m)?(?:(\d+)w)?(?:(-?\d+)d)?/;
  const match = rule.match(pattern);

  if (!match || match[0] !== rule) {
    return { valid: false };
  }

  const years = match[1] ? parseInt(match[1], 10) : 0;
  const months = match[2] ? parseInt(match[2], 10) : 0;
  const weeks = match[3] ? parseInt(match[3], 10) : 0;
  const days = match[4] ? parseInt(match[4], 10) : 0;

  if (years === 0 && months === 0 && weeks === 0 && days === 0) {
    return { valid: false };
  }

  return {
    years,
    months,
    weeks,
    days,
    valid: true,
  };
}
