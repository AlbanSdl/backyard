import { ipcRenderer } from "electron";
import { Commit } from "./Commit";
import { Icon } from "../app/Icons";
import { AppContext } from "../webview";

/**
 * The namespace contains all the client side features on git references.
 */
export namespace Reference {

    /**
     * The class of the git references. They are attached to their commit and are
     * sorted by type @see Reference.Type for more information
     * A Ref if linked to the app context and can be used to access to contextual methods
     */
    export class Ref implements AppContext {

        public readonly name: string;
        public readonly type: Type;
        public readonly displayName: string;
        private commit: Commit;
        private tag: HTMLDivElement;
        private sideTag: HTMLDivElement;

        public get order(): number {
            return Number.parseInt(this.tag.style.order);
        }

        public set order(v: number) {
            this.tag.style.order = this.sideTag.style.order = v.toString();
        }

        public get isCheckout(): boolean {
            return this.commit.commitCache.view.checkout === this.name;
        }

        public hasTag(tag: HTMLDivElement): boolean {
            return this.tag === tag || this.sideTag === tag;
        }

        public updateCheckoutStatus(remove: boolean = true): void {
            const el = this.tag.getElementsByClassName("checkoutWrapper");
            const sideEl = this.sideTag.getElementsByClassName("checkoutWrapper");
            if (remove && el.length > 0) {
                el.item(0).remove();
                sideEl.item(0).remove();
            } else if (!remove && el.length === 0) {
                this.tag.prepend(Icon.getTooltiped(Icon.Type.DONE, "tooltipIcon", this.getLocale("editor.git.current_head"), this.tag, "checkoutWrapper"));
                this.sideTag.prepend(Icon.getTooltiped(Icon.Type.DONE, "tooltipIcon", this.getLocale("editor.git.current_head"), this.sideTag, "checkoutWrapper"));
            }
        }

