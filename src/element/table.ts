/*
table,tr,td,thのElement
*/
import * as Html from './html';
import * as Element from './element';

type gTable = globalThis.HTMLTableElement;
type gTRow = globalThis.HTMLTableRowElement;
type gTCell = globalThis.HTMLTableCellElement;
type gHtml = globalThis.HTMLElement;

// 特定の型の子要素を持てるHtmlElement
abstract class HasChild<T extends gHtml, U extends Element.Element> extends Html.HTMLElementVariable<T> {
    public abstract getChildList(): Array<U>;

    // childを指定して、何番目かを取得する
    // 子要素に存在しない場合はnullを返す
    public getChildIndex(child: U): number | null {
        const index = this.getChildList().findIndex((oneChild: U) => {
            return child.getElementId() === oneChild.getElementId();
        });
        return index === -1 ? null : index;
    }

    // childのインデックスを指定してchildを取得する
    // 子要素に存在しない場合はnullを返す
    public getChildByChildIndex(childIndex: number): U | null {
        const child = this.getChildList()[childIndex];
        if (child === undefined) {
            return null;
        } else {
            return child;
        }
    }

    // childのインデックスを指定してchildを削除する
    public removeChildByChildIndex(childIndex: number): void {
        const child = this.getChildByChildIndex(childIndex);
        if (child !== null) {
            this.deleteChild(child);
        }
    }

    // childのインデックスを指定して、その前にchildを挿入する
    // childインデックスが見つからない場合は最後に挿入する
    public insertChildBeforeChildIndex(childIndex: number, child: U): void {
        const beforeChild = this.getChildByChildIndex(childIndex);
        if (beforeChild === null) {
            this.addChild(child);
        } else {
            this.insertChildBeforeId(beforeChild.getElementId(), child);
        }
    }

    // childのインデックスを指定して、その後ろにchildを挿入する
    // childインデックスが見つからない場合は最後に挿入する
    public insertChildAfterChildIndex(childIndex: number, child: U): void {
        const afterChild = this.getChildByChildIndex(childIndex);
        if (afterChild === null) {
            this.addChild(child);
        } else {
            this.insertChildAfterId(afterChild.getElementId(), child);
        }
    }
}

// td,thのElement
class TableCellElement extends Html.HTMLElementVariable<gTCell> {
    // コンストラクタ
    public constructor(cell: gTCell) {
        super(cell);
    }

    // cellの番号を取得する
    // rowに設定されていない場合はnullを返す
    public getCellIndex(): number | null {
        const parent = this.getParentRow();
        if (parent === null) {
            return null;
        } else {
            return parent.getChildIndex(this);
        }
    }

    // 親のtrを取得する
    // 親がないか、Trでない場合はnullを返す
    public getParentRow(): TableRowElement | null {
        const parent = this.getParentElement();
        return parent instanceof TableRowElement ? parent : null;
    }
}

// tdタグのElement
export class TableDataElement extends TableCellElement {
    // コンストラクタ
    public constructor() {
        super(document.createElement('td'));
    }
}

// trタグのElement
export class TableHeadElement extends TableCellElement {
    // コンストラクタ
    public constructor() {
        super(document.createElement('th'));
    }
}

// trのElement
export class TableRowElement extends HasChild<gTRow, TableCellElement> {
    // cellの一覧
    protected cellList: Array<TableCellElement> = [];
    // cell一覧の再取得が必要か
    protected needRecalcCellList = true;

    // コンストラクタ
    public constructor() {
        super(document.createElement('tr'));
    }

    // rowの一覧を取得する
    public getChildList(): Array<TableCellElement> {
        if (this.needRecalcCellList) {
            this.needRecalcCellList = false;
            // rowの再取得
            this.cellList = [];
            this.getChildren().forEach((element: Element.Element) => {
                if (element instanceof TableCellElement) {
                    this.cellList.push(element);
                }
            });
        }
        return this.cellList;
    }

    // rowの番号を取得する
    // tableに設定されていない場合はnullを返す
    public getRowIndex(): number | null {
        const parent = this.getParentTable();
        if (parent === null) {
            return null;
        } else {
            return parent.getChildIndex(this);
        }
    }

    // 親のTableを取得する
    // 親がないか、Tableでない場合はnullを返す
    public getParentTable(): TableElement | null {
        const parent = this.getParentElement();
        return parent instanceof TableElement ? parent : null;
    }

    // 子要素に変化があった場合に呼び出される
    protected onChildElementChanged(): void {
        super.onChildElementChanged();
        this.needRecalcCellList = true;
    }
}

// tableのElement
export class TableElement extends HasChild<gTable, TableRowElement> {
    // rowの一覧
    protected rowList: Array<TableRowElement> = [];
    // row一覧の再取得が必要か
    protected needRecalcRowList = true;

    // コンストラクタ
    public constructor() {
        super(document.createElement('table'));
    }

    // rowの一覧を取得する
    public getChildList(): Array<TableRowElement> {
        if (this.needRecalcRowList) {
            this.needRecalcRowList = false;
            // rowの再取得
            this.rowList = [];
            this.getChildren().forEach((element: Element.Element) => {
                if (element instanceof TableRowElement) {
                    this.rowList.push(element);
                }
            });
        }
        return this.rowList;
    }

    // 子要素に変化があった場合に呼び出される
    protected onChildElementChanged(): void {
        super.onChildElementChanged();
        this.needRecalcRowList = true;
    }
}
