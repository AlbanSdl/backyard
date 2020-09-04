import { AppContext } from "src/view/webview";

export class ResizableTable {

    public readonly parentElement: HTMLElement;
    public readonly element: HTMLElement;
    private readonly rows: TableRow[] = new Array();
    private header: TableHeader;

    constructor(context: AppContext, parent: HTMLElement, className?: string, id?: string, extraStyle?: CSSStyleDeclaration) {
        this.parentElement = parent;
        const container = document.createElement("div");
        container.className = `${className}-container`;
        this.element = document.createElement("div");
        if (className != null) this.element.className = className;
        if (id != null) this.element.id = id;
        this.element.style.overflow = 'hidden';
        container.appendChild(this.element);
        this.parentElement.appendChild(container);
        Object.assign(this.parentElement.style, extraStyle);

        this.appendRow(new TableHeader(context));
    }
    
    public get head(): TableHeader {
        return this.header;
    }

    public appendRow(row: TableRow) {

        const rowElem = row.toElement();
        this.rows.push(row);

        if (row instanceof TableHeader) {
            const index = this.rows.indexOf(row);
            if (this.header != null && index >= 0) {
                this.rows[index].toElement().remove();
                this.rows.splice(index, 1);
            }
            this.header = row;
        } else {
            for (const column of rowElem.children) {
                const div = this.createResizer();
                div.classList.add("resizer");
                (<HTMLElement> column).appendChild(div);
                (<HTMLElement> column).style.position = 'relative';
                
                let pageX: number, curCol: HTMLElement, nxtCol: HTMLElement, curColWidth: number, nxtColWidth: number;
    
                function getSafeValue(value: number, refElement: HTMLElement): number {
                    const substr1 = getComputedStyle(refElement).minWidth.match(/\d+/mug);
                    const min = substr1 != null && substr1.length > 0 ? Number.parseFloat(substr1[0]) : 0;
                    const substr2 = getComputedStyle(refElement).maxWidth.match(/\d+/mug);
                    const max = substr2 != null && substr2.length > 0 ? Number.parseFloat(substr2[0]) : Number.POSITIVE_INFINITY;
                    return Math.min(max, Math.max(min, value));
                }

                div.addEventListener('mousedown', (e) => {
                    curCol = <HTMLElement> this.header.toElement().getElementsByClassName((<HTMLElement> e.target).parentElement.classList[0])[0];
                    nxtCol = curCol.nextElementSibling == null ? null : <HTMLElement> this.header.toElement().getElementsByClassName(curCol.nextElementSibling.classList[0])[0];
                    pageX = e.pageX;
                    curColWidth = (<HTMLElement> e.target).parentElement.getBoundingClientRect().width;
                    if (nxtCol)
                        nxtColWidth = (<HTMLElement> e.target).parentElement.nextElementSibling.getBoundingClientRect().width;
                });
    
                document.addEventListener('mousemove', (e) => {
                    if (curCol) {
                        let diffX = e.pageX - pageX;
                        if (nxtCol) {
                            nxtCol.style.width = getSafeValue(nxtColWidth + (curColWidth - getSafeValue(curColWidth + diffX, curCol)), nxtCol) + 'px';
                        }
                        curCol.style.width = getSafeValue(curColWidth + diffX, curCol) + 'px';
                    }
                });
    
                document.addEventListener('mouseup', () => {
                    curCol = undefined;
                    nxtCol = undefined;
                    pageX = undefined;
                    nxtColWidth = undefined;
                    curColWidth = undefined
                });
            }
        }
        this.element.appendChild(rowElem);
    }

    private createResizer(): HTMLElement {
        let div = document.createElement('div');
        div.style.top = '0';
        div.style.right = '0';
        div.style.width = '5px';
        div.style.position = 'absolute';
        div.style.cursor = 'col-resize';
        div.style.userSelect = 'none';
        div.style.height = '100%';
        return div;
    }

}

export interface TableRow {
    toElement(): HTMLDivElement;
}

class TableHeader implements TableRow {

    private readonly element: HTMLDivElement;

    constructor(context: AppContext) {
        this.element = context.createElement(null, "table-header");
        const graphContainer = context.createElement(null, "relative-container", "table-header-cnt");
        const tags = context.createElement(null, "tagContainer", "table-header-cnt");
        const id = context.createElement(null, "id", "table-header-cnt");
        const message = context.createElement(null, "message", "table-header-cnt");
        const author = context.createElement(null, "author", "table-header-cnt");
        const date = context.createElement(null, "date", "table-header-cnt");
        this.element.append(graphContainer, tags, id, message, author, date);
    }

    toElement(): HTMLDivElement {
        return this.element;
    }
}