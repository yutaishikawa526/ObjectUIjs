/*
inputのElementの基底クラス
*/
import * as FormItem from './form_item';

type gInput = globalThis.HTMLInputElement;

// inputタグのプロパティ
export class InputProp extends FormItem.FormItemProp {
    public type: string = 'text';
    public placeholder: string = '';
    public checked: boolean = false;

    public constructor(
        value: string = '',
        type: string = 'text',
        name: string = '',
        required: boolean = false,
        readonly: boolean = false,
        diable: boolean = false,
        placeholder: string = '',
        checked: boolean = false,
    ) {
        super(value, name, required, readonly, diable);
        this.type = type;
        this.placeholder = placeholder;
        this.checked = checked;
    }
}

// InputのElement
export class InputElement extends FormItem.FormItemElementVariable<gInput> {
    // コンストラクタ
    public constructor(inputProp: InputProp = new InputProp()) {
        super(document.createElement('input'));

        this.setInputProp(inputProp);
    }

    // チェック済みかどうか
    public isChecked(): boolean {
        return this.formItemVariable.checked;
    }

    // チェック済みかを設定する
    public setIsChecked(checked: boolean): void {
        this.formItemVariable.checked = checked;
    }

    // InputPropを適用する
    public setInputProp(inputProp: InputProp) {
        this.setFormItemProp(inputProp);

        const input = this.formItemVariable;
        input.setAttribute('type', inputProp.type);
        input.setAttribute('placeholder', inputProp.placeholder);
        if (inputProp.checked) {
            input.setAttribute('checked', 'true');
        }
    }
}
