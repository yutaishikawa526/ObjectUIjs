/*
HTMLのElement,Event,EventHandler,EventLisnter
*/
import * as Element from './element';

// 別名
type gMouseEvent = globalThis.MouseEvent;
type gHtmlElement = globalThis.HTMLElement;
type gCSSStyleDeclaration = globalThis.CSSStyleDeclaration;

// マウスイベントリスナー
export interface MouseEventListener {
    // mouseoverイベント
    onElementMouseOver(element: HTMLElement, event: MouseEvent): void;
    // mousedownイベント
    onElementMouseDown(element: HTMLElement, event: MouseEvent): void;
    // mouseenterイベント
    onElementMouseEnter(element: HTMLElement, event: MouseEvent): void;
    // mouseleaveイベント
    onElementMouseLeave(element: HTMLElement, event: MouseEvent): void;
    // mousemoveイベント
    onElementMouseMove(element: HTMLElement, event: MouseEvent): void;
    // mouseupイベント
    onElementMouseUp(element: HTMLElement, event: MouseEvent): void;
    // mouseoutイベント
    onElementMouseOut(element: HTMLElement, event: MouseEvent): void;
}

// クリックイベントリスナー
export interface ClickEventListener {
    // クリックイベント
    onElementClickSingle(element: HTMLElement, event: MouseEvent): void;
    // ダブルクリックイベント
    onElementClickDBL(element: HTMLElement, event: MouseEvent): void;
    // 第1ボタン以外のクリックイベント
    onElementClickAUX(element: HTMLElement, event: MouseEvent): void;
}

// マウスイベント
export type MouseEvent = Element.ElementEvent<gMouseEvent>;

// マウスイベントハンドラー
class MouseEventHander extends Element.ElementEventHander<gMouseEvent, HTMLElement, gHtmlElement> {
    // コンストラクタ
    public constructor(mouseListener: MouseEventListener, element: HTMLElement) {
        const listenter = [
            {
                key: 'mouseover',
                callback: mouseListener.onElementMouseOver.bind(mouseListener),
            },
            {
                key: 'mousedown',
                callback: mouseListener.onElementMouseDown.bind(mouseListener),
            },
            {
                key: 'mouseenter',
                callback: mouseListener.onElementMouseEnter.bind(mouseListener),
            },
            {
                key: 'mouseleave',
                callback: mouseListener.onElementMouseLeave.bind(mouseListener),
            },
            {
                key: 'mousemove',
                callback: mouseListener.onElementMouseMove.bind(mouseListener),
            },
            {
                key: 'mouseup',
                callback: mouseListener.onElementMouseUp.bind(mouseListener),
            },
            {
                key: 'mouseout',
                callback: mouseListener.onElementMouseOut.bind(mouseListener),
            },
        ];
        super(listenter, element);
    }
}

// クリックイベントハンドラー
class ClickEventHander extends Element.ElementEventHander<gMouseEvent, HTMLElement, gHtmlElement> {
    // コンストラクタ
    public constructor(clickListener: ClickEventListener, element: HTMLElement) {
        const listenter = [
            {
                key: 'click',
                callback: clickListener.onElementClickSingle.bind(clickListener),
            },
            {
                key: 'dblclick',
                callback: clickListener.onElementClickDBL.bind(clickListener),
            },
            {
                key: 'auxclick',
                callback: clickListener.onElementClickAUX.bind(clickListener),
            },
        ];
        super(listenter, element);
    }
}

// HTMLの要素
export class HTMLElement extends Element.Element {
    // Nodeのオブジェクト
    protected readonly htmlElement: gHtmlElement;
    // styleのオブジェクト
    // 直接CSSを指定することで適用可能
    public readonly style: gCSSStyleDeclaration;

    // mouseイベントの最初のハンドラー
    private mouseEventHandler: null | MouseEventHander = null;
    // clickイベントの最初のハンドラー
    private clickEventHandler: null | ClickEventHander = null;

    // コンストラクタ
    public constructor(htmlElement: gHtmlElement) {
        super(htmlElement);
        this.htmlElement = htmlElement;
        this.style = htmlElement.style;
    }

    /*----------------- 一般に外から使用される --------------*/

    // Nodeリストから削除する
    public remove(): void {
        const parent = this.getParentElement();
        if (parent === null) {
            this.htmlElement.remove();
        } else {
            parent.deleteChild(this);
        }
    }

    // クリックする
    public click(): void {
        this.htmlElement.click();
    }

    // フォーカスを設定する
    public focus(): void {
        this.htmlElement.focus();
    }

    // フォーカスを取り除く
    public blur(): void {
        this.htmlElement.blur();
    }

    // mouseイベントリスナーを設定する
    public setMouseEventListener(mouseEventListener: MouseEventListener | null): void {
        if (this.mouseEventHandler !== null) {
            // 登録済みイベントを解除
            const handler = this.mouseEventHandler;
            handler.removeFrom(this.htmlElement);
            this.mouseEventHandler = null;
        }
        if (mouseEventListener === null) {
            return;
        }
        // イベント登録
        const handler = new MouseEventHander(mouseEventListener, this);
        this.mouseEventHandler = handler;
        handler.addTo(this.htmlElement);
    }

    // clickイベントリスナーを設定する
    public setClickEventListener(clickEventListener: ClickEventListener | null): void {
        if (this.clickEventHandler !== null) {
            // 登録済みイベントを解除
            const handler = this.clickEventHandler;
            handler.removeFrom(this.htmlElement);
            this.clickEventHandler = null;
        }
        if (clickEventListener === null) {
            return;
        }
        // イベント登録
        const handler = new ClickEventHander(clickEventListener, this);
        this.mouseEventHandler = handler;
        handler.addTo(this.htmlElement);
    }
}

// HTMLElementで対象のgHtmlElementをジェネリクスで指定して継承しやすくする
export class HTMLElementVariable<T extends gHtmlElement> extends HTMLElement {
    // gHtmlElementのオブジェクト
    protected readonly htmlVariable: T;

    // コンストラクタ
    public constructor(htmlVariable: T) {
        super(htmlVariable);
        this.htmlVariable = htmlVariable;
    }
}
