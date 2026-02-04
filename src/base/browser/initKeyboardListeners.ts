import { Keyboard, KeyboardInfo } from '@capacitor/keyboard';
import { checkPlatform } from './checkPlatform';

// 写入 css 变量
export async function initKeyboardListeners() {
  if (checkPlatform().isNative) {
    await Keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => {
      setTimeout(() => {
        document.documentElement.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
        document.documentElement.style.setProperty('--fab-display', `none`);
      }, 5);
    });

    await Keyboard.addListener('keyboardWillHide', () => {
      document.documentElement.style.setProperty('--keyboard-height', '0px');
      document.documentElement.style.setProperty('--fab-display', 'block');
    });
  }
}
