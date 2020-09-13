import { ipcRenderer } from "electron";
import { Reference } from "../git/Reference";
import { Ascript } from "../ascript";
import { Icon } from "./Icons";
import { AppContext } from "../webview";
import { CommitCache } from "./CommitCache";
import { TransitionEffect } from "./Transition";

export class View implements AppContext {

    private isLoading: boolean;
    private readonly recentRepos: Array<{ name: string, path: string }>;
    public commitCache: CommitCache;
    private readonly cachedLocales: Map<string, string>;
    public checkout: string;

    constructor() {
        this.isLoading = true;
        this.recentRepos = new Array();
        this.commitCache = new CommitCache(this);
        this.cachedLocales = new Map();
        const recents = ipcRenderer.sendSync("queryRecents");
        if (recents.length != null)
            for (let i = 0; i < recents.length; i += 2)
                this.recentRepos.push({
                    name: recents[i],
                    path: recents[i + 1]
                })
    }

    public setLoaded(loaded: boolean): void {
        if (this.isLoading && loaded)
            Ascript.fadeOutElement(<HTMLElement>document.getElementsByClassName("splash")[0], true);
        this.isLoading = !loaded;
    }

    public addRecent(path: string, name: string): void {
        this.recentRepos.filter(val => val.name === name && val.path === path).forEach((elem) => {
            this.recentRepos.splice(this.recentRepos.indexOf(elem), 1);
        });
        this.recentRepos.unshift({
            name: name,
            path: path
        })
        if (this.recentRepos.length >= 9)
            this.recentRepos.pop();
    }

    public createElement(id: string, ...classes: Array<string>): HTMLDivElement {
        const elem = document.createElement("div");
        if (id != null)
            elem.id = id;
        elem.classList.add(...classes);
        return elem;
    }

    public createCard(id: string, iconType: Icon.Type, title: string, content: string, onclick: () => any = null) {
        const card = this.createElement(id, "card", "smooth");
        if (iconType != null) {
            card.innerHTML = Icon.getIcon(iconType, "icon");
            for (const path of <any>card.getElementsByTagName("svg")[0].children)
                if (path instanceof SVGPathElement)
                    path.style.strokeDasharray = path.style.strokeDashoffset = path.getTotalLength().toString();
        }
        const details = this.createElement(null, "details");
        const name = this.createElement(null, "name");
        name.innerText = title;
        const contents = this.createElement(null, "description", "smooth");
        contents.innerHTML = content;
        details.append(name, contents);
        card.appendChild(details);
        if (onclick != null) {
            Ascript.addRippleListener(card);
            card.addEventListener('click', onclick);
        }
        return card;
    }

    public setTitle(title: string): void {
        (<HTMLElement>document.getElementById("appBar").getElementsByClassName("title")[0]).innerText = title;
    }

    public loadMainMenu(): void {
        this.clearView(TransitionEffect.FADE);
        this.setTitle(this.getLocale("editor.app.title"));
        const appContainer = this.createElement("appContainer", "appContainer");
        const header = this.createElement("containerHeader", "containerHeader");
        header.innerHTML = this.getLocale("editor.menu.title");
        appContainer.appendChild(header);
        const contents = this.createElement("containerContents", "containerContents");
        const quickStartList = this.createElement("quickStartList", "quickStartList", "verticalList");
        const quickStartHeader = this.createElement(null, "listHeader");
        quickStartHeader.innerText = this.getLocale("editor.menu.quickstart");
        quickStartList.appendChild(quickStartHeader);
        quickStartList.appendChild(this.createCard("card_one", Icon.Type.FOLDER, this.getLocale("editor.menu.quickstart.open"), this.getLocale("editor.menu.quickstart.open.description"), () => ipcRenderer.send("openRepoSelector")));
        quickStartList.appendChild(this.createCard("card_two", Icon.Type.SETTINGS, this.getLocale("editor.menu.quickstart.settings"), this.getLocale("editor.menu.quickstart.settings.description"), () => ipcRenderer.send("undefined")));
        contents.appendChild(quickStartList);
        const recentList = this.createElement("recentRepoList", "recentRepoList", "verticalList");
        const recentHeader = this.createElement(null, "listHeader");
        recentHeader.innerText = this.getLocale("editor.menu.recents");
        recentList.appendChild(recentHeader);
        if (this.recentRepos.length == 0) {
            const nothing = this.createElement(null, "listMessage");
            nothing.innerText = this.getLocale("editor.menu.recents.empty");
            recentList.appendChild(nothing);
        } else {
            this.recentRepos.forEach((repo, number) => {
                recentList.appendChild(this.createCard(`open-${repo.name.replace(/\s/, "")}`, null, repo.name, repo.path, () => {
                    ipcRenderer.send("loadRecent", number);
                }));
            });
        }
        contents.appendChild(recentList);
        appContainer.appendChild(contents);
        document.getElementsByTagName("body")[0].appendChild(appContainer);
        this.setLoaded(true);
    }

