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
        for (el in document.getElementsByClassName('enableadblocker')) {
            try {
                document.getElementsByClassName('enableadblocker')[el].style.display = 'block';
            } catch (e) {}
        }
        for (el in document.getElementsByClassName('disableadblocker')) {
            try {
                document.getElementsByClassName('disableadblocker')[el].style.display = 'none';
            } catch (e) {}
        }
        document.getElementById('adblockerEnabled').innerHTML = "false";
    },
    enableAdblocker: () => {
        ipcRenderer.send('enable-adblocker');
        for (el in document.getElementsByClassName('enableadblocker')) {
            try {
                document.getElementsByClassName('enableadblocker')[el].style.display = 'none';
            } catch (e) {}
        }
        for (el in document.getElementsByClassName('disableadblocker')) {
            try {
                document.getElementsByClassName('disableadblocker')[el].style.display = 'block';
            } catch (e) {}
        }
        document.getElementById('adblockerEnabled').innerHTML = "true";
    },
    enableAutoLaunch: () => {
        ipcRenderer.send('enable-auto-launch');
    },
    disableAutoLaunch: () => {
        ipcRenderer.send('disable-auto-launch');
    },
    getAutoLaunch: async () => {
        return await ipcRenderer.invoke('get-auto-launch');
    },
    getBookmarks: async () => {
        return await ipcRenderer.invoke('get-bookmarks');
    },
    saveBookmarks: (data) => {
        ipcRenderer.send('save-bookmarks', data);
    }
})

// Check for forward and backward key on mouse (3,4 on mouseup)

document.addEventListener('mouseup', (e) => {
    if (e.button === 3 || e.button === 4) {
        if (e.button === 3) {
            window.history.back();
        } else {
            window.history.forward();
        }
    }
});