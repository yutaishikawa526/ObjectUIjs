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

// divタグのElement
export class DivElement extends Html.HTMLElementVariable<gDivElement> {
    // コンストラクタ
    public constructor() {
        super(new globalThis.HTMLDivElement());
    }
}
// spanタグ
export class SpanElement extends Html.HTMLElementVariable<gSpanElement> {
    // コンストラクタ
    public constructor() {
        super(new globalThis.HTMLSpanElement());
    }
}
// pタグ
export class ParagraphElement extends Html.HTMLElementVariable<gPElement> {
    // コンストラクタ
    public constructor() {
        super(new globalThis.HTMLParagraphElement());
    }
}
// brタグ
export class BRElement extends Html.HTMLElementVariable<gBrElement> {
    // コンストラクタ
    public constructor() {
        super(new globalThis.HTMLBRElement());
    }
}
// hrタグ
export class HRElement extends Html.HTMLElementVariable<gHrElement> {
    // コンストラクタ
    public constructor() {
        super(new globalThis.HTMLHRElement());
    }
}
// Labelタグ
export class LabelElement extends Html.HTMLElementVariable<gLabelElement> {
    // コンストラクタ
    public constructor() {
        super(new globalThis.HTMLLabelElement());
    }
}
