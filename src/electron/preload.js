const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),
});