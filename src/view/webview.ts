import { ipcRenderer } from "electron";
import { DateFormat } from "../app/Date";
import { IntAllocator } from "../app/IntAllocator";
import { EOL } from "os";
import { Ascript } from "./ascript";

namespace Icon {

    export enum Type {
        FOLDER = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M10,4h-6c-1.1,0,-1.99,0.9,-1.99,2l-0.01,12c0,1.1,0.9,2,2,2h16c1.1,0,2,-0.9,2,-2v-10c0,-1.1,-0.9,-2,-2,-2h-8l-2,-2z"/></svg>`,
        EDIT = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M3,17.25v3.75h3.75l11.06,-11.06l-3.75,-3.75l-11.06,11.06zm17.71,-10.21c0.39,-0.39,0.39,-1.02,0,-1.41l-2.34,-2.34c-0.39,-0.39,-1.02,-0.39,-1.41,0l-1.83,1.83l3.75,3.75l1.83,-1.83z"/></svg>`,
        SETTINGS = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="#fff" d="M15.95,10.78c0.03,-0.25,0.05,-0.51,0.05,-0.78s-0.02,-0.53,-0.06,-0.78l1.69,-1.32c0.15,-0.12,0.19,-0.34,0.1,-0.51l-1.6,-2.77c-0.1,-0.18,-0.31,-0.24,-0.49,-0.18l-1.99,0.8c-0.42,-0.32,-0.86,-0.58,-1.35,-0.78l-0.3,-2.12c-0.03,-0.2,-0.2,-0.34,-0.4,-0.34h-3.2c-0.2,0,-0.36,0.14,-0.39,0.34l-0.3,2.12c-0.49,0.2,-0.94,0.47,-1.35,0.78l-1.99,-0.8c-0.18,-0.07,-0.39,0,-0.49,0.18l-1.6,2.77c-0.1,0.18,-0.06,0.39,0.1,0.51l1.69,1.32c-0.04,0.25,-0.07,0.52,-0.07,0.78s0.02,0.53,0.06,0.78l-1.69,1.32c-0.15,0.12,-0.19,0.34,-0.1,0.51l1.6,2.77c0.1,0.18,0.31,0.24,0.49,0.18l1.99,-0.8c0.42,0.32,0.86,0.58,1.35,0.78l0.3,2.12c0.04,0.2,0.2,0.34,0.4,0.34h3.2c0.2,0,0.37,-0.14,0.39,-0.34l0.3,-2.12c0.49,-0.2,0.94,-0.47,1.35,-0.78l1.99,0.8c0.18,0.07,0.39,0,0.49,-0.18l1.6,-2.77c0.1,-0.18,0.06,-0.39,-0.1,-0.51l-1.67,-1.32zm-5.95,2.22c-1.65,0,-3,-1.35,-3,-3s1.35,-3,3,-3s3,1.35,3,3s-1.35,3,-3,3z"/></svg>`,
        CLOSE = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M19,6.41l-1.41,-1.41l-5.59,5.59l-5.59,-5.59l-1.41,1.41l5.59,5.59l-5.59,5.59l1.41,1.41l5.59,-5.59l5.59,5.59l1.41,-1.41l-5.59,-5.59z"/></svg>`,
        ERROR = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="#fff" d="M12,2c-5.52,0,-10,4.48,-10,10s4.48,10,10,10s10,-4.48,10,-10s-4.48,-10,-10,-10zm1,15h-2v-2h2v2zm0,-4h-2v-6h2v6z"/></svg>`,
        LAPTOP = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="#fff" d="M20,18c1.1,0,2,-0.9,2,-2v-10c0,-1.1,-0.9,-2,-2,-2h-16c-1.1,0,-2,0.9,-2,2v10c0,1.1,0.9,2,2,2h-4v2h24v-2h-4zm-16,-12h16v10h-16v-10z"/></svg>`,
        CLOUD = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="#fff" d="M19.35,10.04c-0.68,-3.45,-3.71,-6.04,-7.35,-6.04c-2.89,0,-5.4,1.64,-6.65,4.04c-3.01,0.32,-5.35,2.87,-5.35,5.96c0,3.31,2.69,6,6,6h13c2.76,0,5,-2.24,5,-5c0,-2.64,-2.05,-4.78,-4.65,-4.96z"/></svg>`,
        LABEL = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="#fff" d="M17.63,5.84c-0.36,-0.51,-0.96,-0.84,-1.63,-0.84l-11,0.01c-1.1,0,-2,0.89,-2,1.99v10c0,1.1,0.9,1.99,2,1.99l11,0.01c0.67,0,1.27,-0.33,1.63,-0.84l4.37,-6.16l-4.37,-6.16z"/></svg>`,
        STASH = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="#fff" d="M19,3h-14.01c-1.11,0,-1.98,0.89,-1.98,2l-0.01,14c0,1.1,0.88,2,1.99,2h14.01c1.1,0,2,-0.9,2,-2v-14c0,-1.11,-0.9,-2,-2,-2zm0,12h-4c0,1.66,-1.35,3,-3,3s-3,-1.34,-3,-3h-4.01v-10h14.01v10z"/></svg>`,
        STASH_POINT = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="#fff" d="M12,2c-5.53,0,-10,4.47,-10,10s4.47,10,10,10s10,-4.47,10,-10s-4.47,-10,-10,-10zm5,13.59l-1.41,1.41l-3.59,-3.59l-3.59,3.59l-1.41,-1.41l3.59,-3.59l-3.59,-3.59l1.41,-1.41l3.59,3.59l3.59,-3.59l1.41,1.41l-3.59,3.59l3.59,3.59z"/></svg>`,
        DONE = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="#fff" d="M9,16.2l-4.2,-4.2l-1.4,1.4l5.6,5.6l12,-12l-1.4,-1.4l-10.6,10.6z"/></svg>`,
    }

    export function getIcon(type: Type, classes: string = "", id: string = null): string {
        const str = `${classes.length > 0 ? "class=\"" + classes + "\" " : ""}${id != null ? "id=\"" + id + "\"" : ""} `;
        return type.slice(0, 5) + str + type.slice(5);
    }

    export function getPath(type: Type, keepMoveto: boolean = true, scale: number = 1): string {
        const path = getIcon(type).match(/\sd="(.*?)"/ui)[1];
        let ret = keepMoveto ? path : path.match(/M[0-9\s,\.]*(.*)/ui)[1];
        if (scale !== 1) {
            let regRes;
            const regex = /\d+(\.\d+)?/mug;
            let int = 0;
            while ((regRes = regex.exec(ret)) !== null && int < 100) {
                int++;
                const newValue = (Number.parseFloat(regRes[0]) * scale).toString();
                ret = ret.slice(0, regex.lastIndex - regRes[0].length) + newValue + ret.slice(regex.lastIndex);
                regex.lastIndex += newValue.length - regRes[0].length;
            }
        }
        return ret;
    }

    export function getTooltiped(type: Type, classes: string = "", content: string = "", parent?: HTMLElement) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("tooltipWrapper");
        const icon = new DOMParser().parseFromString(Icon.getIcon(type, classes), 'text/xml').firstElementChild;
        wrapper.appendChild(icon);
        if (content != "") Ascript.tooltip(wrapper, content, parent);
        return wrapper;
    }

}

namespace Reference {

    export class Type {

        public readonly name: string;
        public readonly icon: Icon.Type;
        public readonly isBranch: boolean;
        private readonly applicationTo: Map<Type, (context: Commit, from: string, to: string) => any> = new Map();

        constructor(name: string, icon: Icon.Type, isBranch: boolean) {
            this.name = name;
            this.icon = icon;
            this.isBranch = isBranch;
        }

        public getSimpleName(): string {
            return this.name.split("/").pop();
        }

        registerApplication(toType: Type, listener: (context: Commit, from: string, to: string) => any) {
            this.applicationTo.set(toType, listener);
        }

        public performOperation(context: Commit, refFrom: string, refTo: string): void {
            const computable = this.applicationTo.get(getType(refTo));
            if (computable != null) computable(context, refFrom, refTo);
        }

        public isApplicable(refTo?: string | Type): boolean {
            if (refTo == null) return this.applicationTo.size !== 0;
            if (typeof refTo === 'string') refTo = getType(refTo);
            return this.applicationTo.has(refTo);
        }

        public getApplicableTypes(): IterableIterator<Type> {
            return this.applicationTo.keys();
        }
    }

    export const HEAD = new Type("refs/heads", Icon.Type.LAPTOP, true);
    export const REMOTE = new Type("refs/remotes", Icon.Type.CLOUD, true);
    export const TAG = new Type("refs/tags", Icon.Type.LABEL, false);
    export const STASH = new Type("refs/stash", Icon.Type.STASH, false);

    /* Applications */
    HEAD.registerApplication(HEAD, (context, from, to) => {
        context.commitCache.view.mergeElements(from, to);
    });
    HEAD.registerApplication(REMOTE, (context, from, to) => {
        context.commitCache.view.pushTo(from, to);
    });
    REMOTE.registerApplication(HEAD, (context, from, to) => {
        context.commitCache.view.pullTo(from, to);
    });
    STASH.registerApplication(HEAD, (context, from, to) => {
        context.commitCache.view.applyStash(from, to);
    });

    export function* getTypes(): Iterable<Type> {
        yield HEAD;
        yield REMOTE;
        yield TAG;
        yield STASH;
    }

    export function getType(ref: string | HTMLElement): Type {
        for (var refType of getTypes())
            if ((typeof ref === 'string' && ref.startsWith(refType.name))
                || (ref instanceof HTMLElement && ref.parentElement.id.includes(refType.getSimpleName()))) return refType;
    }

}

enum TransitionEffect {
    FADE = 0x01,
    SLIDE_LEFT = 0x02,
    SLIDE_RIGHT = 0x04,
    SLIDE_TOP = 0x08,
    SLIDE_BOTTOM = 0x10
}

class CommitCache {

    public readonly view: View;
    public readonly commits: Array<Commit>;
    public readonly lineAllocator: IntAllocator;

    constructor(view: View) {
        this.commits = [];
        this.view = view;
        this.lineAllocator = new IntAllocator();
    }

    public addAll(...commits: Array<Commit>): void {
        const coms = commits.map(commit => new Commit(commit, this)).filter((commit: Commit) => this.commits.filter((cm: Commit) => cm.id === commit.id).length === 0).sort((a, b) => b.date.getTime() - a.date.getTime());
        this.commits.push(...coms);
        const intervalId = <any>setInterval(() => {
            if (coms.length === 0)
                return clearInterval(intervalId);
            coms.shift().display();
        }, 1);
    }

    public getCommit(id: string): Commit {
        const cms = this.commits.filter((commit: Commit) => commit.id === id);
        return cms.length > 0 ? cms[0] : null;
    }

    public async getPlacedCommit(id: string): Promise<Commit> {
        return new Promise((resolve) => {
            const int = setInterval(() => {
                const commit = this.getCommit(id);
                if (commit != null && commit.element != null) {
                    clearInterval(int);
                    resolve(commit);
                }
            }, 200);
        });
    }

}

class Commit {

    public readonly commitCache: CommitCache;
    public readonly id: string;
    public readonly summary: string;
    public readonly message: string;
    public readonly authorName: string;
    public readonly authorMail: string;
    public readonly committerName: string;
    public readonly committerMail: string;
    public readonly date: Date;
    public readonly parents: Array<string>;
    public readonly isStash: boolean;
    public readonly stashId: number;
    public element: HTMLElement;
    public commitLine: number;
    private readonly commitLineSize: number;
    public path: SVGPathElement;
    public static readonly radius: number = 4;

    constructor(raw: any, cache: CommitCache) {
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
        this.path = null;
    }

    public getDescription(): string {
        return this.message.split(EOL).splice(2).join(EOL);
    }

    public getSummary(): string {
        if (!this.isStash) return this.summary;
        const sumParts = this.summary.split(":");
        sumParts.shift();
        return sumParts.join(":").replace(/^\s*/mgu, "");
    }

    /**
     * Returns whether this is a merge commit
     */
    public isBranchMerge(): boolean {
        return !this.isStash && this.parents.length > 1;
    }

    /**
     * Returns whether the commit is a branch update (and must not alter the positions of the
     * commit lines)
     */
    public isBranchUpdate(): boolean {
        return this.isBranchMerge() && this.getParents()[1].getChildren().filter((child) => child.date > this.date).length > 0;
    }

    /**
     * Returns whether the commit is the last of its branch (and there have been no more activity
     * since the latest merge)
     */
    public isBranchHeadMerge(): boolean {
        return !this.isBranchUpdate() && this.isBranchMerge();
    }

    /**
     * Returns whether this is a split commit
     */
    public isBranchSplit(): boolean {
        return this.getChildren().length > 1;
    }

    /**
     * Returns a list of all the siblings of the commit (children of the parents of the commit),
     * excluding the current one.
     */
    public getSiblings(): Array<Commit> {
        return this.getParents().reduce((accumulator, value) => { accumulator.push(...value.getChildren()); return accumulator }, []).filter((commit) => commit !== this);
    }

    public display(): void {
        this.element = this.commitCache.view.createElement(`commit-${this.id}`, "commit");
        const tags = this.commitCache.view.createElement(null, "tagContainer");
        const id = this.commitCache.view.createElement(null, "id");
        id.innerText = this.id.substr(0, 7);
        const message = this.commitCache.view.createElement(null, "message");
        message.innerText = this.getSummary();
        const author = this.commitCache.view.createElement(null, "author");
        author.innerText = this.authorName;
        const date = this.commitCache.view.createElement(null, "date");
        date.innerText = new DateFormat(this.date).format(this.commitCache.view.getLocale("editor.commit.date_format"));
        this.element.append(tags, id, message, author, date);
        document.getElementById("commit-graph").appendChild(this.element);
        this.displayGraph();

        if (this.isStash)
            this.commitCache.view.registerNetworkPart(`refs/stash/${this.id}`, this.id);
    }

    public getChildren(): Array<Commit> {
        return this.commitCache.commits.filter((commit) => commit.parents.includes(this.id)).sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    public getParents(): Array<Commit> {
        return this.parents.map(id => this.commitCache.getCommit(id)).filter(cm => cm != null && !cm.isStash);
    }

    public getDateRelativeCommit(relation: number): Commit | null {
        const index = this.commitCache.commits.indexOf(this) + relation;
        return (index < 0 || index >= this.commitCache.commits.length) ? null : this.commitCache.commits[index];
    }

    public getPreviousCommit(): Commit | null {
        return this.getDateRelativeCommit(+1);
    }

    public getNextCommit(): Commit | null {
        return this.getDateRelativeCommit(-1);
    }

    private displayGraph(): void {
        if (document.getElementById(`graph-commit-${this.id}`) == null) {
            this.setupPosition();
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.id = `graph-commit-${this.id}`;

            let color = this.commitCache.view.getLocale(`editor.git.graph.color.${this.commitLine % 8}`);
            if (!/^#([a-f0-9]{3}){1,2}$/iu.test(color)) color = "#fff";
            const pos = this.getPosition();
            path.setAttribute("preserveAspectRatio", "xMidYMid meet");
            if (!this.isStash) {
                path.setAttribute("stroke", color);
                path.setAttribute("stroke-width", "2px");
                const radius = Commit.radius;
                let dPath = "";
                for (let children of this.getChildren()) {
                    const childPos = children.getPosition();
                    if (children.commitLine === this.commitLine) dPath += `M ${pos.x} ${pos.y - radius} V ${childPos === pos ? childPos.y - radius : childPos.y + radius}`;
                    else if (children.isBranchHeadMerge() || (this.isBranchSplit() && children.isBranchUpdate())) {
                        dPath += `M ${pos.x} ${pos.y - radius} V ${childPos.y + this.element.clientHeight - radius} Q ${pos.x} ${childPos.y} ${pos.x + (this.commitLineSize - radius) * (this.commitLine > children.commitLine ? -1 : 1)} ${childPos.y} H ${childPos.x + (this.commitLine > children.commitLine ? 1 : -1) * radius}`;
                    } else if (this.isBranchSplit() && !children.isBranchUpdate()) {
                        dPath += `M ${pos.x + (this.commitLine > children.commitLine ? -1 : 1) * radius} ${pos.y} H ${childPos.x + (this.commitLineSize - radius) * (this.commitLine > children.commitLine ? 1 : -1)} Q ${childPos.x} ${pos.y} ${childPos.x} ${Math.max(pos.y - this.commitLineSize, childPos.y + radius)} V ${childPos.y + radius}`
                    }
                }
                path.setAttribute("d", `${dPath} M ${pos.x - radius} ${pos.y} a ${radius} ${radius} 0 1 0 ${radius * 2} 0 a ${radius} ${radius} 0 1 0 ${radius * -2} 0 Z`);
            } else {
                const sc = .5;
                path.setAttribute("stroke", "none");
                path.style.fill = color;
                path.style.width = "10px";
                path.setAttribute("d", `M ${pos.x} ${pos.y - 10 * sc} ${Icon.getPath(Icon.Type.STASH_POINT, false, sc)}`);
            }


            const elem = document.getElementById("graphic-graph");
            if (elem.style.maxWidth == "" || Number.parseFloat(elem.style.maxWidth.substr(0, elem.style.maxWidth.length - 2)) < (this.commitLine + 1) * this.commitLineSize) {
                elem.style.maxWidth = `${(this.commitLine + 1) * this.commitLineSize}px`;
                for (const child of <any>elem.children) {
                    if (child.id.includes("ref")) {
                        const d = child.getAttribute("d");
                        const reg = /H\s?(\d*)/ui;
                        const res = d.match(reg);
                        child.setAttribute("d", d.replace(reg, `H ${Number.parseFloat(res.length > 1 ? res[1] : "0") + this.commitLineSize}`));
                    }
                }
            }
            elem.appendChild(path);

            this.path = path;
        }
    }

    private getPosition() {
        return {
            x: this.element.getBoundingClientRect().left - this.element.parentElement.getBoundingClientRect().left + this.element.clientHeight / 2 + this.commitLine * this.commitLineSize,
            y: this.element.getBoundingClientRect().top - this.element.parentElement.getBoundingClientRect().top + this.element.clientHeight / 2
        }
    }

    protected setupPosition() {

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
    }

    /**
     * Register a branch head at this commit
     */
    public attachHead(refName: string, display?: string): void {
        const refType = Reference.getType(refName);
        const tag = this.commitCache.view.createElement(`ref-${refName}`, "ref", "smooth");
        if (this.commitCache.view.checkout === refName) tag.appendChild(Icon.getTooltiped(Icon.Type.DONE, "tooltipIcon", this.commitCache.view.getLocale("editor.git.current_head"), tag));
        tag.appendChild(Icon.getTooltiped(refType.icon, "tooltipIcon"))
        tag.appendChild(document.createTextNode(display == null ? refName.split("/").pop() : display));
        const color = !refType.isBranch ? this.commitCache.view.getLocale("editor.git.graph.color.tag") : this.path.getAttribute('stroke');
        tag.style.background = color;
        this.element.getElementsByClassName("tagContainer")[0].appendChild(tag);
        const pos = this.getPosition();

        if (refType.isApplicable()) {
            tag.draggable = true;
            tag.style.cursor = "grab";
            tag.addEventListener('dragstart', (event) => {
                event.dataTransfer.setData("application/backyard", JSON.stringify({ ref: refName }));
                event.dataTransfer.setData(`activator/activated/${refName}`, "activator");
                for (const appType of refType.getApplicableTypes())
                    event.dataTransfer.setData(`activator/graph/${appType.getSimpleName()}`, "activator");
                for (const elem of <any>document.getElementById("commit-graph").getElementsByClassName("ref"))
                    if (!refType.isApplicable(elem.id.slice(4)) || elem === tag)
                        elem.style.opacity = .3;
                for (const elem of <any>document.getElementById("networkList").getElementsByClassName("ref"))
                    if (!refType.isApplicable(Reference.getType(elem)) || elem.id.slice(9) === refName)
                        elem.style.opacity = .3;
            });
            tag.addEventListener('dragend', () => {
                for (const elem of <any>document.getElementById("commit-graph").getElementsByClassName("ref"))
                    if (!refType.isApplicable(elem.id.slice(4)) || elem === tag)
                        elem.style.opacity = 1;
                for (const elem of <any>document.getElementById("networkList").getElementsByClassName("ref"))
                    if (!refType.isApplicable(Reference.getType(elem)) || elem.id.slice(9) === refName)
                        elem.style.opacity = 1;
            })
            tag.addEventListener('dragover', (event) => {
                if (event.dataTransfer.types.includes(`activator/graph/${refType.getSimpleName()}`) &&
                    !event.dataTransfer.types.includes(`activator/activated/${refName}`)) event.preventDefault();
            })
            tag.addEventListener('drop', (event) => {
                const dataFrom = JSON.parse(event.dataTransfer.getData('application/backyard'));
                Reference.getType(dataFrom.ref).performOperation(this, dataFrom.ref, refName);
            });
        }

        if (tag.parentElement.children.length === 1) {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            const graph = document.getElementById("graphic-graph");
            path.id = `graph-ref-${this.id}`;
            path.classList.add("tagLink");
            path.setAttribute("stroke", color);
            path.setAttribute("preserveAspectRatio", "xMidYMid meet");
            path.setAttribute("d", `M ${pos.x + Commit.radius} ${pos.y} H ${tag.getBoundingClientRect().x - graph.getBoundingClientRect().x} Z`);
            graph.appendChild(path);
        }
    }
}

class View {

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
        const recents = ipcRenderer.sendSync("lifecycle", "queryRecents");
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
        quickStartList.appendChild(this.createCard("card_one", Icon.Type.FOLDER, this.getLocale("editor.menu.quickstart.open"), this.getLocale("editor.menu.quickstart.open.description"), () => ipcRenderer.send("lifecycle", "openRepoSelector")));
        quickStartList.appendChild(this.createCard("card_two", Icon.Type.SETTINGS, this.getLocale("editor.menu.quickstart.settings"), this.getLocale("editor.menu.quickstart.settings.description"), () => ipcRenderer.send("lifecycle", "undefined")));
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
        menuBar.appendChild(getActionElement(this.getLocale("editor.bar.action.close"), Icon.Type.CLOSE, () => ipcRenderer.send("lifecycle", "closeRepo")));
        header.appendChild(menuBar);
        appContainer.appendChild(header);

        // Contents
        const containerContents = this.createElement("containerContents", "containerContents");
        const networkList = this.createElement("networkList", "networkList", "verticalList");
        for (const ref of Reference.getTypes()) {
            const branch = this.createElement(`${ref.getSimpleName()}List`, "list");
            branch.innerHTML = Icon.getIcon(ref.icon) + this.getLocale(`editor.git.${ref.getSimpleName()}.name`);
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
        ipcRenderer.send("lifecycle", "updateGraph");
        ipcRenderer.send("lifecycle", "queryNetwork");

        document.getElementsByTagName("body")[0].appendChild(appContainer);
        this.setLoaded(true);
    }

    public registerNetworkPart(refName: string, head: string): void {
        const refType = Reference.getType(refName);
        if (refName !== refType.name) {
            const match = refName.match(/refs\/([^\/]+)/mu);
            if (match == null || match.length < 1) return;
            const listElem = document.getElementById(`${match[1]}List`);
            if (listElem == null) return;
            const ref = this.createElement(`ref-menu-${refName}`, "ref", "smooth");
            if (refType !== Reference.STASH) {
                if (refName === this.checkout) ref.appendChild(Icon.getTooltiped(Icon.Type.DONE, "tooltipIcon", this.getLocale("editor.git.current_head"), ref));
                ref.appendChild(document.createTextNode(refName.substr(match[0].length + 1)));
            }
            if (refType === Reference.HEAD)
                ref.addEventListener('dblclick', () => {
                    ipcRenderer.send("lifecycle", "checkout", refName);
                });
            listElem.appendChild(ref);

            this.commitCache.getPlacedCommit(head).then((commit) => {
                if (commit.isStash) {
                    ref.innerText = commit.getSummary();
                    commit.attachHead(refName, `${this.getLocale("editor.git.stash.display_name")} ${commit.stashId}`);
                } else
                    commit.attachHead(refName);
            });

            if (refType.isApplicable()) {
                ref.draggable = true;
                ref.style.cursor = "grab";
                ref.addEventListener('dragstart', (event) => {
                    event.dataTransfer.setData("application/backyard", JSON.stringify({ ref: refName }));
                    event.dataTransfer.setData(`activator/activated/${refName}`, "activator");
                    for (const appType of refType.getApplicableTypes())
                        event.dataTransfer.setData(`activator/graph/${appType.getSimpleName()}`, "activator");
                    for (const elem of <any>document.getElementById("networkList").getElementsByClassName("ref"))
                        if (!refType.isApplicable(Reference.getType(elem)) || elem === ref)
                            elem.style.opacity = .3;
                    for (const elem of <any>document.getElementById("commit-graph").getElementsByClassName("ref"))
                        if (!refType.isApplicable(elem.id.slice(4)) || elem.id.slice(4) === refName)
                            elem.style.opacity = .3;
                });
                ref.addEventListener('dragend', () => {
                    for (const elem of <any>document.getElementById("networkList").getElementsByClassName("ref"))
                        if (!refType.isApplicable(Reference.getType(elem)) || elem === ref)
                            elem.style.opacity = 1;
                    for (const elem of <any>document.getElementById("commit-graph").getElementsByClassName("ref"))
                        if (!refType.isApplicable(elem.id.slice(4)) || elem.id.slice(4) === refName)
                            elem.style.opacity = 1;
                })
                ref.addEventListener('dragover', (event) => {
                    if (event.dataTransfer.types.includes(`activator/graph/${refType.getSimpleName()}`) &&
                        !event.dataTransfer.types.includes(`activator/activated/${refName}`)) event.preventDefault();
                })
                ref.addEventListener('drop', (event) => {
                    const dataFrom = JSON.parse(event.dataTransfer.getData('application/backyard'));
                    Reference.getType(dataFrom.ref).performOperation(this.commitCache.commits[0], dataFrom.ref, refName);
                });
            }
        }
    }

    public clearView(transition: TransitionEffect = TransitionEffect.FADE | TransitionEffect.SLIDE_RIGHT): void {
        this.removeElement(document.getElementById("appContainer"), transition);
        this.commitCache = new CommitCache(this);
    }

    public getLocale(string_id: string): string {
        const cached = this.cachedLocales.get(string_id);
        if (cached == null)
            this.cachedLocales.set(string_id, ipcRenderer.sendSync("localeString", string_id))
        return cached != null ? cached : this.cachedLocales.get(string_id);
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

const view = new View();

window.onload = () => {
    document.getElementById("loaderText").innerText = view.getLocale("editor.app.loading");
    ipcRenderer.send("lifecycle", "init");
    ipcRenderer.on("lifecycle", (event, status, ...args) => {
        if (status === "mainMenu")
            view.loadMainMenu();
        if (status === "openRepo")
            view.loadRepository(args[0], args[1], args[2]);
        if (status === "registerNetworkPart")
            view.registerNetworkPart(args[0], args[1]);
        if (status === "executed")
            new Ascript.Notification(args[0]).setBackground("#2ad500").setDuration(2).send();
        if (status === "maximized")
            document.getElementById("windowIconMaximize").classList.add("maximized");
        if (status === "unmaximized")
            document.getElementById("windowIconMaximize").classList.remove("maximized");
        if (status === "updateGraph")
            view.commitCache.addAll(...args);
        if (status === "checkout") {
            view.checkout = args[0];
            new Ascript.Notification(args[1]).setBackground("#2ad500").setDuration(2).send();
        }
    });
    ipcRenderer.on("error", (event, error) => {
        new Ascript.Notification(`${Icon.getIcon(Icon.Type.ERROR, 'ic')} ${error}`).setBackground("#f00").send();
    });
    document.getElementById("windowIconClose").addEventListener('click', () => {
        ipcRenderer.send("lifecycle", "exitApp");
    });
    document.getElementById("windowIconMinimize").addEventListener('click', () => {
        ipcRenderer.send("lifecycle", "minimizeApp");
    });
    document.getElementById("windowIconMaximize").addEventListener('click', () => {
        ipcRenderer.send("lifecycle", "maximizeApp");
    })
}