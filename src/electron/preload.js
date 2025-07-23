// eslint-disable-next-line @typescript-eslint/no-require-imports, no-undef
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),
});
