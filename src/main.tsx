import '@/locales/browser/config.ts';
import 'large-small-dynamic-viewport-units-polyfill';

import { startDesktop } from './desktop/main';
import { startMobile } from './mobile/main';
import './styles/main.css';

function loadDesktop() {
  if (location.href.includes('desktop')) {
    return true;
  }
  return sessionStorage.getItem('desktop') === 'true';
}

if (loadDesktop()) {
  startDesktop();
} else {
  startMobile();
}
