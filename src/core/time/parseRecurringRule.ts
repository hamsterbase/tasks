export interface RecurringDateRule {
  valid: boolean;
  from?: string;
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
}

export function parseRecurringRule(input: string): RecurringDateRule {
  if (!input) {
    return { valid: false };
  }

  const parts = input.split(':');
  if (parts.length > 2) {
    return { valid: false };
  }

  if (parts.length === 1) {
    return { ..._parseRecurringRule(parts[0]) };
  }

  return { ..._parseRecurringRule(parts[1]), from: parts[0] };
}

function _parseRecurringRule(input: string): RecurringDateRule {
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
