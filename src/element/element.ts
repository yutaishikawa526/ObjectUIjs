/*
dom要素の実装
*/
import * as ElementTask from '../task/element_task';

// 別名
type gNode = globalThis.Node;
type gEvent = globalThis.Event;
type gEventListenerObject = EventListenerObject;

/* ----------------- 一番基本のElement,Event,EventHandler ------------------ */

// イベント
export class ElementEvent<T extends gEvent> {
    public event: T;

    // コンストラクタ
    public constructor(event: T) {
        this.event = event;
    }
}

// ElementEventHander用のリスナー
export type Listener<T extends gEvent, U extends Element> = Array<{
    key: string;
    callback: (elem: U, e: ElementEvent<T>) => any;
}>;

// イベントハンドラーの基底クラス
export class ElementEventHander<T extends gEvent, U extends Element, V extends gNode> implements gEventListenerObject {
    // addEventListenerで指定される
    public handleEvent(e: T): void {
        const callback = this.listener.find((value) => {
            return value.key === e.type;
        });
        if (callback === undefined) {
            throw new Error('登録していないイベントが呼ばれています。');
        } else {
            this.appendEvent(e, callback.callback);
        }
    }
    // コールバックのリスナー
    protected listener: Listener<T, U>;
    // 対象のElement
    protected element: U;

    // コンストラクタ
    public constructor(listener: Listener<T, U>, element: U) {
        this.listener = listener;
        this.element = element;
    }

    // Nodeを指定してイベントを設置する
    public addTo(node: V): void {
        this.listener.forEach((value) => {
            node.addEventListener(value.key, this);
        });
    }
    // Nodeを指定してイベントを取り除く
    public removeFrom(node: V): void {
        this.listener.forEach((value) => {
            node.removeEventListener(value.key, this);
        });
    }

    // イベントをディスパッチする
    protected appendEvent(event: T, callback: (elem: U, e: ElementEvent<T>) => any): void {
        const eventTask = new ElementTask.EventTask<T, U>(callback, this.element, new ElementEvent<T>(event));
        eventTask.dispatch();
    }
}

// Nodeのラッパー
export class Element {
    // 次の要素ID
    private static nextElementId: number = 1;
    // 要素ID
    private readonly elementId: string;

    // Nodeのオブジェクト
    protected readonly element: gNode;
    // 親要素
    private parentElement: Element | null = null;
    // 子要素の配列
    private childElements: Array<Element> = [];
    // renderが必要かどうか
    private needRender: boolean = true;
    // 子要素のNodeの再設置が必要かどうか
    private needReappendNode: boolean = true;

    // コンストラクタ
    public constructor(element: gNode) {
        this.elementId = String(Element.nextElementId);
        Element.nextElementId++;
        this.element = element;
    }

    /**
     * ----------------- 描画関連 -----------------
     * 呼び出し順序は
     * 1. このクラスのbeforeRender
     * 2. このクラスのreappendNode
     * 3. 子要素全てのbeforeRender
     * 4. 子要素全てのreappendNode
     * 5. このクラスのcheckNeedRender
     * 6. ↑がtrueを返した場合はこのクラスのrender
     * 7. 子要素のcheckNeedRender
     * 8. ↑がtrueを返した場合は子要素のrender
     * 9. 7,8を子要素が無くなるまで繰り返す
     */
    // 描画処理の呼び出し前の呼ばれる
    // このメソッド内までにchildElementsを作成する
    public beforeRender(): void {}
    // renderの呼び出しが必要か判定する
    public checkNeedRender(): boolean {
        return this.needRender;
    }
    // 子要素の再設置
    public reappendNode(): void {
        if (!this.needReappendNode) {
            return;
        }
        this.needReappendNode = false;

        // 子要素のNodeを再設置
        this.deleteChildren();
        this.childElements.forEach((child: Element) => {
            this.element.appendChild(child.element);
        });
    }
    // 描画処理
    public render(): void {
        this.needRender = false;
    }

    /*----------------- 内部で使用される --------------*/

    // 子要素のNodeを全削除する
    protected deleteChildren(): void {
        const pNode = this.element;
        let child;
        while ((child = pNode.lastChild)) {
            pNode.removeChild(child);
        }
    }

