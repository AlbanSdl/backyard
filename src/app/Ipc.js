const { ipcMain, dialog, app } = require("electron");
const Store = require("electron-store");
const settings = new Store();
const git = require('nodegit');

function setupIpcMain(backyard) {
    ipcMain.on("lifecycle", (event, status, arg1, arg2) => {
        if (status === "init") {
            const repoPath = settings.get("editor.currentPath");
            if (repoPath != null)
                git.Repository.open(repoPath).catch((reason) => event.reply("error", reason)).then((repo) => event.reply(repo.path()));
            else
                event.reply("lifecycle", "mainMenu");
        } else if (status === "queryRecents") {
            const arr = new Array();
            for (let i = 0; i < 9; i++) {
                const name = settings.get(`editor.recents.${i}.name`);
                const path = settings.get(`editor.recents.${i}.path`);
                if (name != null && path != null) {
                    arr.push(name);
                    arr.push(path);
                }
                event.returnValue = arr;
            }
        } else if (status === "addRecent") {
            for (let i = 0; i < 8; i++) {
                const name = settings.get(`editor.recents.${i}.name`);
                const path = settings.get(`editor.recents.${i}.path`);
                if (name != null && path != null) {
                    settings.set(`editor.recents.${i + 1}.name`, name);
                    settings.set(`editor.recents.${i + 1}.path`, path);
                }
                settings.set(`editor.recents.0.path`, arg1);
                settings.set(`editor.recents.0.name`, arg2);
            }
        } else if (status === "openRepoSelector") {
            console.log(dialog.showOpenDialogSync(backyard.window, {
                title: backyard.i18n.getLocaleString("editor.app.repo.choose.title"),
                defaultPath: app.getPath("home"),
                buttonLabel: backyard.i18n.getLocaleString("editor.app.repo.choose.confirm"),
                properties: [
                    "openDirectory",
                    "showHiddenFiles",
                    "createDirectory",
                    "promptToCreate"
                ]
            }))
        } else if (status === "exitApp") {
            backyard.window.close();
        } else
            event.reply("error", "Event not understood");
    })

    ipcMain.on("localeString", (event, id) => {
        event.returnValue = backyard.i18n.getLocaleString(id);
    })
}

module.exports.ipc = setupIpcMain;