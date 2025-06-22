// Desktop calendar layout constants
const DAY_CELL_HEIGHT = 24; // 6 * 4 (h-6 in tailwind)
const MONTH_HEADER_HEIGHT = 32;
const GAP_HEIGHT = 4; // gap-1
const ITEM_HEIGHT = MONTH_HEADER_HEIGHT + 6 * (DAY_CELL_HEIGHT + GAP_HEIGHT);

export { ITEM_HEIGHT, DAY_CELL_HEIGHT, MONTH_HEADER_HEIGHT, GAP_HEIGHT };
