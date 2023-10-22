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
    disableAdblocker: () => {
        ipcRenderer.send('disable-adblocker');
        document.getElementById('disableadblocker').style.display = 'none';
        document.getElementById('enableadblocker').style.display = 'block';
    },
    enableAdblocker: () => {
        ipcRenderer.send('enable-adblocker');
        document.getElementById('disableadblocker').style.display = 'block';
        document.getElementById('enableadblocker').style.display = 'none';
    }
})