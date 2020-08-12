const { app, BrowserWindow } = require("electron");
const { AppNotification } = require("./src/app/Notification");
const { i18n } = require("./src/app/i18n");
const { ipc } = require("./src/app/Ipc");
const Store = require("electron-store");
const settings = new Store();

class Backyard {

    constructor() {
        this.i18n = new i18n(settings.get("editor.lang", "en"));
        this.window = null;
    }

    init() {
        this.window = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true
            },
            show: false,
            frame: false
        });
        this.window.maximize()
        this.window.menuBarVisible = false;
        this.window.loadFile('./src/view/index.html');
        this.window.on("closed", () => this.window = null);
        ipc(this);

        new AppNotification("editor.notification.test.title", "editor.notification.test.content", false, "./src/resources/icon.png", null);

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') app.quit()
        });
        app.on('activate', () => {
            if (this.window === null) createWindow()
        })
    }

}

const backyard = new Backyard();

app.whenReady().then(() => backyard.init());