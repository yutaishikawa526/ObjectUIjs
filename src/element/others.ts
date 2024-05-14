/*
その他の要素のElementの基底クラス
*/
import * as Html from './html';

type gDivElement = globalThis.HTMLDivElement;
type gSpanElement = globalThis.HTMLSpanElement;
type gPElement = globalThis.HTMLParagraphElement;
type gBrElement = globalThis.HTMLBRElement;
type gHrElement = globalThis.HTMLHRElement;
type gLabelElement = globalThis.HTMLLabelElement;
type gAElement = globalThis.HTMLAnchorElement;

// divタグのElement
export class DivElement extends Html.HTMLElementVariable<gDivElement> {
    // コンストラクタ
    public constructor() {
        super(document.createElement('div'));
    }
}
// spanタグ
export class SpanElement extends Html.HTMLElementVariable<gSpanElement> {
    // コンストラクタ
    public constructor() {
        super(document.createElement('span'));
    }
}
// pタグ
export class ParagraphElement extends Html.HTMLElementVariable<gPElement> {
    // コンストラクタ
    public constructor() {
        super(document.createElement('p'));
    }
}
// brタグ
export class BRElement extends Html.HTMLElementVariable<gBrElement> {
    // コンストラクタ
    public constructor() {
        super(document.createElement('br'));
    }
}
// hrタグ
export class HRElement extends Html.HTMLElementVariable<gHrElement> {
    // コンストラクタ
    public constructor() {
        super(document.createElement('hr'));
    }
}
// Labelタグ
export class LabelElement extends Html.HTMLElementVariable<gLabelElement> {
    // コンストラクタ
    public constructor() {
        super(document.createElement('label'));
    }
}
// aタグ
export class AnchorElement extends Html.HTMLElementVariable<gAElement> {
    // コンストラクタ
    public constructor() {
        super(document.createElement('a'));
    }

    // hrefを設定する
    public setHref(href: string): void {
        this.htmlVariable.href = href;
    }

    // downloadを設定する
    public setDownload(download: string): void {
        this.htmlVariable.download = download;
    }
}
