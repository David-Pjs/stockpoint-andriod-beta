const { contextBridge, ipcRenderer } = require('electron');

/**
 * Secure preload script for Electron
 * This exposes only specific, validated APIs to the renderer process
 * NEVER expose the entire ipcRenderer or Node.js APIs
 */

// SECURITY: Whitelist of allowed IPC channels
const ALLOWED_CHANNELS = {
  invoke: ['get-app-version', 'get-app-path'],
  send: ['app-message'],
  on: ['app-notification'],
};

// SECURITY: Validate channel before allowing IPC
function isAllowedChannel(channel, type) {
  return ALLOWED_CHANNELS[type]?.includes(channel);
}

// Expose secure API to renderer
contextBridge.exposeInMainWorld('electron', {
  // App information
  isElectron: true,
  platform: process.platform,

  // Secure IPC invoke (async, returns promise)
  invoke: async (channel, ...args) => {
    if (!isAllowedChannel(channel, 'invoke')) {
      throw new Error(`IPC channel '${channel}' is not allowed`);
    }
    return await ipcRenderer.invoke(channel, ...args);
  },

  // Secure IPC send (one-way, no response)
  send: (channel, data) => {
    if (!isAllowedChannel(channel, 'send')) {
      throw new Error(`IPC channel '${channel}' is not allowed`);
    }
    ipcRenderer.send(channel, data);
  },

  // Secure IPC listener (receive messages from main)
  on: (channel, callback) => {
    if (!isAllowedChannel(channel, 'on')) {
      throw new Error(`IPC channel '${channel}' is not allowed`);
    }
    const subscription = (event, ...args) => callback(...args);
    ipcRenderer.on(channel, subscription);

    // Return unsubscribe function
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
});

// Expose environment info
contextBridge.exposeInMainWorld('env', {
  NODE_ENV: process.env.NODE_ENV || 'production',
  isDev: process.env.NODE_ENV === 'development',
});

console.log('✓ Preload script loaded securely');
