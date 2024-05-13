/*
elementのタスク
*/
import * as Task from './task';
import * as Element from '../element/element';

// 別名
type TaskListener = Task.TaskListener;
type TaskObject = Task.TaskObject;
type gEvent = globalThis.Event;
type Element = Element.Element;
type ElementEvent<T extends gEvent> = Element.ElementEvent<T>;
type CallBack<T extends gEvent, U extends Element> = (element: U, event: ElementEvent<T>) => void; // イベントのコールバック関数定義

/**
 * Elementタスクのマネージャー
 */
class ElementTaskManager implements TaskListener {
    // 描画処理を実行予定のelement一覧
    private willRenderElemList: Array<Element> = [];

    /**
     * 描画の実行予定のelement一覧に追加する
     * ただしこの中に親子孫関係がある場合は一番上位を残して残りを削除する
     * @param element 描画対象のElement
     */
    public addWillRenderElem(element: Element): void {
        this.willRenderElemList = this.willRenderElemList.filter((wilRenEl) => {
            return !element.hasChild(wilRenEl); // 子要素に持つものを除去する
        });
        let addFlag: boolean = true; // 追加するかどうか
        this.willRenderElemList.forEach((wilRenEl) => {
            if (!addFlag) {
                return;
            }
            if (wilRenEl.hasChild(element)) {
                addFlag = false; // どれかの子要素
            }
        });
        if (addFlag) {
            this.willRenderElemList.push(element);
        }
    }

    /**
     * 描画処理を行うか判定する
     * 実行予定のElementに親が存在した場合は実行しない
     * @param element 判定対象のElement
     * @returns 描画処理を行うかどうか
     */
    public judgeRender(element: Element): boolean {
        const elementIdList: Array<string> = this.willRenderElemList.map((elem) => {
            return elem.getElementId();
        });
        return elementIdList.indexOf(element.getElementId()) !== -1;
    }

    /**
     * elementを実行予定の一覧から削除する
     * @param element
     */
    protected removeElement(element: Element): void {
        this.willRenderElemList = this.willRenderElemList.filter((wilRenEl) => {
            return element.getElementId() !== wilRenEl.getElementId();
        });
    }

    onTaskStart(task: TaskObject): void {
        if (task instanceof TaskRender) {
            // 描画タスク 特になし
        } else if (task instanceof EventTask) {
            // イベントタスク 特になし
        }
    }
    onTaskCancel(task: TaskObject): void {
        if (task instanceof TaskRender) {
            // 描画タスク
            const elem = task.getElement();
            this.removeElement(elem);
        } else if (task instanceof EventTask) {
            // イベントタスク 特になし
        }
    }
    onTaskFinish(task: TaskObject): void {
        if (task instanceof TaskRender) {
            // 描画タスク
            const elem = task.getElement();
            this.removeElement(elem);
        } else if (task instanceof EventTask) {
            // イベントタスク 特になし
        }
    }

    // シングルトンインスタンス
    private static instance: ElementTaskManager | null = null;
    // シングルトンインスタンスを取得する
    public static getInstance(): ElementTaskManager {
        if (this.instance === null) {
            this.instance = new this();
        }
        return this.instance;
    }
    // コンストラクタ
    private constructor() {}
}

/**
 * 描画タスク
 */
export class TaskRender extends Task.TaskObject {
    // 描画対象のelement
    protected element: Element;

    // 描画対象のelement要素を取得する
    public getElement(): Element {
        return this.element;
    }

    // タスクを実行する
    public run(): void {
        const etmanager = ElementTaskManager.getInstance();
        if (!etmanager.judgeRender(this.element)) {
            return; // 描画を実行しない
        }

        // beforeRenderを実行
        this.execBeforeRender(this.element);

        // renderを実行
        this.execRender(this.element);
    }

    // 指定したElement自身と子孫要素のbeforeRenderを実行する
    protected execBeforeRender(element: Element): void {
        element.beforeRender();
        element.reappendNode();
        element.getChildren().forEach((child) => {
            this.execBeforeRender(child);
        });
    }

    // 指定したElement自身と子孫要素のcheckNeedRender→renderを実行する
    protected execRender(element: Element): void {
        if (element.checkNeedRender()) {
            element.render();
        }
        element.getChildren().forEach((child) => {
            this.execRender(child);
        });
    }

    // コンストラクタ
    public constructor(element: Element) {
        const etmanager = ElementTaskManager.getInstance();
        super(etmanager);
        this.element = element;
        etmanager.addWillRenderElem(element);
    }
}

/**
 * イベントタスク
 */
export class EventTask<T extends gEvent, U extends Element> extends Task.TaskObject {
    // コールバック関数
    protected callback: CallBack<T, U>;
    // 対象のElement
    protected element: U;
    // 対象のイベント
    protected event: ElementEvent<T>;

    // タスクを実行する
    public run(): void {
        this.callback(this.element, this.event);
    }

    // コンストラクタ
    public constructor(callback: CallBack<T, U>, element: U, event: ElementEvent<T>) {
        super(ElementTaskManager.getInstance());
        this.callback = callback;
        this.element = element;
        this.event = event;
    }
}
