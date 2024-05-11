/*
TextのElement
*/
import * as Element from './element';

type gText = globalThis.Text;

// TextのElement
export class TextElement extends Element.NodeElementVariable<gText> {
    // コンストラクタ
    public constructor() {
        super(new globalThis.Text());
    }

    // 文字列を取得する
    public getText(): string {
        const text = this.nodeVariable.textContent;
        if (text === null) {
            return '';
        } else {
            return text;
        }
    }

    // 文字列を設定する
    public setText(text: string): void {
        this.nodeVariable.textContent = text;
    }
}
