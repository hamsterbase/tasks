import '@/locales/browser/config.ts';
import 'large-small-dynamic-viewport-units-polyfill';

import { startDesktop } from './desktop/main';
import { startMobile } from './mobile/main';
import './styles/main.css';

function shouldLoadDesktop() {
  const pathname = location.pathname;
  if (pathname !== '/') {
    return pathname.startsWith('/desktop');
  }
  // Check if user agent matches mobile device
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

  if (isMobileDevice) {
    return false;
  }

  return true;
}

if (shouldLoadDesktop()) {
  startDesktop();
} else {
  startMobile();
}
