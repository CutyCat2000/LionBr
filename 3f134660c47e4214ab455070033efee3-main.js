const { app, BrowserWindow, globalShortcut, ipcMain, session, nativeTheme } = require("electron");
const path = require("path");
const fs = require('fs');
var _ = require('lodash');
const { ElectronBlocker, requestBlocker } = require('@cliqz/adblocker-electron'); // Import ElectronBlocker and requestBlocker
const fetch = require('cross-fetch');
const remoteMain = require('@electron/remote/main');
const axios = require('axios');
remoteMain.initialize();
const blocker = ElectronBlocker.fromPrebuiltAdsOnly(fetch).then((blocker) => {
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
        search: 'duckduckgo'
    }
}
if (config.theme) {
    currentTheme = config.theme;
    nativeTheme.themeSource = config.theme;
}
if (config.search) {
    searchEngine = config.search
}
app.on("ready", () => {
    app.setName("LionBr")
    win = new BrowserWindow({
        minWidth: 600,
        minHeight: 450,
        webPreferences: {
            webviewTag: true,
            nodeIntegration: true,
            enableRemoteModule: true,
            preload: path.join(__dirname, './3f134660c47e4214ab455070033efee3-additional.js'),
            devTools: false,
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
    
            if (remoteVersion !== localVersion) {
                win.webContents.send('alert-update'), '';
            }
        } catch (error) {
            console.error('Error checking for update:', error);
        }
    }
    remoteMain.enable(win.webContents)
    win.loadFile("./3f134660c47e4214ab455070033efee3-lionBrWebView.html");
    win.show();
    if (process.platform === 'win32')
    {
        app.setAppUserModelId(app.name);
    }
    app.on('browser-window-focus', function () {
        globalShortcut.register("CommandOrControl+R", () => {
            console.log("CommandOrControl+R is pressed: Shortcut Disabled");
        });
        globalShortcut.register("F5", () => {
            console.log("F5 is pressed: Shortcut Disabled");
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
        const configData = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configData);
        config.theme = theme;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log(`Theme changed to ${theme}`);
    });
    ipcMain.on('change-search', (event, engine) => {
        searchEngine = engine;
        const configPath = path.join(app.getPath('userData'), 'config.json');
        const configData = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configData);
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
    checkForUpdate();
    updateCheckInterval = setInterval(checkForUpdate, 5000);
});
