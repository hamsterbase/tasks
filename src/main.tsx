import './styles/main.css';

function loadDesktop() {
  if (location.href.includes('desktop')) {
    return true;
  }
  return sessionStorage.getItem('desktop') === 'true';
}

if (loadDesktop()) {
  import('./desktop/main').then((module) => {
    module.start();
  });
} else {
  import('./mobile/main');
}
