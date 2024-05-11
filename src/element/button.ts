/*
ボタンのElement
*/
import * as FormItem from './form_item';

type gButton = globalThis.HTMLButtonElement;

export class ButtonElement extends FormItem.FormItemElementVariable<gButton> {
    // コンストラクタ
    public constructor() {
        super(new globalThis.HTMLButtonElement());
    }
}