        constructor(refName: string, commit: Commit, displayName?: string) {
            this.name = refName;
            this.type = getType(refName);
            this.commit = commit;
            this.displayName = displayName;
            REGISTRY.push(this);

            /* Tag */
            if (this.displayName == null) this.displayName = refName.split("/").pop();
            this.tag = this.createElement(`ref-${refName}`, "ref", "smooth");
            this.tag.appendChild(Icon.getTooltiped(this.type.icon, "tooltipIcon"))
            this.tag.appendChild(document.createTextNode(this.displayName));
            const color = !this.type.isBranch ? this.getLocale("editor.git.graph.color.tag") : this.commit.path.getAttribute('stroke');
            this.tag.style.background = color;
            this.commit.element.getElementsByClassName("tagContainer")[0].appendChild(this.tag);
            const pos = this.commit.getPosition();

            if (this.commit.refs.length === 0) {
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                const graph = this.commit.element.getElementsByClassName("commitGraph")[0];
                path.id = `graph-ref-${this.commit.id}`;
                path.classList.add("tagLink");
                path.setAttribute("stroke", color);
                path.setAttribute("preserveAspectRatio", "xMidYMid meet");
                path.setAttribute("d", `M ${pos.x + Commit.radius} ${pos.y} H ${this.tag.getBoundingClientRect().x - graph.getBoundingClientRect().x} Z`);
                graph.appendChild(path);
            }

            /* Side tag */
            const match = refName.match(/refs\/([^\/]+)/mu);
            if (match == null || match.length < 1) return;
            const listElem = document.getElementById(`${match[1]}List`);
            if (listElem == null) return;
            this.sideTag = this.createElement(`ref-menu-${refName}`, "ref", "smooth");
            this.sideTag.appendChild(document.createTextNode(this.commit.isStash ? commit.getSummary() : refName.substr(match[0].length + 1)));
            listElem.appendChild(this.sideTag);

            /* Drag and drop actions */
            if (this.type.isApplicable()) {
                [this.tag, this.sideTag].forEach((tag) => {
                    if (this.type === Reference.HEAD) 
                        tag.addEventListener('dblclick', () => {if (!this.isCheckout) ipcRenderer.send("checkout", refName)});
                    tag.draggable = true;
                    tag.style.cursor = "grab";
                    tag.addEventListener('dragstart', (event) => {
                        event.dataTransfer.setData("application/backyard", JSON.stringify({ ref: refName }));
                        event.dataTransfer.setData(`activator/activated/${refName}`, "activator");
                        for (const appType of this.type.getApplicableTypes())
                            event.dataTransfer.setData(`activator/graph/${appType.getSimpleName()}`, "activator");
                        for (const elem of <Array<HTMLDivElement>>Array.from(document.getElementById("commit-graph").getElementsByClassName("ref")).concat(Array.from(document.getElementById("networkList").getElementsByClassName("ref")))) {
                            const r = getRefFromTag(elem);
                            if (!this.type.isApplicable(r.type) || r === this) elem.style.opacity = '.3';
                        }
                    });
                    tag.addEventListener('dragend', () => {
                        for (const elem of <Array<HTMLDivElement>>Array.from(document.getElementById("commit-graph").getElementsByClassName("ref")).concat(Array.from(document.getElementById("networkList").getElementsByClassName("ref")))) {
                            const r = getRefFromTag(elem);
                            if (!this.type.isApplicable(r.type) || r === this) elem.style.opacity = '1';
                        }
                    });
                    tag.addEventListener('dragover', (event) => {
                        if (event.dataTransfer.types.includes(`activator/graph/${this.type.getSimpleName()}`) &&
                            !event.dataTransfer.types.includes(`activator/activated/${refName}`)) event.preventDefault();
                    });
                    tag.addEventListener('drop', (event) => {
                        const dataFrom = JSON.parse(event.dataTransfer.getData('application/backyard'));
                        Reference.getType(dataFrom.ref).performOperation(this.commit, dataFrom.ref, refName);
                    });
                })
            }

            /* General settings */
            if (this.isCheckout) this.updateCheckoutStatus(false);
            this.order = this.isCheckout ? 0 : this.type.order;
        }

        getLocale(id: string): string {
            return this.commit.getLocale(id);
        }

        createElement(id: string, ...classes: string[]): HTMLDivElement {
            return this.commit.createElement(id, ...classes);
        }
    }

    /**
     * The type of a reference. Indicates the icon linked to this type, if it's a branch, its order
     * or its base name (eg. refs/heads/)
     */
    class Type {

        public readonly name: string;
        public readonly icon: Icon.Type;
        public readonly isBranch: boolean;
        private readonly applicationTo: Map<Type, (context: Commit, from: string, to: string) => any> = new Map();
        public readonly order: number;

        constructor(name: string, icon: Icon.Type, isBranch: boolean, order: number) {
            this.name = name;
            this.icon = icon;
            this.isBranch = isBranch;
            this.order = order;
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

        public isApplicable(refTo?: Type): boolean {
            if (refTo == null) return this.applicationTo.size !== 0;
            return this.applicationTo.has(refTo);
        }

        public getApplicableTypes(): IterableIterator<Type> {
            return this.applicationTo.keys();
        }
    }

    /** All the possible Types of Reference */
    export const HEAD = new Type("refs/heads", Icon.Type.LAPTOP, true, 1);
    export const REMOTE = new Type("refs/remotes", Icon.Type.CLOUD, true, 2);
    export const TAG = new Type("refs/tags", Icon.Type.LABEL, false, 3);
    export const STASH = new Type("refs/stash", Icon.Type.STASH, false, 4);

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

    export const REGISTRY: Array<Reference.Ref> = new Array();

    export function getCheckedout(): Reference.Ref {
        return REGISTRY.filter((ref) => ref.isCheckout)[0];
    }

    export function getRefFromTag(tag: HTMLDivElement): Reference.Ref {
        return REGISTRY.filter((ref) => ref.hasTag(tag))[0];
    }

}