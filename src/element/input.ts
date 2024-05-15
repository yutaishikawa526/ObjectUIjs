/*
inputのElementの基底クラス
*/
import * as FormItem from './form_item';

type gInput = globalThis.HTMLInputElement;
type gFileList = globalThis.FileList;

// inputタグのプロパティ
export class InputProp extends FormItem.FormItemProp {
    public type: string = 'text';
    public placeholder: string = '';
    public checked: boolean = false;
    public pattern: string | null = null;

    public constructor(
        value: string = '',
        type: string = 'text',
        name: string = '',
        required: boolean = false,
        readonly: boolean = false,
        diable: boolean = false,
        placeholder: string = '',
        checked: boolean = false,
        pattern: string | null = null,
    ) {
        super(value, name, required, readonly, diable);
        this.type = type;
        this.placeholder = placeholder;
        this.checked = checked;
        this.pattern = pattern;
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

    // FileListを取得する
    public getFileList(): gFileList | null {
        return this.formItemVariable.files;
    }

    // InputPropを適用する
    public setInputProp(inputProp: InputProp) {
        this.setFormItemProp(inputProp);

        this.setAttribute('type', inputProp.type);
        this.setAttribute('placeholder', inputProp.placeholder);
        if (inputProp.checked) {
            this.setAttribute('checked', 'true');
        }
        if (inputProp.pattern !== null) {
            this.setAttribute('pattern', inputProp.pattern);
        }
    }
}