    public loadRepository(path: string, name: string, headRef: string) {
        this.setTitle(`${this.getLocale("editor.app.title")} ${this.getLocale("editor.app.title.open")} ${name}`);
        this.checkout = headRef;
        const getActionElement = (name: string, iconType: Icon.Type, onclick = () => { }) => {
            const elem = this.createElement(null, "menuItem");
            elem.innerHTML = Icon.getIcon(iconType, "icon") + `<div class="name">${name}</div>`;
            elem.addEventListener('click', onclick);
            Ascript.addRippleListener(elem);
            return elem;
        }

        this.addRecent(path, name);

        // Header
        this.clearView();
        const appContainer = this.createElement("appContainer", "appContainer");
        const header = this.createElement("containerHeader", "containerHeader", "overlay");
        const details = this.createElement(null, "details");
        const repoName = this.createElement(null, "repoName");
        const repoPath = this.createElement(null, "repoPath");
        repoName.innerText = name;
        repoPath.innerText = path;
        details.append(repoName, repoPath);
        header.appendChild(details);
        const menuBar = this.createElement(null, "menuBar");
        menuBar.appendChild(getActionElement(this.getLocale("editor.bar.action_1"), Icon.Type.FOLDER));
        menuBar.appendChild(getActionElement(this.getLocale("editor.bar.action_2"), Icon.Type.EDIT));
        menuBar.appendChild(getActionElement(this.getLocale("editor.bar.action.close"), Icon.Type.CLOSE, () => ipcRenderer.send("closeRepo")));
        header.appendChild(menuBar);
        appContainer.appendChild(header);

        // Contents
        const containerContents = this.createElement("containerContents", "containerContents");
        const networkList = this.createElement("networkList", "networkList", "verticalList");
        for (const ref of Reference.getTypes()) {
            const branch = this.createElement(`${ref.getSimpleName()}List`, "list");
            const header = this.createElement(null);
            header.innerHTML = Icon.getIcon(ref.icon) + this.getLocale(`editor.git.${ref.getSimpleName()}.name`);
            branch.appendChild(header);
            networkList.append(branch);
        }
        containerContents.appendChild(networkList);
        const graphContainer = this.createElement(null, 'commit-graph-container');
        const graphTempContainer = this.createElement(null, 'graph-container');
        const graphicGraph = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        graphicGraph.id = "graphic-graph";
        graphTempContainer.appendChild(graphicGraph);
        const graph = this.createElement("commit-graph", "commit-graph");
        graphTempContainer.appendChild(graph);
        graphContainer.appendChild(graphTempContainer);
        containerContents.appendChild(graphContainer);
        appContainer.appendChild(containerContents);

        // request network content from ipc
        ipcRenderer.send("updateGraph");
        ipcRenderer.send("queryNetwork");

        document.getElementsByTagName("body")[0].appendChild(appContainer);
        this.setLoaded(true);
    }

    public registerNetworkPart(refName: string, head: string): void {
        if (refName !== Reference.getType(refName).name)
            this.commitCache.getPlacedCommit(head).then(commit => commit.attachHead(refName, commit.isStash ? `${this.getLocale("editor.git.stash.display_name")} ${commit.stashId}` : null));
    }

    public clearView(transition: TransitionEffect = TransitionEffect.FADE | TransitionEffect.SLIDE_RIGHT): void {
        this.removeElement(document.getElementById("appContainer"), transition);
        this.commitCache = new CommitCache(this);
        Reference.REGISTRY.length = 0;
    }

    public getLocale(string_id: string): string {
        const cached = this.cachedLocales.get(string_id);
        if (cached == null)
            this.cachedLocales.set(string_id, ipcRenderer.sendSync("localeString", string_id))
        return cached ?? this.cachedLocales.get(string_id);
    }

    public mergeElements(ref_from: string, ref_to: string): void {
        new Ascript.Popup("merge").setTitle(`Merging ${ref_from} into ${ref_to}`).setContent("This is still work in progress").send();
    }

    public pushTo(ref_from: string, ref_to: string): void {
        new Ascript.Popup("merge").setTitle(`Pushing ${ref_from} to ${ref_to}`).setContent("This is still work in progress").send();
    }

    public pullTo(ref_from: string, ref_to: string): void {
        new Ascript.Popup("merge").setTitle(`Pulling ${ref_from} to ${ref_to}`).setContent("This is still work in progress").send();
    }

    public applyStash(stash_from: string, ref_to: string): void {
        new Ascript.Popup("merge").setTitle(`Applying stash ${stash_from} into ${ref_to}`).setContent("This is still work in progress").send();
    }

    public removeElement(elem: HTMLElement, animation: TransitionEffect, duration: number = .5) {

        // Id is reset because the item is supposed to be gone
        elem.id = null;

        const isFading = animation % 2 == 1;
        const isSlidingLeft = (animation >> 1) % 2 == 1;
        const isSlidingRight = (animation >> 2) % 2 == 1;
        const isSlidingTop = (animation >> 3) % 2 == 1;
        const isSlidingBottom = (animation >> 4) % 2 == 1;

        if (isSlidingLeft && isSlidingRight || isSlidingTop && isSlidingBottom)
            throw new Error(`Incompatible directions: flag ${animation} is invalid.`);

        if ((<any>elem).fadeTimeout != null)
            clearTimeout((<any>elem).fadeTimeout);

        if (isFading) elem.style.opacity = '1';
        elem.style.transition = `all ${duration}s ease-in-out`;
        if (isFading) elem.style.opacity = '0';

        if (isSlidingLeft || isSlidingRight) {
            elem.style.maxWidth = elem.style.minWidth = window.getComputedStyle(elem).getPropertyValue('width');
            elem.style.marginLeft = (isSlidingLeft ? -1 : 1) * window.innerWidth + "px";
        }

        if (isSlidingTop || isSlidingBottom) {
            elem.style.maxHeight = elem.style.minHeight = window.getComputedStyle(elem).getPropertyValue('height');
            elem.style.marginTop = (isSlidingTop ? -1 : 1) * window.innerHeight + "px";
        }

        (<any>elem).fadeTimeout = setTimeout(() => {
            if (elem.parentElement != null)
                elem.parentElement.removeChild(elem);
        }, 800);

    }

}