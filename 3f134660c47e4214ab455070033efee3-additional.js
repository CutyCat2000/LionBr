// preload.js

const remote = require('@electron/remote');
const { contextBridge, ipcRenderer } = require('electron')

const webContents = remote.getCurrentWebContents();


window.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.keyCode == 73) {
        event.preventDefault();
    }
});

contextBridge.exposeInMainWorld('api', {
    send: (channel, data) => ipcRenderer.invoke(channel, data),
    handle: (channel, callable, event, data) => ipcRenderer.on(channel, callable(event, data))
})