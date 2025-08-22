import { desktopStyles } from '@/desktop/theme/main';

// Desktop calendar layout constants
export const DAY_CELL_HEIGHT = calculateElementHeight(desktopStyles.DatePickerOverlayDayButton);
export const MONTH_HEADER_HEIGHT = calculateElementHeight(desktopStyles.DatePickerOverlayMonthHeaderTitle);
export const SCROLL_CONTAINER_HEIGHT = calculateElementHeight(desktopStyles.DatePickerOverlayScrollContainer);

export function calculateElementHeight(className: string): number {
  const div = document.createElement('div');
  div.className = className;
  div.textContent = '你好World';
  div.style.visibility = 'hidden';
  div.style.position = 'absolute';
  div.style.width = 'auto';

  document.body.appendChild(div);
  const height = div.getBoundingClientRect().height;
  document.body.removeChild(div);

  return height;
}
