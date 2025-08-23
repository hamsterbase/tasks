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

export function calculateElementWidth(className: string): number {
  const div = document.createElement('div');
  div.className = className;
  div.textContent = '你好World';
  div.style.visibility = 'hidden';
  div.style.position = 'absolute';
  div.style.height = 'auto';

  document.body.appendChild(div);
  const width = div.getBoundingClientRect().width;
  document.body.removeChild(div);

  return width;
}
