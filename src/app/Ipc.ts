import { ipcMain, dialog, app } from "electron";
import { Backyard } from "index";
import git = require('nodegit');
import { sep } from "path";

export class IPC {

    private readonly backyard: Backyard;
    private repo: git.Repository;

    constructor(backyard: Backyard) {
        this.backyard = backyard;
        this.init();
        this.repo = null;
    }

    private init(): void {
        ipcMain.on("init", (event) => {
            const repoPath = <string> this.backyard.settings.get("editor.currentPath");
                if (repoPath != null)
                    this.openRepository(repoPath, event);
                else
                    event.reply("lifecycle", "mainMenu");
        });

        ipcMain.on("queryRecents", (event) => {
            const arr = new Array();
                for (let i = 0; i < 9; i++) {
                    const name = this.backyard.settings.get(`editor.recents.${i}.name`);
                    const path = this.backyard.settings.get(`editor.recents.${i}.path`);
                    if (name != null && path != null) {
                        arr.push(name);
                        arr.push(path);
                    }
                }
                event.returnValue = arr;
        });

        ipcMain.on("openRepoSelector", (event) => {
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
        });

        ipcMain.on("loadRecent", (event, ...args) => {
            if (args.length > 0)
                this.openRepository(<string> this.backyard.settings.get(`editor.recents.${args[0]}.path`), event);
            else
                event.reply("error", "error.load.from_recents");
        });

        ipcMain.on("closeRepo", (event) => {
            this.backyard.settings.delete("editor.currentPath");
            this.repo = null;
            event.reply("lifecycle", "mainMenu");
        });

        ipcMain.on("queryNetwork", this.queryNetwork);

        ipcMain.on("checkout", (event, ...args) => {
            this.checkoutBranch(args[0], event);
        });

        ipcMain.on("minimizeApp", () => this.backyard.window.minimize());
        ipcMain.on("maximizeApp", () => this.backyard.window.isMaximized() ? this.backyard.window.unmaximize() : this.backyard.window.maximize());

        ipcMain.on("exitApp", () => this.backyard.window.close());

        ipcMain.on("updateGraph", (event, ...args) => {
            this.getCommitAndStashes(args.length > 0 ? args[0] : null).then((commits) => {
                event.reply("lifecycle", "updateGraph", ...commits);
            });
        });

        ipcMain.on("localeString", (event, id) => {
            event.returnValue = this.getLocaleString(id);
        });
    }

    protected getLocaleString(id: string): string {
        return this.backyard.i18n.getLocaleString(id);
    }

    private openRepository(path: string, event: Electron.IpcMainEvent) {
        try {
            const regexp = new RegExp("^.*\\" + sep + "(.+?)$", "mug");
            const repoName = regexp.exec(path)[1];
            git.Repository.open(path).catch((reason) => event.reply("error", reason)).then((repo: git.Repository) => {
                if (repo != null && repoName != null) {
                    this.repo = repo;
                    this.addRecent(path, repoName);
                    this.backyard.settings.set("editor.currentPath", path);
                    repo.getCurrentBranch().then((head) => {
                        event.reply("lifecycle", "openRepo", path, repoName, head.toString());
                    })
                }
            });
        } catch (ex) {
            console.log(ex);
            event.reply("error", this.getLocaleString("error.loading.invalid.path"))
        }
    }

    private queryNetwork(event: Electron.IpcMainEvent) {
        if (this.repo != null)
            this.repo.getReferenceNames(git.Reference.TYPE.LISTALL).then((refs) => {
                refs.forEach((refName) => {
                    this.repo.getBranchCommit(refName).then(commit => {
                        event.reply("lifecycle", "registerNetworkPart", refName, commit.toString());
                    });
                })
            })
    }

    private checkoutBranch(ref: string, event: Electron.IpcMainEvent) {
        this.repo.checkoutBranch(ref, {
            checkoutStrategy: git.Checkout.STRATEGY.SAFE
        }).then(() => event.reply("lifecycle", "checkout", ref, this.getLocaleString("editor.git.checkout.complete"))).catch((err) => event.reply("error", this.getLocaleString("editor.git.checkout.error") + err));
    }

    private addRecent(repoPath: string, repoName: string) {
        let max = 8;
        for (let i = 0; i < 8; i++) {
            const name = this.backyard.settings.get(`editor.recents.${i}.name`);
            const path = this.backyard.settings.get(`editor.recents.${i}.path`);
            if (name === null || path === null || (name === repoName && path === repoPath)) {
                max = i;
                break;
            }
        }
        for (let i = max; i > 0; i--) {
            const name = this.backyard.settings.get(`editor.recents.${i - 1}.name`);
            const path = this.backyard.settings.get(`editor.recents.${i - 1}.path`);
            if (name != null && path != null) {
                this.backyard.settings.set(`editor.recents.${i}.name`, name);
                this.backyard.settings.set(`editor.recents.${i}.path`, path);
            }
        }
        this.backyard.settings.set(`editor.recents.0.path`, repoPath);
        this.backyard.settings.set(`editor.recents.0.name`, repoName);
    }

    private async getCommitAndStashes(name: string = null) {
        const arr = [];
        const walker = git.Revwalk.create(this.repo);
        walker.pushGlob(`refs/${name != null ? name : '*'}/*`);
        walker.sorting(git.Revwalk.SORT.TOPOLOGICAL | git.Revwalk.SORT.TIME); 
        arr.push(...(await walker.getCommitsUntil(() => true)).map(commit => ({
            id: commit.toString(),
            summary: commit.summary(),
            message: commit.message(),
            authorName: commit.author().name(),
            authorMail: commit.author().email(),
            committerName: commit.committer().name(),
            committerMail: commit.committer().email(),
            date: commit.date(),
            parents: commit.parents().map((oid: git.Oid) => oid.tostrS()),
            isStash: false
        })));
        await git.Stash.foreach(this.repo, async (nb: number, message: string, oid: git.Oid) => {
            await this.repo.getCommit(oid).then((stash) => {
                arr.push({
                    id: stash.toString(),
                    stashId: nb,
                    summary: stash.summary(),
                    message: stash.message(),
                    authorName: stash.author().name(),
                    authorMail: stash.author().email(),
                    committerName: stash.committer().name(),
                    committerMail: stash.committer().email(),
                    date: stash.date(),
                    parents: stash.parents().map(oid => oid.tostrS()),
                    isStash: true
                });
            });
        });
        return arr;
    }

}