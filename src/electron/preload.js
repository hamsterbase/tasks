// eslint-disable-next-line @typescript-eslint/no-require-imports, no-undef
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),

  // Generic service channel
  serviceChannel: {
    call: async (request) => {
      const result = await ipcRenderer.invoke('service-channel-call', request);
      
      // Check if the result is an error
      if (result && result.__isError) {
        const error = new Error(result.message);
        if (result.stack) {
          error.stack = result.stack;
        }
        throw error;
      }
      
      return result;
    },
  },
});
