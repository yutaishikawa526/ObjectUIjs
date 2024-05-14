/*
iframeのElement
*/
import * as Html from './html';
import * as Element from './element';

type gIframe = globalThis.HTMLIFrameElement;
type gEvent = globalThis.Event;
type gWindow = globalThis.Window;

// loadイベントリスナー
export interface IframeLoadEventListener {
    // loadイベント
    onIframeLoad(element: IframeElement, event: IframeLoadEvent): void;
}

// loadイベント
export type IframeLoadEvent = Element.ElementEvent<gEvent>;

// loadイベントハンドラー
class LoadEventHander extends Element.ElementEventHander<gEvent, IframeElement, gIframe> {
    // コンストラクタ
    public constructor(listener: IframeLoadEventListener, element: IframeElement) {
        const listenter = [
            {
                key: 'load',
                callback: listener.onIframeLoad.bind(listener),
            },
        ];
        super(listenter, element);
    }
}

// iframeのElement
export class IframeElement extends Html.HTMLElementVariable<gIframe> {
    // loadのイベントハンドラー
    private iframeLoadHandler: LoadEventHander | null = null;

    // loadイベントリスナーを設定する
    public setIframeLoadListener(listener: IframeLoadEventListener | null): void {
        if (this.iframeLoadHandler !== null) {
            // 登録済みイベントを解除
            const handler = this.iframeLoadHandler;
            handler.removeFrom(this.htmlVariable);
            this.iframeLoadHandler = null;
        }
        if (listener === null) {
            return;
        }
        // イベント登録
        const handler = new LoadEventHander(listener, this);
        this.iframeLoadHandler = handler;
        handler.addTo(this.htmlVariable);
    }

    // コンストラクタ
    public constructor() {
        super(document.createElement('iframe'));
    }

    // srcを設定する
    public setSrc(src: string) {
        this.htmlVariable.src = src;
    }

    // contentWindowを取得する
    public getContentWindow(): gWindow | null {
        return this.htmlVariable.contentWindow;
    }
}
