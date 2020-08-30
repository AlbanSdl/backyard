import { DateFormat } from "../utils/Date";
import { Icon } from "../app/Icons";
import { Reference } from "./Reference";
import { AppContext } from "../webview";
import { CommitCache } from "../app/CommitCache";
import { EOL } from "os";

export class Commit implements AppContext {

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
    public readonly element: HTMLElement;
    public commitLine: number;
    private readonly commitLineSize: number;
    private readonly refs: Array<Reference.Ref> = new Array();
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
        this.commitLine = -1;
        this.commitLineSize = 20;
        this.path = null;

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
    }

    getLocale(id: string): string {
        return this.commitCache.getLocale(id);
    }

    createElement(id: string, ...classes: string[]): HTMLDivElement {
        return this.commitCache.createElement(id, ...classes);
    }

    public get order(): number {
        return Number.parseInt(this.element.style.order);
    }

    public set order(v: number) {
        this.element.style.order = v.toString();
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

    public getPosition() {
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
        this.refs.push(new Reference.Ref(refName, this, display));
    }
}