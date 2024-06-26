/*
textareaのElementの基底クラス
*/
import * as FormItem from './form_item';

type gTextarea = globalThis.HTMLTextAreaElement;

// textareaタグのプロパティ
export class TextareaProp extends FormItem.FormItemProp {
    public placeholder: string = '';
    public checked: boolean = false;

    public constructor(
        value: string = '',
        name: string = '',
        required: boolean = false,
        readonly: boolean = false,
        diable: boolean = false,
        placeholder: string = '',
    ) {
        super(value, name, required, readonly, diable);
        this.placeholder = placeholder;
    }
}

// テキストエリアElement
export class TextareaElement extends FormItem.FormItemElementVariable<gTextarea> {
    // コンストラクタ
    public constructor(textareaProp: TextareaProp = new TextareaProp()) {
        super(document.createElement('textarea'));

        this.setTextareaProp(textareaProp);
    }

    // TextareaPropを適用する
    public setTextareaProp(textareaProp: TextareaProp) {
        this.setFormItemProp(textareaProp);

        this.setAttribute('placeholder', textareaProp.placeholder);
    }
}
