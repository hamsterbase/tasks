import { styles } from '@/mobile/theme';

function getRemSize() {
  const remSize = getComputedStyle(document.documentElement).fontSize;
  return parseFloat(remSize);
}

const rate = getRemSize() / 16;

// Calendar layout constants
const DAY_CELL_HEIGHT = parseFloat(styles.datePickerDayCellHeight) * rate;
const MONTH_HEADER_HEIGHT = parseFloat(styles.datePickerMonthHeaderHeight) * rate;
const GAP_HEIGHT = parseFloat(styles.datePickerGapHeight) * rate;
const ITEM_HEIGHT = MONTH_HEADER_HEIGHT + 6 * (DAY_CELL_HEIGHT + GAP_HEIGHT);

export { ITEM_HEIGHT, DAY_CELL_HEIGHT, MONTH_HEADER_HEIGHT, GAP_HEIGHT };
