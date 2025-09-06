export function getCaretIndexAtX(span: HTMLSpanElement, content: string, x: number) {
  const rect = span.getBoundingClientRect();
  const clickX = x - rect.left;

  const getCharacterPositionX = (index: number): number => {
    if (!span.firstChild) return 0;

    const range = document.createRange();
    const textNode = span.firstChild;

    if (index === 0) {
      range.setStart(textNode, 0);
      range.setEnd(textNode, 0);
    } else {
      range.setStart(textNode, 0);
      range.setEnd(textNode, Math.min(index, content.length));
    }

    const rangeRect = range.getBoundingClientRect();
    return rangeRect.right - rect.left;
  };

  let left = 0;
  let right = content.length;
  let position = 0;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const charX = getCharacterPositionX(mid);

    if (charX <= clickX) {
      position = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  if (position < content.length) {
    const currentCharX = getCharacterPositionX(position);
    const nextCharX = getCharacterPositionX(position + 1);
    const currentDistance = Math.abs(clickX - currentCharX);
    const nextDistance = Math.abs(clickX - nextCharX);

    if (nextDistance < currentDistance) {
      position = position + 1;
    }
  }
  return position;
}
