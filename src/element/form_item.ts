/*
textarea,input,selectのElementの基底クラス
*/
import * as Html from './html';
import * as Element from './element';

type gInput = globalThis.HTMLInputElement;
type gTextarea = globalThis.HTMLTextAreaElement;
type gSelect = globalThis.HTMLSelectElement;
type gButton = globalThis.HTMLButtonElement;
type gEvent = globalThis.Event;

type UnionFormItem = gInput | gTextarea | gSelect | gButton;

// 入力変更イベントリスナー
export interface FormItemEventListener {
    // 入力イベント
    onFormItemInput(element: FormItemElement, event: FormItemEvent): void;
    // 変更イベント
    onFormItemChange(element: FormItemElement, event: FormItemEvent): void;
}

// 入力変更イベント
export type FormItemEvent = Element.ElementEvent<gEvent>;

// 入力変更イベントハンドラー
class FormItemEventHander extends Element.ElementEventHander<gEvent, FormItemElement, UnionFormItem> {
    // コンストラクタ
    public constructor(fiListener: FormItemEventListener, element: FormItemElement) {
        const listenter = [
            {
                key: 'input',
                callback: fiListener.onFormItemInput.bind(fiListener),
            },
            {
                key: 'change',
                callback: fiListener.onFormItemChange.bind(fiListener),
            },
        ];
        super(listenter, element);
    }
}

// フォームアイテムのプロパティ
export class FormItemProp {
    public value: string = '';
    public name: string = '';
    public required: boolean = false;
    public readonly: boolean = false;
    public diable: boolean = false;

    public constructor(
        value: string = '',
        name: string = '',
        required: boolean = false,
        readonly: boolean = false,
        diable: boolean = false,
    ) {
        this.value = value;
        this.name = name;
        this.required = required;
        this.readonly = readonly;
        this.diable = diable;
    }
}

// フォームアイテムの基底クラス
export class FormItemElement extends Html.HTMLElementVariable<UnionFormItem> {
    // 入力変更のイベントハンドラー
    private formItemEventHandler: FormItemEventHander | null = null;

    // 入力変更イベントリスナーを設定する
    public setFormItemListener(formItemListener: FormItemEventListener | null): void {
        if (this.formItemEventHandler !== null) {
            // 登録済みイベントを解除
            const handler = this.formItemEventHandler;
            handler.removeFrom(this.htmlVariable);
            this.formItemEventHandler = null;
        }
        if (formItemListener === null) {
            return;
        }
        // イベント登録
        const handler = new FormItemEventHander(formItemListener, this);
        this.formItemEventHandler = handler;
        handler.addTo(this.htmlVariable);
    }

    // 値を取得する
    public getValue(): string {
        return this.htmlVariable.value;
    }

    // 値を設定する
    public setValue(value: string): void {
        this.htmlVariable.value = value;
    }

    // フォームアイテムのプロパティを設定する
    public setFormItemProp(formItemProp: FormItemProp): void {
        this.htmlVariable.value = formItemProp.value;
        this.setAttribute('name', formItemProp.name);
        if (formItemProp.required) {
            this.setAttribute('required', 'true');
        }
        if (formItemProp.readonly) {
            this.setAttribute('readonly', 'true');
        }
        if (formItemProp.diable) {
            this.setAttribute('diable', 'true');
        }
    }

    // 制約チェックを行い、引っかかる場合は報告する
    public reportValidity(): boolean {
        return this.htmlVariable.reportValidity();
    }
}

// FormItemElementで対象のUnionFormItemをジェネリクスで指定して継承しやすくする
export class FormItemElementVariable<T extends UnionFormItem> extends FormItemElement {
    // UnionFormItemのオブジェクト
    protected readonly formItemVariable: T;

    // コンストラクタ
    public constructor(formItem: T) {
        super(formItem);
        this.formItemVariable = formItem;
    }
}
