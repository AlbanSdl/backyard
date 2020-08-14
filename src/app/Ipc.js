const { ipcMain, dialog, app } = require("electron");
const Store = require("electron-store");
const settings = new Store();
const git = require('nodegit');
const { sep } = require("path");

class IPC {

    constructor(backyard) {
        this.backyard = backyard;
        this.init();
        this.repo = null;
    }

    init() {
        ipcMain.on("lifecycle", (event, status, ...args) => {
            if (status === "init") {
                const repoPath = settings.get("editor.currentPath");
                if (repoPath != null)
                    this.openRepository(repoPath, event);
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
                }
                event.returnValue = arr;
            } else if (status === "openRepoSelector") {
                const answer = dialog.showOpenDialogSync(this.backyard.window, {
                    title: this.backyard.i18n.getLocaleString("editor.app.repo.choose.title"),
                    defaultPath: app.getPath("home"),
                    buttonLabel: this.backyard.i18n.getLocaleString("editor.app.repo.choose.confirm"),
                    properties: [
                        "openDirectory",
                        "showHiddenFiles",
                        "createDirectory",
                        "promptToCreate"
                    ]
                });
                if (answer != null && answer.length > 0)
                    this.openRepository(answer[0], event);
            } else if (status === "loadRecent") {
                if (args.length > 0) {
                    this.openRepository(settings.get(`editor.recents.${args[0]}.path`), event);
                } else {
                    event.reply("error", "error.load.from_recents");
                }
            } else if (status === "closeRepo") {
                settings.delete("editor.currentPath");
                this.repo = null;
                event.reply("lifecycle", "mainMenu");
            } else if (status === "queryNetwork") {
                this.queryNetwork(event);
            } else if (status === "checkout") {
                this.checkoutBranch(args[0], event);
            } else if (status === "minimizeApp") {
                this.backyard.window.minimize();
            } else if (status === "maximizeApp") {
                if (this.backyard.window.isMaximized())
                    this.backyard.window.unmaximize();
                else
                    this.backyard.window.maximize();
            } else if (status === "exitApp") {
                this.backyard.window.close();
            } else
                event.reply("error", this.getLocaleString("error.ipc.unknown_action"));
        })

        ipcMain.on("localeString", (event, id) => {
            event.returnValue = this.getLocaleString(id);
        })
    }

    getLocaleString(id) {
        return this.backyard.i18n.getLocaleString(id);
    }

    openRepository(path, event) {
        try {
            const regexp = new RegExp("^.*\\" + sep + "(.+?)$", "mug");
            const repoName = regexp.exec(path)[1];
            git.Repository.open(path).catch((reason) => event.reply("error", reason)).then((repo) => {
                if (repo != null && repoName != null) {
                    this.repo = repo;
                    this.addRecent(path, repoName);
                    settings.set("editor.currentPath", path);
                    event.reply("lifecycle", "openRepo", path, repoName);
                }
            });
        } catch (ex) {
            event.reply("error", this.getLocaleString("error.loading.invalid.path"))
        }
    }

    queryNetwork(event) {
        if (this.repo != null)
            this.repo.getReferenceNames(git.Reference.TYPE.ALL).then((refs) => {
                refs.forEach((refName) => {
                    event.reply("lifecycle", "registerNetworkPart", refName);
                })
            })
    }

    checkoutBranch(ref, event) {
        this.repo.checkoutBranch(ref, {
            checkoutStrategy: git.Checkout.STRATEGY.SAFE
        }).then(() => event.reply("lifecycle", "executed", this.getLocaleString("editor.git.checkout.complete"))).catch((err) => event.reply("error", this.getLocaleString("editor.git.checkout.error") + err));
    }

    addRecent(repoPath, repoName) {
        let max = 8;
        for (let i = 0; i < 8; i++) {
            const name = settings.get(`editor.recents.${i}.name`);
            const path = settings.get(`editor.recents.${i}.path`);
            if (name === null || path === null || (name === repoName && path === repoPath)) {
                max = i;
                break;
            }
        }
        for (let i = max; i > 0; i--) {
            const name = settings.get(`editor.recents.${i - 1}.name`);
            const path = settings.get(`editor.recents.${i - 1}.path`);
            if (name != null && path != null) {
                settings.set(`editor.recents.${i}.name`, name);
                settings.set(`editor.recents.${i}.path`, path);
            }
        }
        settings.set(`editor.recents.0.path`, repoPath);
        settings.set(`editor.recents.0.name`, repoName);
    }

}

module.exports.IPC = IPC;