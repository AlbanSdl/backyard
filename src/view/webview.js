const { ipcRenderer } = require("electron");

Icon = {
    FOLDER: 0,
    EDIT: 1,
    SETTINGS: 2,
    getIcon: (type, classes="", id=null) => {
        const str = `${classes.length > 0 ? "class=\"" + classes + "\" " : ""}${id != null ? "id=\"" + id + "\"" : ""}`;
        switch (type) {
            case Icon.FOLDER:
                return `<svg ${str} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`;
            case Icon.EDIT:
                return `<svg ${str} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`;
            case Icon.SETTINGS:
                return `<svg ${str} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="#fff" d="M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"/></svg>`;
        }
    }
}

class View {
    
    constructor() {
        this.isLoading = true;
        this.loadedPage = null;
        this.recentRepos = new Array();
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
            Ascript.fadeOutElement(Ascript.getClass("splash")[0], true, true);
        this.isLoading = !loaded;
    }

    addRecent(path, name) {
        this.recentRepos.unshift({
            name: name,
            path: path
        })
        if (this.recentRepos.length >= 9)
            this.recentRepos.pop();
        ipcRenderer.send("lifecycle", "addRecent", path, name);
    }

    createElement(id, ...classes) {
        const elem = document.createElement("div");
        if (id != null)
            elem.id = id;
        elem.classList.add(...classes);
        return elem;
    }

    createCard(id, iconType, title, content, onclick=null) {
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
        this.clearView();
        this.setTitle(this.getLocale("editor.app.title"));
        const header = this.createElement("containerHeader", "containerHeader");
        header.innerHTML = this.getLocale("editor.menu.title");
        Ascript.getId("appContainer").appendChild(header);
        const contents = this.createElement("containerContents", "containerContents");
        const quickStartList = this.createElement("quickStartList", "quickStartList", "verticalList");
        const quickStartHeader = this.createElement(null, "listHeader");
        quickStartHeader.innerText = this.getLocale("editor.menu.quickstart");
        quickStartList.appendChild(quickStartHeader);
        quickStartList.appendChild(this.createCard("card_one", Icon.FOLDER, this.getLocale("editor.menu.quickstart.open"), this.getLocale("editor.menu.quickstart.open.description"), () => ipcRenderer.send("lifecycle", "openRepoSelector")));
        quickStartList.appendChild(this.createCard("card_two", Icon.SETTINGS, this.getLocale("editor.menu.quickstart.settings"), this.getLocale("editor.menu.quickstart.settings.description"), () => console.log("opening settings")));
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
            this.recentRepos.forEach((repo) => {
                recentList.appendChild(this.createCard(`open-${repo.name.replaceAll(/\s/, "")}`, null, repo.name, repo.path));
            });
        }
        contents.appendChild(recentList);
        Ascript.getId("appContainer").appendChild(contents);
        this.setLoaded(true);
    }

    clearView() {
        for (let child of document.getElementById("appContainer").children) {
            if (child.id !== "appBar" && !child.classList.contains("splash"))
                Ascript.fadeOutElement(child, true, false);
        }
    }

    getLocale(string_id) {
        return ipcRenderer.sendSync("localeString", string_id);
    }

}

const view = new View();

window.onload = () => {
    Ascript.getId("loaderText").innerText = view.getLocale("editor.app.loading");
    ipcRenderer.send("lifecycle", "init");
    ipcRenderer.on("lifecycle", (event, status) => {
        if (status === "mainMenu")
            view.loadMainMenu();
    });
    ipcRenderer.on("error", (event, error) => {
        console.error(error);
    });
    Ascript.getId("windowIconClose").addEventListener('click', () => {
        ipcRenderer.send("lifecycle", "exitApp");
    })
}