/**
 * サンプルページ1
 */
import { BaseContent } from '../component';
import { element as oujElement, util as oujUtil } from 'objectuijs';

// サンプルページ1
export class Page1 extends BaseContent implements oujElement.ClickEventListener {
    // クリックのPタグ
    protected clickP: oujElement.ParagraphElement;

    // コンストラクタ
    public constructor() {
        super();

        this.classList.add('page1');

        const clickP = new oujElement.ParagraphElement();
        clickP.addChild(new oujElement.TextElement('click here'));
        clickP.classList.add('b5je54ujd');

        this.addChild(clickP);
        this.addChild(new oujElement.HRElement());

        clickP.setClickEventListener(this);

        this.clickP = clickP;
    }

    // クリックイベント
    public onElementClickSingle(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        if (this.clickP.getElementId() === element.getElementId()) {
            // pタグクリック時
            const span = new oujElement.SpanElement();
            this.addChild(span);
            span.classList.add('x45hhr5');
            span.addChild(new oujElement.TextElement('clicked!!!'));
        }
    }
    // ダブルクリックイベント
    public onElementClickDBL(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}
    // 第1ボタン以外のクリックイベント
    public onElementClickAUX(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}
}

oujUtil.addStyleSheet({
    media: 'screen',
    cssRules: [
        {
            selectorText: '.page1 .b5je54ujd',
            cssTextList: ['color:red', 'cursor:pointer', 'background-color:yellow', 'width:fit-content'],
        },
        {
            selectorText: '.page1 .x45hhr5',
            cssTextList: ['color:red', 'margin-right:5px'],
        },
    ],
});
