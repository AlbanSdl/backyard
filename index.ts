import { app, BrowserWindow } from "electron";
import { i18n } from "./src/app/i18n";
import { IPC } from "./src/app/Ipc";
import { Settings } from "./src/app/Settings";

app.setAppUserModelId("fr.asdl.backyard");

export class Backyard {

    public readonly i18n: i18n;
    public window: BrowserWindow;
    public readonly settings: Settings;

    constructor() {
        this.settings = new Settings();
        this.i18n = new i18n(<string> this.settings.get("editor.lang", "en"));
        this.window = null;
    }

    public init(): void {
        this.window = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true
            },
            show: false,
            frame: false
        });
        if (this.settings.get("editor.maximized", true))
            this.window.maximize();
        else
            this.window.show();
        this.window.menuBarVisible = false;
        this.window.loadFile('./src/view/index.html');
        this.window.on("closed", () => {this.window = null});
        new IPC(this);

        this.window.on('maximize', () => {
            this.window.webContents.send("lifecycle", "maximized");
            this.settings.set("editor.maximized", true);
        })
        this.window.on('unmaximize', () => {
            this.window.webContents.send("lifecycle", "unmaximized");
            this.settings.set("editor.maximized", false);
        })
    }

}

const backyard = new Backyard();

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
});
app.on('activate', () => {
    if (backyard.window === null) backyard.init()
});

app.whenReady().then(() => backyard.init());