/*
dialogのElement
*/
import * as Html from './html';
import * as Element from './element';
import * as CBTask from '../task/callback_task';

type gDialog = globalThis.HTMLDialogElement;
type gEvent = globalThis.Event;

// 閉じるのイベントリスナー
export interface DialogCloseEventListener {
    // 閉じるイベント
    onDialogClose(element: DialogElement, event: DialogCloseEvent): void;
}

// 閉じるイベント
export type DialogCloseEvent = Element.ElementEvent<gEvent>;

// 閉じるイベントハンドラー
class DialogCloseEventHander extends Element.ElementEventHander<gEvent, DialogElement, gDialog> {
    // コンストラクタ
    public constructor(dcListener: DialogCloseEventListener, element: DialogElement) {
        const listenter = [
            {
                key: 'close',
                callback: dcListener.onDialogClose.bind(dcListener),
            },
        ];
        super(listenter, element);
    }
}

// DialogのElement
export class DialogElement extends Html.HTMLElementVariable<gDialog> {
    // 閉じるのイベントハンドラー
    private dialogCloseEventHandler: DialogCloseEventHander | null = null;

    // コンストラクタ
    public constructor() {
        super(document.createElement('dialog'));
    }

    // 閉じるイベントリスナーを設定する
    public setDialogCloseListener(dcListener: DialogCloseEventListener | null): void {
        if (this.dialogCloseEventHandler !== null) {
            // 登録済みイベントを解除
            const handler = this.dialogCloseEventHandler;
            handler.removeFrom(this.htmlVariable);
            this.dialogCloseEventHandler = null;
        }
        if (dcListener === null) {
            return;
        }
        // イベント登録
        const handler = new DialogCloseEventHander(dcListener, this);
        this.dialogCloseEventHandler = handler;
        handler.addTo(this.htmlVariable);
    }

    // 開く処理
    public showModal(): void {
        const task = new CBTask.CallbackTask(this.htmlVariable.showModal.bind(this.htmlVariable));
        task.dispatch(false);
    }

    // 閉じる処理
    public close(retValue: string = ''): void {
        const task = new CBTask.CallbackTask(() => {
            this.htmlVariable.close(retValue);
        });
        task.dispatch(false);
    }

    // ダイアログが表示中かどうか取得する
    public isOpen(): boolean {
        return this.htmlVariable.open;
    }

    // 閉じるときに指定した値を取得する
    public getRetValue(): string {
        return this.htmlVariable.returnValue;
    }
}
