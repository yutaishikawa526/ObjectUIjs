/*
formのElementの基底クラス
*/
import * as Html from './html';
import * as Element from './element';
import * as FormItem from './form_item';

type gForm = globalThis.HTMLFormElement;
type gSubmitEvent = globalThis.SubmitEvent;

// フォームのイベントリスナー
export interface FormSubmitEventListener {
    // 入力イベント
    onFormSubmit(element: FormElement, event: SubmitEvent): void;
}

// 入力変更イベント
export type SubmitEvent = Element.ElementEvent<gSubmitEvent>;

// 入力変更イベントハンドラー
class FormSubmitEventHander extends Element.ElementEventHander<gSubmitEvent, FormElement, gForm> {
    // コンストラクタ
    public constructor(formListener: FormSubmitEventListener, element: FormElement) {
        const listenter = [
            {
                key: 'submit',
                callback: formListener.onFormSubmit.bind(formListener),
            },
        ];
        super(listenter, element);
    }
}

// フォームの基底クラス
export class FormElement extends Html.HTMLElementVariable<gForm> {
    // 送信のイベントハンドラー
    private formSubmitEventHandler: FormSubmitEventHander | null = null;
    // フォームアイテムの一覧
    protected formItemList: Array<FormItem.FormItemElement>;
    // フォームアイテム一覧の再取得が必要か
    protected needRecalcFormItemList = true;

    // コンストラクタ
    public constructor() {
        super(document.createElement('form'));
        this.formItemList = [];
    }

    /*----------------- 内部で使用される --------------*/

    // 子要素に変化があった場合に呼び出される
    protected onChildElementChanged(): void {
        super.onChildElementChanged();
        this.needRecalcFormItemList = true;
    }

    // フォームアイテムの再読み込みを行う
    protected recalcFormItemList(): void {
        if (this.needRecalcFormItemList) {
            this.needRecalcFormItemList = false;
        } else {
            return;
        }

        this.formItemList = [];
        this.getChildrenWithJudge((element: Element.Element): boolean => {
            return element instanceof FormItem.FormItemElement;
        }).forEach((element: Element.Element) => {
            if (element instanceof FormItem.FormItemElement) {
                this.formItemList.push(element);
            }
        });
    }

    /*----------------- 一般に外から使用される --------------*/

    // actionを設定する
    public setAction(action: string) {
        this.setAttribute('action', action);
    }

    // Methodを指定する
    public setMethod(method: string) {
        this.setAttribute('method', method);
    }

    // targetを指定する
    public setTarget(target: string) {
        this.setAttribute('target', target);
    }

    // フォームアイテムの一覧を取得する
    public getFormItemList(): Array<FormItem.FormItemElement> {
        this.recalcFormItemList();
        return this.formItemList;
    }

    // 送信イベントリスナーを設定する
    public setFormSubmitListener(formSubmitListener: FormSubmitEventListener | null): void {
        if (this.formSubmitEventHandler !== null) {
            // 登録済みイベントを解除
            const handler = this.formSubmitEventHandler;
            handler.removeFrom(this.htmlVariable);
            this.formSubmitEventHandler = null;
        }
        if (formSubmitListener === null) {
            return;
        }
        // イベント登録
        const handler = new FormSubmitEventHander(formSubmitListener, this);
        this.formSubmitEventHandler = handler;
        handler.addTo(this.htmlVariable);
    }

    // 制約チェックを行い、引っかかる場合は報告する
    public reportValidity(): boolean {
        return this.htmlVariable.reportValidity();
    }
}
