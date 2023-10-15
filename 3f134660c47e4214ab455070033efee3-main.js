const { app, BrowserWindow, globalShortcut, ipcMain, session, nativeTheme } = require("electron");
const path = require("path");
const fs = require('fs');
var _ = require('lodash');
const { ElectronBlocker, requestBlocker } = require('@cliqz/adblocker-electron'); // Import ElectronBlocker and requestBlocker
const fetch = require('cross-fetch');
const remoteMain = require('@electron/remote/main');
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
let currentTheme = 'light';

app.on("ready", () => {
    try {
        const configPath = path.join(__dirname, 'config.json');
        const configData = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configData);
        if (config.theme) {
            currentTheme = config.theme;
        }
    } catch (err) {
        console.error('Error reading config.json:', err);
    }
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
      
    app.commandLine.appendSwitch('no-verify-widevine-cdm')
    const isOffline = false
    const widevineDir = app.getPath('userData')
    app.on('widevine-ready', () => {
      createWindow()
    })

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
        const configPath = path.join('config.json');
        const config = { theme };
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log(`Theme changed to ${theme}`);
    });
    ipcMain.on('minimize-window', () => {
        win.minimize();
    });
});
