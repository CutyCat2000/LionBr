const { app, BrowserWindow, globalShortcut, ipcMain } = require("electron");
const path = require("path");
var _ = require('lodash');

const remoteMain = require('@electron/remote/main');
remoteMain.initialize();

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
});
