export const handleFocusAndScroll = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  setTimeout(() => {
    const element = e.target as HTMLElement;
    const keyboardHeight = document.documentElement.style.getPropertyValue('--keyboard-height');
    if (typeof keyboardHeight !== 'string') {
      return;
    }
    const keyboardHeightNumber = parseInt(keyboardHeight.replace('px', ''));
    const rect = element.getBoundingClientRect();
    const bottom = rect.bottom;
    if (keyboardHeightNumber > 0 && element) {
      if (window.innerHeight - bottom < keyboardHeightNumber) {
        window.scrollBy({
          top: keyboardHeightNumber - (window.innerHeight - bottom) + rect.height * 2,
          behavior: 'smooth',
        });
      }
    }
  }, 100);
};
