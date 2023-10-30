const { app, BrowserWindow, globalShortcut, ipcMain, session, nativeTheme } = require("electron");
const path = require("path");
const fs = require('fs');
var _ = require('lodash');
const { ElectronBlocker, requestBlocker } = require('@cliqz/adblocker-electron'); // Import ElectronBlocker and requestBlocker
const fetch = require('cross-fetch');
const remoteMain = require('@electron/remote/main');
const axios = require('axios');
const AutoLaunch = require('auto-launch');
remoteMain.initialize();
let blocker;

ElectronBlocker.fromPrebuiltAdsOnly(fetch).then((createdBlocker) => {
    blocker = createdBlocker;
    blocker.enableBlockingInSession(session.defaultSession);
});
function setTheme(theme) {
  if (theme === 'dark') {
      nativeTheme.themeSource = 'dark';
  } else {
      nativeTheme.themeSource = 'light';
  }
}
let currentTheme;
let searchEngine = 'duckduckgo';
let updateCheckInterval;
const localVersionPath = path.join(__dirname, 'current_version.txt');
const localVersion = fs.readFileSync(localVersionPath, 'utf-8');
const configPath = path.join(app.getPath('userData'), 'config.json')
let config
try {
    const configData = fs.readFileSync(configPath, 'utf-8');
    config = JSON.parse(configData);
} catch(error) {
    config  = {
        theme: 'light',
        search: 'duckduckgo',
        autolaunch: 'false',
    }
}
if (config.theme) {
    currentTheme = config.theme;
    nativeTheme.themeSource = config.theme;
}
if (config.search) {
    searchEngine = config.search
}
if (!config.autolaunch) {
    config.autoLaunch = 'false';
}

// bookmarks

let bookmarks = [];
try {
    const bookmarksData = fs.readFileSync(path.join(app.getPath('userData'), 'bookmarks.json'), 'utf-8');
    bookmarks = JSON.parse(bookmarksData);
} catch(error) {
    bookmarks = [
        {
            'name': '',
            'url': '',
        },
        {
            'name': '',
            'url': '',
        },
        {
            'name': '',
            'url': '',
        }
    ];
}
app.on("ready", () => {
    let autoLaunch = new AutoLaunch({
        name: "LionBr",
        path: app.getPath('exe'),
    });
    autoLaunch.isEnabled().then((isEnabled) => {
        if (!isEnabled && config.autolaunch == 'true') {
            autoLaunch.enable();
        }
        else if (isEnabled && config.autolaunch == 'false') {
            autoLaunch.disable();
        }
    });
    app.setName("LionBr")
    win = new BrowserWindow({
        minWidth: 600,
        minHeight: 450,
        webPreferences: {
            webviewTag: true,
            nodeIntegration: true,
            enableRemoteModule: true,
            preload: path.join(__dirname, './additional.js'),
        },
        titleBarStyle: "hidden",
        titleBarOverlay: false,
        icon: path.join(__dirname, 'icon.png'),
        allowpopups: true,        
    });
    async function checkForUpdate() {
        try {
            const remoteVersionResponse = await axios.get('https://raw.githubusercontent.com/CutyCat2000/LionBr/main/current_version.txt');
            const remoteVersion = remoteVersionResponse.data;
            console.log(remoteVersion);
            console.log(localVersion);
    
            if (remoteVersion.toString().replace("\n","") !== localVersion.toString().replace("\n","")) {
                win.webContents.send('alert-update'), '';
            }
        } catch (error) {
            console.error('Error checking for update:', error);
        }
    }
    remoteMain.enable(win.webContents)
    win.loadFile("./lionBrWebView.html");
    win.show();
    if (process.platform === 'win32')
    {
        app.setAppUserModelId(app.name);
    }
    app.on('browser-window-focus', function () {
        globalShortcut.register("CommandOrControl+R", () => {
            win.webContents.send('reloadPage');
        });
        globalShortcut.register("F5", () => {
            win.webContents.send('reloadPage');
        });
        globalShortcut.register("CommandOrControl+Shift+I", () => {
            win.webContents.send('openDevtools');
        });
    });
    app.on('browser-window-blur', function () {
        globalShortcut.unregister('CommandOrControl+R');
        globalShortcut.unregister('F5');
    });
    app.on('web-contents-created', function (webContentsCreatedEvent, contents) {
        if (contents.getType() === 'webview') {
          contents.on('new-window', function (newWindowEvent, url) {
            console.log('block');
            newWindowEvent.preventDefault();
          });
        }
      });

    win.webContents.on("did-attach-webview", (_, contents) => {
      contents.setWindowOpenHandler((details) => {
        win.webContents.send('open-url', details.url);
        return { action: 'deny' }
      })
    });
    setTheme(currentTheme);
    ipcMain.on('change-theme', (event, theme) => {
        currentTheme = theme;
        setTheme(theme);
        const configPath = path.join(app.getPath('userData'), 'config.json');
        config.theme = theme;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log(`Theme changed to ${theme}`);
    });
    ipcMain.on('change-search', (event, engine) => {
        searchEngine = engine;
        const configPath = path.join(app.getPath('userData'), 'config.json');
        config.search = engine;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        win.webContents.send('search-changed', engine);
        console.log(`Search engine changed to ${searchEngine}`);
    });
    ipcMain.handle('get-search', (event) => {
        console.log(searchEngine)
        return searchEngine;
    });
    ipcMain.on('minimize-window', () => {
        win.minimize();
    });
    ipcMain.on('disable-adblocker', () => {
        blocker.disableBlockingInSession(session.defaultSession);
    });
    ipcMain.on('enable-adblocker', () => {
        blocker.enableBlockingInSession(session.defaultSession);
    });
    ipcMain.on('enable-auto-launch', () => {
        const configPath = path.join(app.getPath('userData'), 'config.json');
        autoLaunch.enable();
        config.autolaunch = 'true';
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log(`Auto launch enabled`);
    });
    ipcMain.on('disable-auto-launch', () => {
        const configPath = path.join(app.getPath('userData'), 'config.json');
        autoLaunch.disable();
        config.autolaunch = 'false';
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log(`Auto launch disabled`);
    });
    ipcMain.handle('get-auto-launch', () => {
        return autoLaunch.isEnabled().then((isEnabled) => {
            return isEnabled? 'enabled' : 'disabled';
        });
    });
    ipcMain.handle('get-bookmarks', () => {
        return bookmarks;
    });
    ipcMain.on('save-bookmarks', (event, data) => {
        bookmarks = data;
        const bookmarksPath = path.join(app.getPath('userData'), 'bookmarks.json');
        fs.writeFileSync(bookmarksPath, JSON.stringify(bookmarks, null, 2));
        win.webContents.send('bookmarks-update', bookmarks);
        console.log(`Bookmarks saved`);
    });
    checkForUpdate();
    updateCheckInterval = setInterval(checkForUpdate, 5000);
});
