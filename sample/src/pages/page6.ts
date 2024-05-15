/**
 * サンプルページ6
 */
import { BaseContent } from '../component';
import { element as oujElement, util as oujUtil, task as oujTask } from 'objectuijs';

// サンプルページ6
export class Page6 extends BaseContent implements oujElement.ClickEventListener, oujElement.IframeLoadEventListener {
    // 更新ボタンのID
    protected static readonly UPDATE_BTN_ID = 'update_btn_id';
    // 画像の削除
    protected static readonly DELETE_BTN_ID = 'delete_btn_id';
    // iframe
    protected iframeElem: oujElement.IframeElement;
    // URL入力欄
    protected urlInput: oujElement.InputElement;
    // 追加ボタン
    protected updateButton: oujElement.InputElement;
    // 削除ボタン
    protected deleteButton: oujElement.InputElement;
    // ダウンロードボタン
    protected downloadButton: oujElement.InputElement;

    // コンストラクタ
    public constructor() {
        super();

        this.iframeElem = new oujElement.IframeElement();
        this.iframeElem.setIframeLoadListener(this);

        this.urlInput = new oujElement.InputElement(
            new oujElement.InputProp(
                '',
                'url',
                '',
                true,
                false,
                false,
                'URLを入力してください。',
                false,
                '^https?://.*$',
            ),
        );
        this.updateButton = new oujElement.InputElement(
            new oujElement.InputProp('更新', 'button', '', true, false, false, '', false),
        );
        this.updateButton.setCustomElementId(Page6.UPDATE_BTN_ID);
        this.updateButton.setClickEventListener(this);

        this.deleteButton = new oujElement.InputElement(
            new oujElement.InputProp('削除', 'button', '', true, false, false, '', false),
        );
        this.deleteButton.setCustomElementId(Page6.DELETE_BTN_ID);
        this.deleteButton.setClickEventListener(this);

        this.downloadButton = new oujElement.InputElement(
            new oujElement.InputProp('ダウンロード', 'button', '', true, false, false, '', false),
        );
        this.downloadButton.setClickEventListener(this);

        this.initialize();
    }

    // 初期化
    protected initialize(): void {
        const label1 = new oujElement.LabelElement();
        const label2 = new oujElement.LabelElement();
        const label3 = new oujElement.LabelElement();
        const label4 = new oujElement.LabelElement();

        label1.addChild(this.urlInput);
        label2.addChild(this.updateButton);
        label3.addChild(this.deleteButton);
        label4.addChild(this.downloadButton);

        this.addChild(label1);
        this.addChild(label2);
        this.addChild(label3);
        this.addChild(label4);

        this.addChild(new oujElement.HRElement());

        this.addChild(this.iframeElem);
        this.iframeElem.style.width = '80vw';
        this.iframeElem.style.height = '80vh';
    }

    // クリックイベント
    public onElementClickSingle(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        if (element.getCustomElementId() === Page6.UPDATE_BTN_ID) {
            // 更新ボタンクリック
            if (!this.urlInput.reportValidity()) {
                return;
            }

            const url = this.urlInput.getValue();
            if (!URL.canParse(url)) {
                alert('URL parse error');
                return;
            }

            this.iframeElem.setSrc(url);
        } else if (element.getCustomElementId() === Page6.DELETE_BTN_ID) {
            this.iframeElem.setSrc('');
        } else if (this.downloadButton.getElementId() === element.getElementId()) {
            // ダウンロードボタン
            try {
                const contentWindow = this.iframeElem.getContentWindow();
                if (contentWindow === null) {
                    return;
                }
                const ifrmDoc = contentWindow.document;
                const html = ifrmDoc.getElementsByTagName('html')[0];
                const htmlText = html.innerHTML;
                if (!confirm('htmlをダウンロードしますか?')) {
                    return;
                }
                oujUtil.downloadBlob(new Blob([htmlText], { type: 'text/html' }), 'download_iframe');
            } catch (e) {
                oujUtil.log(e);
            }
        }
    }
    // ダブルクリックイベント
    public onElementClickDBL(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}
    // 第1ボタン以外のクリックイベント
    public onElementClickAUX(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}

    // loadイベント
    public onIframeLoad(element: oujElement.IframeElement, event: oujElement.IframeLoadEvent): void {
        if (element.getElementId() === this.iframeElem.getElementId()) {
            // iframeの読込完了イベント
            alert('読込完了しました。');
        }
    }
}
