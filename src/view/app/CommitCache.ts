import { Commit } from "../git/Commit";
import { IntAllocator } from "../utils/IntAllocator";
import { View } from "./View";
import { AppContext } from "../webview";

export class CommitCache implements AppContext {

    public readonly view: View;
    public readonly commits: Array<Commit>;
    public readonly lineAllocator: IntAllocator;

    constructor(view: View) {
        this.commits = [];
        this.view = view;
        this.lineAllocator = new IntAllocator();
    }

    getLocale(id: string): string {
        return this.view.getLocale(id);
    }

    createElement(id: string, ...classes: string[]): HTMLDivElement {
        return this.view.createElement(id, ...classes);
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
                if (commit != null && commit.element.parentElement != null) {
                    clearInterval(int);
                    resolve(commit);
                }
            }, 200);
        });
    }

}