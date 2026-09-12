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
    // Main-process push channel. Only allowlisted channels can be subscribed
    // to; returns an unsubscribe function.
    on: (channel, callback) => {
      const allowed = ['cli-approval-queue-changed', 'cli-attachment-request'];
      if (!allowed.includes(channel)) {
        throw new Error(`channel not allowed: ${channel}`);
      }
      const listener = (_event, data) => callback(data);
      ipcRenderer.on(channel, listener);
      return () => ipcRenderer.removeListener(channel, listener);
    },
  },
});
