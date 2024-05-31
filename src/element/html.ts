/*
HTMLのElement,Event,EventHandler,EventLisnter
*/
import * as Element from './element';

// 別名
type gMouseEvent = globalThis.MouseEvent;
type gTouchEvent = globalThis.TouchEvent;
type gHtmlElement = globalThis.HTMLElement;
type gCSSStyleDeclaration = globalThis.CSSStyleDeclaration;
type gDOMTokenList = globalThis.DOMTokenList;
type gDOMRect = globalThis.DOMRect;
type gDragEvent = globalThis.DragEvent;

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

// ドラッグイベントリスナー
export interface DragEventListener {
    // ドラッグ開始
    onElementDragStart(element: HTMLElement, event: DragEvent): void;
    // ドラッグ中
    onElementDrag(element: HTMLElement, event: DragEvent): void;
    // ドラッグ終了直前
    onElementDragEnd(element: HTMLElement, event: DragEvent): void;
    // ドラッグ終了
    onElementDrop(element: HTMLElement, event: DragEvent): void;
    // 妥当なドロップターゲットに入った
    onElementDragEnter(element: HTMLElement, event: DragEvent): void;
    // 妥当なドロップターゲットの上にある
    onElementDragOver(element: HTMLElement, event: DragEvent): void;
    // 妥当なドロップターゲットから離れた
    onElementDragLeave(element: HTMLElement, event: DragEvent): void;
}

// touchイベントリスナー
export interface TouchEventListener {
    // タッチ開始
    onElementTouchStart(element: HTMLElement, event: TouchEvent): void;
    // タッチ中
    onElementTouchMove(element: HTMLElement, event: TouchEvent): void;
    // タッチ終了
    onElementTouchEnd(element: HTMLElement, event: TouchEvent): void;
    // タッチキャンセル
    onElementTouchCancel(element: HTMLElement, event: TouchEvent): void;
}

// マウスイベント
export type MouseEvent = Element.ElementEvent<gMouseEvent>;
// ドラッグイベント
export type DragEvent = Element.ElementEvent<gDragEvent>;
// タッチイベント
export type TouchEvent = Element.ElementEvent<gTouchEvent>;

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

// ドラッグイベントハンドラー
class DragEventHander extends Element.ElementEventHander<gDragEvent, HTMLElement, gHtmlElement> {
    // コンストラクタ
    public constructor(dragListener: DragEventListener, element: HTMLElement) {
        const listenter = [
            {
                key: 'dragstart',
                callback: dragListener.onElementDragStart.bind(dragListener),
            },
            {
                key: 'drag',
                callback: dragListener.onElementDrag.bind(dragListener),
            },
            {
                key: 'dragend',
                callback: dragListener.onElementDragEnd.bind(dragListener),
            },
            {
                key: 'drop',
                callback: dragListener.onElementDrop.bind(dragListener),
            },

            {
                key: 'dragenter',
                callback: dragListener.onElementDragEnter.bind(dragListener),
            },
            {
                key: 'dragover',
                callback: dragListener.onElementDragOver.bind(dragListener),
            },
            {
                key: 'dragleave',
                callback: dragListener.onElementDragLeave.bind(dragListener),
            },
        ];
        super(listenter, element);
    }
}

// タッチイベントハンドラー
class TouchEventHander extends Element.ElementEventHander<gTouchEvent, HTMLElement, gHtmlElement> {
    // コンストラクタ
    public constructor(touchListener: TouchEventListener, element: HTMLElement) {
        const listenter = [
            {
                key: 'touchstart',
                callback: touchListener.onElementTouchStart.bind(touchListener),
            },
            {
                key: 'touchmove',
                callback: touchListener.onElementTouchMove.bind(touchListener),
            },
            {
                key: 'touchend',
                callback: touchListener.onElementTouchEnd.bind(touchListener),
            },
            {
                key: 'touchcancel',
                callback: touchListener.onElementTouchCancel.bind(touchListener),
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
    // クラス一覧のオブジェクト
    public readonly classList: gDOMTokenList;

    // mouseイベントのハンドラー
    private mouseEventHandler: null | MouseEventHander = null;
    // clickイベントのハンドラー
    private clickEventHandler: null | ClickEventHander = null;
    // dragイベントのハンドラー
    private dragEventHandler: null | DragEventHander = null;
    // touchイベントハンドラー
    private touchEventHander: null | TouchEventHander = null;

    // コンストラクタ
    public constructor(htmlElement: gHtmlElement) {
        super(htmlElement);
        this.htmlElement = htmlElement;
        this.style = htmlElement.style;
        this.classList = htmlElement.classList;
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

    // drag可能性を設定する
    public setDraggable(draggable: boolean): void {
        this.htmlElement.draggable = draggable;
    }

    // 属性値を設定する
    public setAttribute(name: string, value: string): void {
        this.htmlElement.setAttribute(name, value);
    }

    // 要素の寸法とビューポートにおける相対位置を取得する
    public getBoundingClientRect(): gDOMRect {
        return this.htmlElement.getBoundingClientRect();
    }

    // 要素の(height,width) + paddingの値を取得する
    public getClientWidthHeight(): { width: number; height: number } {
        return { width: this.htmlElement.clientWidth, height: this.htmlElement.clientHeight };
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
        this.clickEventHandler = handler;
        handler.addTo(this.htmlElement);
    }

    // dragイベントリスナーを設定する
    public setDragEventListener(dragEventListener: DragEventListener | null): void {
        if (this.dragEventHandler !== null) {
            // 登録済みイベントを解除
            const handler = this.dragEventHandler;
            handler.removeFrom(this.htmlElement);
            this.dragEventHandler = null;
        }
        if (dragEventListener === null) {
            return;
        }
        // イベント登録
        const handler = new DragEventHander(dragEventListener, this);
        this.dragEventHandler = handler;
        handler.addTo(this.htmlElement);
    }

    // touchイベントリスナーを設定する
    public setTouchEventListener(touchEventListener: TouchEventListener | null): void {
        if (this.touchEventHander !== null) {
            // 登録済みイベントを解除
            const handler = this.touchEventHander;
            handler.removeFrom(this.htmlElement);
            this.touchEventHander = null;
        }
        if (touchEventListener === null) {
            return;
        }
        // イベント登録
        const handler = new TouchEventHander(touchEventListener, this);
        this.touchEventHander = handler;
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
