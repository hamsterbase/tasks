interface FindTextPositionOptions {
  x: number;
  y: number;
  originalText: string;
}

/**
 * Finds the text position in the original text based on click coordinates in a rendered element
 */
export function findTextPositionFromCoordinates({ x, y, originalText }: FindTextPositionOptions): number {
  let range: Range | null = null;

  if (document.caretPositionFromPoint) {
    const caretPosition = document.caretPositionFromPoint(x, y);
    if (caretPosition) {
      range = document.createRange();
      range.setStart(caretPosition.offsetNode, caretPosition.offset);
      range.collapse(true);
    }
  } else if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(x, y);
  }

  if (!range || !range.startContainer) return 0;

  const clickedNode = range.startContainer;
  const clickedOffset = range.startOffset;

  if (clickedNode.nodeType !== Node.TEXT_NODE) return 0;

  const clickedText = clickedNode.textContent || '';
  const leftPart = clickedText.substring(0, clickedOffset);
  const rightPart = clickedText.substring(clickedOffset);

  for (let i = 0; i <= originalText.length; i++) {
    const originalLeft = originalText.substring(0, i);
    const originalRight = originalText.substring(i);
    if (originalLeft.endsWith(leftPart.trim()) && originalRight.startsWith(rightPart.trim())) {
      return i;
    }
  }

  const searchText = leftPart.trim();
  if (searchText.length > 0) {
    const lastIndex = originalText.lastIndexOf(searchText);
    if (lastIndex !== -1) {
      return lastIndex + searchText.length;
    }
  }

  return 0;
}

interface CalculateScrollPositionOptions {
  position: number;
  value: string;
  width: string;
  className?: string;
}

/**
 * Calculates scroll position for a given text position
 */
export function calculateScrollPosition({ position, value, width, className }: CalculateScrollPositionOptions): number {
  const virtualTextArea = document.createElement('textarea');
  virtualTextArea.className = className || '';
  virtualTextArea.style.position = 'fixed';
  virtualTextArea.style.left = '0';
  virtualTextArea.style.top = '0';
  virtualTextArea.style.width = width;
  virtualTextArea.value = value.slice(0, position);
  document.body.appendChild(virtualTextArea);
  const scrollTop = virtualTextArea.scrollHeight;
  document.body.removeChild(virtualTextArea);
  return scrollTop;
}