    // 描画が必要と設定する
    protected setNeedRender(): void {
        this.needRender = true;
        // 描画処理をディスパッチする
        const task = new ElementTask.TaskRender(this);
        task.dispatch();
    }

    // 子要素のNodeの再設置が必要と設定する
    protected setNeedReappendNode(): void {
        this.needReappendNode = true;
        this.setNeedRender();
    }

    // 子要素に変化があった場合に呼び出される
    protected onChildElementChanged(): void {
        this.setNeedReappendNode(); // 再描画が必要
    }

    // 親要素に変化があった場合に呼び出される
    protected onParentElementChanged(): void {}

    /*----------------- 一般に外から使用される --------------*/

    // 要素IDを取得する
    public getElementId(): string {
        return this.elementId;
    }

    // 子要素を追加する
    public addChild(child: Element): void {
        this.childElements.push(child);
        this.onChildElementChanged();
        child.parentElement = this;
        child.onParentElementChanged();
    }

    // 子要素を指定の要素IDの前の挿入する
    // 発見できなかった場合は最後に追加する
    public insertChildBeforeId(elementId: string, child: Element): void {
        const index = this.childElements.findIndex((elem) => {
            return elementId === elem.getElementId();
        });
        if (index === -1) {
            // 見つからなかった場合は最後に追加
            this.addChild(child);
        } else {
            this.childElements.splice(index, 0, child);
            this.onChildElementChanged();
            child.parentElement = this;
            child.onParentElementChanged();
        }
    }

    // 子要素を指定の要素IDの後の挿入する
    // 発見できなかった場合は最後に追加する
    public insertChildAfterId(elementId: string, child: Element): void {
        const index = this.childElements.findIndex((elem) => {
            return elementId === elem.getElementId();
        });
        if (index === -1) {
            // 見つからなかった場合は最後に追加
            this.addChild(child);
        } else {
            this.childElements.splice(index + 1, 0, child);
            this.onChildElementChanged();
            child.parentElement = this;
            child.onParentElementChanged();
        }
    }

    // 子要素を取り除く
    public deleteChild(childElem: Element): void {
        this.childElements = this.childElements.filter((elem: Element) => {
            if (childElem.getElementId() === elem.getElementId()) {
                return false;
            } else {
                childElem.parentElement = null;
                childElem.onParentElementChanged();
                return true;
            }
        });
        this.onChildElementChanged();
    }

    // 親要素を取得する
    public getParentElement(): Element | null {
        return this.parentElement;
    }

    // 子要素の配列を取得する
    public getChildren(): Array<Element> {
        return this.childElements;
    }

    // 直下の子要素かを判定する
    public hasDirectChild(child: Element): boolean {
        const elemIdList: Array<string> = this.childElements.map((elem) => {
            return elem.getElementId();
        });
        return elemIdList.includes(child.getElementId());
    }

    // 子孫含め子要素か判定する
    public hasChild(child: Element): boolean {
        if (this.hasDirectChild(child)) {
            return true;
        } else {
            let flag: boolean = false;
            this.childElements.forEach((elem: Element) => {
                if (flag) {
                    return;
                }
                if (elem.hasChild(child)) {
                    flag = true;
                }
            });
            return flag;
        }
    }

    /**
     * Nodeに直接設置する
     * @param node 設置先のgNode
     */
    public addToNode(node: gNode): void {
        node.appendChild(this.element);
        this.setNeedRender();
    }

    // 子要素から、判定のコールバックを呼び出して対象の子要素を再帰的に全取得する
    public getChildrenWithJudge(callback: (child: Element) => boolean): Array<Element> {
        const results: Array<Element> = [];
        this.getChildren().forEach((element: Element) => {
            if (callback(element)) {
                results.push(element);
            }
            const gChildren = element.getChildrenWithJudge(callback);
            results.push(...gChildren);
        });
        return results;
    }
}

// Elementで対象のgNodeをジェネリクスで指定して継承しやすくする
export class NodeElementVariable<T extends gNode> extends Element {
    // gNodeのオブジェクト
    protected readonly nodeVariable: T;

    // コンストラクタ
    public constructor(nodeVariable: T) {
        super(nodeVariable);
        this.nodeVariable = nodeVariable;
    }
}
