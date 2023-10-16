// preload.js

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    send: (channel, data) => ipcRenderer.invoke(channel, data),
    handle: (channel, callable, event, data) => ipcRenderer.on(channel, callable(event, data)),
    changeTheme: (theme) => {
      ipcRenderer.send('change-theme', theme);
    },
    changeSearchEngine: (engine) => {
        ipcRenderer.send('change-search', engine);
    },
    getSearchEngine: async () => {
        return await ipcRenderer.invoke('get-search');
    },
    minimize: () => {
        ipcRenderer.send('minimize-window');
    },
})