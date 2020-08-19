const { ipcRenderer } = require("electron");
const { DateFormat } = require("../app/Date");
const { IntAllocator } = require("../app/IntAllocator");

Icon = {
    FOLDER: 0,
    EDIT: 1,
    SETTINGS: 2,
    CLOSE: 3,
    ERROR: 4,
    getIcon: (type, classes = "", id = null) => {
        const str = `${classes.length > 0 ? "class=\"" + classes + "\" " : ""}${id != null ? "id=\"" + id + "\"" : ""}`;
        switch (type) {
            case Icon.FOLDER:
                return `<svg ${str} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`;
            case Icon.EDIT:
                return `<svg ${str} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`;
            case Icon.SETTINGS:
                return `<svg ${str} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="#fff" d="M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"/></svg>`;
            case Icon.CLOSE:
                return `<svg ${str} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
            case Icon.ERROR:
                return `<svg ${str} xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="#fff" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`;
        }
    }
}

TransitionEffect = {
    FADE: 0x01,
    SLIDE_LEFT: 0x02,
    SLIDE_RIGHT: 0x04,
    SLIDE_TOP: 0x08,
    SLIDE_BOTTOM: 0x10
}

class CommitCache {

    constructor(view) {
        this.commits = [];
        this.view = view;
        this.lineAllocator = new IntAllocator();
    }

    addAll(...commits) {
        const coms = commits.map(commit => new Commit(commit, this)).filter((commit) => this.commits.filter((cm) => cm.id === commit.id).length === 0);
        this.commits.push(...coms);
        coms.forEach(com => com.display());
    }

    getCommit(id) {
        const cms = this.commits.filter((commit) => commit.id === id);
        return cms.length > 0 ? cms[0] : null;
    }

}

class Commit {

    constructor(raw, cache) {
        this.commitCache = cache;
        this.id = raw.id;
        this.summary = raw.summary;
        this.message = raw.message;
        this.authorName = raw.authorName;
        this.authorMail = raw.authorMail;
        this.committerName = raw.committerName;
        this.committerMail = raw.committerMail;
        this.date = raw.date;
        this.parents = raw.parents;
        this.isStash = raw.isStash;
        this.stashId = raw.stashId;
        this.element = null;
        this.commitLine = -1;
        this.commitLineSize = 20;
    }

    getDescription() {
        return this.message.split(os.EOF).splice(2).join(os.EOF);
    }

    /**
     * Returns whether this is a merge commit
     */
    isBranchMerge() {
        return this.parents.length > 1;
    }

    /**
     * Returns whether the commit is a branch update (and must not alter the positions of the
     * commit lines)
     */
    isBranchUpdate() {
        return this.isBranchMerge() && this.getParents()[1].getChildren().filter((child) => child.date > this.date).length > 0;
    }
    
    /**
     * Returns whether the commit is the last of its branch (and there have been no more activity
     * since the latest merge)
     */
    isBranchHeadMerge() {
        return !this.isBranchUpdate() && this.isBranchMerge();
    }

    /**
     * Returns whether this is a split commit
     */
    isBranchSplit() {
        return this.getChildren().length > 1;
    }

    /**
     * Returns a list of all the siblings of the commit (children of the parents of the commit),
     * excluding the current one.
     */
    getSiblings() {
        return this.getParents().reduce((accumulator, value) => { accumulator.push(...value.getChildren()); return accumulator }, []).filter((commit) => commit !== this);
    }

    display() {
        if (!this.isStash) {
            this.element = this.commitCache.view.createElement(`commit-${this.id}`, "commit");
            const id = this.commitCache.view.createElement(null, "id");
            id.innerText = this.id.substr(0, 7);
            const message = this.commitCache.view.createElement(null, "message");
            message.innerText = this.summary;
            const author = this.commitCache.view.createElement(null, "author");
            author.innerText = this.authorName;
            const date = this.commitCache.view.createElement(null, "date");
            date.innerText = new DateFormat(this.date).format(this.commitCache.view.getLocale("editor.commit.date_format"));
            this.element.append(id, message, author, date);
            Ascript.getId("commit-graph").appendChild(this.element);
            this.__displayGraph();
        } else {
            const listElem = document.getElementById(`stashList`);
            if (listElem == null) return;
            const ref = this.commitCache.view.createElement(null, "ref");
            ref.innerText = this.summary;
            listElem.appendChild(ref);
        }
    }

    getChildren() {
        return this.commitCache.commits.filter((commit) => commit.parents.includes(this.id) && !commit.isStash);
    }

    getParents() {
        return this.parents.map(id => this.commitCache.getCommit(id)).filter(cm => cm != null && !cm.isStash);
    }

    getDateRelativeCommit(relation) {
        const index = this.commitCache.commits.indexOf(this) + relation;
        return (index < 0 || index >= this.commitCache.commits.length) ? null : this.commitCache.commits[index];
    }

    getPreviousCommit() {
        return this.getDateRelativeCommit(+1);
    }

    getNextCommit() {
        return this.getDateRelativeCommit(-1);
    }

    __displayGraph() {
        if (Ascript.getId(`graph-commit-${this.id}`) == null) {
            this.setupPosition();
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.id = `graph-commit-${this.id}`;

            let color = this.commitCache.view.getLocale(`editor.git.graph.color.${this.commitLine % 8}`);
            if (!/^#([a-f0-9]{3}){1,2}$/iu.test(color)) color = "#fff";
            path.setAttribute("stroke", color);
            path.setAttribute("stroke-width", "2px");
            path.setAttribute("preserveAspectRatio", "xMidYMid meet");

            const pos = this.__getPosition();
            const radius = 4;

            let dPath = "";
            for (let children of this.getChildren()) {
                const childPos = children.__getPosition();
                if (children.commitLine === this.commitLine) dPath += `M ${pos.x} ${pos.y - radius} V ${childPos === pos ? childPos.y - radius : childPos.y + radius}`;
                else if (children.isBranchHeadMerge() || (this.isBranchSplit() && children.isBranchUpdate())) {
                    dPath += `M ${pos.x} ${pos.y - radius} V ${childPos.y + this.element.clientHeight - radius} Q ${pos.x} ${childPos.y} ${pos.x + (this.commitLineSize - radius) * (this.commitLine > children.commitLine ? -1 : 1)} ${childPos.y} H ${childPos.x + (this.commitLine > children.commitLine ? 1 : -1) * radius}`;
                } else if (this.isBranchSplit() && !children.isBranchUpdate()) {
                    dPath += `M ${pos.x + (this.commitLine > children.commitLine ? -1 : 1) * radius} ${pos.y} H ${childPos.x + (this.commitLineSize - radius) * (this.commitLine > children.commitLine ? 1 : -1)} Q ${childPos.x} ${pos.y} ${childPos.x} ${childPos.y + radius}`
                }
            }
            
            path.setAttribute("d", `${dPath} M ${pos.x - radius} ${pos.y} a ${radius} ${radius} 0 1 0 ${radius * 2} 0 a ${radius} ${radius} 0 1 0 ${radius * -2} 0 Z`);
            
            const elem = Ascript.getId("graphic-graph");
            if (elem.style.maxWidth == "" || Number.parseFloat(elem.style.maxWidth.substr(-3)) < this.commitLine * this.commitLineSize)
                elem.style.maxWidth = `${(this.commitLine + 1) * this.commitLineSize}px`;
            elem.appendChild(path);
        }
    }

    __getPosition() {
        return {
            x: this.element.getBoundingClientRect().left - this.element.parentElement.getBoundingClientRect().left + this.element.clientHeight / 2 + this.commitLine * this.commitLineSize,
            y: this.element.getBoundingClientRect().top - this.element.parentElement.getBoundingClientRect().top + this.element.clientHeight / 2
        }
    }

    setupPosition() {

        // Places the commit in the line of its parent (if line is not already set)
        if (this.getNextCommit() != null && this.getChildren().length > 0 && this.commitLine < 0) {
            this.commitLine = this.getChildren()[0].commitLine;
        } else if (this.commitLine < 0) {
            this.commitLine = this.commitCache.lineAllocator.allocate();
        }

        if (this.isBranchSplit()) {
            // Manages branch split (or new branch)
            const children = Array.from(this.getChildren());
            children.splice(0, 1);
            children.filter((child) => !child.isBranchUpdate() || child.getParents()[1] != this).forEach((child) => this.commitCache.lineAllocator.release(child.commitLine));
        }

        if (this.isBranchHeadMerge()) {
            // Manages branch merge
            const parents = Array.from(this.getParents());
            parents.splice(0, 1);
            parents.forEach((parent) => {
                parent.commitLine = this.commitCache.lineAllocator.allocate();
            });
        }

        /* DEBUG 
        const debug = this.commitCache.view.createElement(null);
        debug.innerText = this.commitCache.lineAllocator.allocated.length + " lines " + this.getParents().length + " parents " + this.getChildren().length + " children " + this.getSiblings().length + " siblings" + (this.isBranchUpdate() ? " branchUpdate" : '') + (this.isBranchHeadMerge() ? " headMerge" : '' + (this.isBranchSplit() ? " split" : ''));
        this.element.prepend(debug); */
    }
}

class View {

    constructor() {
        this.isLoading = true;
        this.recentRepos = new Array();
        this.commitCache = new CommitCache(this);
        const recents = ipcRenderer.sendSync("lifecycle", "queryRecents");
        if (recents.length != null)
            for (let i = 0; i < recents.length; i += 2)
                this.recentRepos.push({
                    name: recents[i],
                    path: recents[i + 1]
                })
    }

    setLoaded(loaded) {
        if (this.isLoading && loaded)
            Ascript.fadeOutElement(Ascript.getClass("splash")[0], true);
        this.isLoading = !loaded;
    }

    addRecent(path, name) {
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

    createElement(id, ...classes) {
        const elem = document.createElement("div");
        if (id != null)
            elem.id = id;
        elem.classList.add(...classes);
        return elem;
    }

    createCard(id, iconType, title, content, onclick = null) {
        const card = this.createElement(id, "card", "smooth");
        if (iconType != null) {
            card.innerHTML = Icon.getIcon(iconType, "icon");
            for (const path of card.getElementsByTagName("svg")[0].children)
                if (path instanceof SVGPathElement)
                    path.style.strokeDasharray = path.style.strokeDashoffset = path.getTotalLength();
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

    setTitle(title) {
        Ascript.getId("appBar").getElementsByClassName("title")[0].innerText = title;
    }

    loadMainMenu() {
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
        quickStartList.appendChild(this.createCard("card_one", Icon.FOLDER, this.getLocale("editor.menu.quickstart.open"), this.getLocale("editor.menu.quickstart.open.description"), () => ipcRenderer.send("lifecycle", "openRepoSelector")));
        quickStartList.appendChild(this.createCard("card_two", Icon.SETTINGS, this.getLocale("editor.menu.quickstart.settings"), this.getLocale("editor.menu.quickstart.settings.description"), () => ipcRenderer.send("lifecycle", "undefined")));
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
                    ipcRenderer.send("lifecycle", "loadRecent", number);
                }));
            });
        }
        contents.appendChild(recentList);
        appContainer.appendChild(contents);
        document.getElementsByTagName("body")[0].appendChild(appContainer);
        this.setLoaded(true);
    }

    loadRepository(path, name) {
        this.setTitle(`${this.getLocale("editor.app.title")} ${this.getLocale("editor.app.title.open")} ${name}`);
        const getActionElement = (name, iconType, onclick = () => { }) => {
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
        menuBar.appendChild(getActionElement(this.getLocale("editor.bar.action_1"), Icon.FOLDER));
        menuBar.appendChild(getActionElement(this.getLocale("editor.bar.action_2"), Icon.EDIT));
        menuBar.appendChild(getActionElement(this.getLocale("editor.bar.action.close"), Icon.CLOSE, () => ipcRenderer.send("lifecycle", "closeRepo")));
        header.appendChild(menuBar);
        appContainer.appendChild(header);

        // Contents
        const containerContents = this.createElement("containerContents", "containerContents");
        const networkList = this.createElement("networkList", "networkList", "verticalList");
        const localBranches = this.createElement("headsList", "list");
        localBranches.innerText = this.getLocale("editor.git.branch.name");
        const remotes = this.createElement("remotesList", "list");
        remotes.innerText = this.getLocale("editor.git.remote.name");
        const tags = this.createElement("tagsList", "list");
        tags.innerText = this.getLocale("editor.git.tag.name");
        const stashes = this.createElement("stashList", "list");
        stashes.innerText = this.getLocale("editor.git.stash.name");
        networkList.append(localBranches, remotes, tags, stashes);
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
        ipcRenderer.send("lifecycle", "queryNetwork");
        ipcRenderer.send("lifecycle", "updateGraph");

        document.getElementsByTagName("body")[0].appendChild(appContainer);
        this.setLoaded(true);
    }

    registerNetworkPart(refName) {
        if (refName.indexOf("stash") < 0) {
            const match = refName.match(/refs\/([^\/]+)/mu);
            if (match == null || match.length < 1) return;
            const listElem = document.getElementById(`${match[1]}List`);
            if (listElem == null) return;
            const ref = this.createElement(null, "ref");
            ref.innerText = refName.substr(match[0].length + 1);
            if (match[1] === "heads") {
                ref.addEventListener('dblclick', () => {
                    ipcRenderer.send("lifecycle", "checkout", refName);
                });
                Ascript.addRippleListener(ref);
            }
            listElem.appendChild(ref);
        }
    }

    clearView(transition = TransitionEffect.FADE | TransitionEffect.SLIDE_RIGHT) {
        this.removeElement(document.getElementById("appContainer"), transition);
        this.commitCache = new CommitCache(this);
    }

    getLocale(string_id) {
        return ipcRenderer.sendSync("localeString", string_id);
    }

    removeElement(elem, animation, duration = ".5") {

        // Id is reset because the item is supposed to be gone
        elem.id = null;

        const isFading = animation % 2 == 1;
        const isSlidingLeft = (animation >> 1) % 2 == 1;
        const isSlidingRight = (animation >> 2) % 2 == 1;
        const isSlidingTop = (animation >> 3) % 2 == 1;
        const isSlidingBottom = (animation >> 4) % 2 == 1;

        if (isSlidingLeft && isSlidingRight || isSlidingTop && isSlidingBottom)
            throw new Error(`Incompatible directions: flag ${animation} is invalid.`);

        if (elem.fadeTimeout != null)
            clearTimeout(elem.fadeTimeout);

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

        elem.fadeTimeout = setTimeout(() => {
            if (elem.parentElement != null)
                elem.parentElement.removeChild(elem);
        }, 800);

    }

}

const view = new View();

window.onload = () => {
    Ascript.getId("loaderText").innerText = view.getLocale("editor.app.loading");
    ipcRenderer.send("lifecycle", "init");
    ipcRenderer.on("lifecycle", (event, status, ...args) => {
        if (status === "mainMenu")
            view.loadMainMenu();
        if (status === "openRepo")
            view.loadRepository(args[0], args[1]);
        if (status === "registerNetworkPart")
            view.registerNetworkPart(args[0]);
        if (status === "executed")
            new Ascript.Notification(args[0]).setBackground("#2ad500").setDuration(2).send();
        if (status === "maximized")
            Ascript.getId("windowIconMaximize").classList.add("maximized");
        if (status === "unmaximized")
            Ascript.getId("windowIconMaximize").classList.remove("maximized");
        if (status === "updateGraph")
            view.commitCache.addAll(...args);
    });
    ipcRenderer.on("error", (event, error) => {
        new Ascript.Notification(`${Icon.getIcon(Icon.ERROR, 'ic')} ${error}`).setBackground("#f00").send();
    });
    Ascript.getId("windowIconClose").addEventListener('click', () => {
        ipcRenderer.send("lifecycle", "exitApp");
    });
    Ascript.getId("windowIconMinimize").addEventListener('click', () => {
        ipcRenderer.send("lifecycle", "minimizeApp");
    });
    Ascript.getId("windowIconMaximize").addEventListener('click', () => {
        ipcRenderer.send("lifecycle", "maximizeApp");
    })
}