/**
 * サンプルページ7
 */
import { BaseContent } from '../component';
import { element as oujElement, util as oujUtil, task as oujTask } from 'objectuijs';

// ダイアログサンプル
class SampleDialog
    extends oujElement.DialogElement
    implements oujElement.ClickEventListener, oujTask.AjaxEventListener
{
    // URL入力欄
    protected urlInput: oujElement.InputElement;
    // 通信ボタン
    protected submitButton: oujElement.InputElement;
    // 結果表示欄
    protected showResultField: oujElement.DivElement;
    // 閉じるボタン
    protected closeButton: oujElement.InputElement;
    // クリアボタン
    protected clearButton: oujElement.InputElement;

    // コンストラクタ
    public constructor() {
        super();

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

        this.clearButton = new oujElement.InputElement(
            new oujElement.InputProp('クリア', 'button', '', true, false, false, '', false),
        );
        this.clearButton.setClickEventListener(this);

        this.submitButton = new oujElement.InputElement(
            new oujElement.InputProp('通信', 'button', '', true, false, false, '', false),
        );
        this.submitButton.setClickEventListener(this);

        this.closeButton = new oujElement.InputElement(
            new oujElement.InputProp('閉じる', 'button', '', true, false, false, '', false),
        );
        this.closeButton.setClickEventListener(this);

        this.showResultField = new oujElement.DivElement();

        this.initialize();
    }

    // 初期化
    protected initialize(): void {
        const label1 = new oujElement.LabelElement();
        const label2 = new oujElement.LabelElement();
        const label3 = new oujElement.LabelElement();
        const label4 = new oujElement.LabelElement();

        label1.addChild(this.urlInput);
        label2.addChild(this.submitButton);
        label3.addChild(this.closeButton);
        label4.addChild(this.clearButton);

        this.addChild(label1);
        this.addChild(label2);
        this.addChild(label3);
        this.addChild(label4);

        this.addChild(new oujElement.HRElement());

        this.addChild(this.showResultField);
        this.showResultField.style.display = 'block';
        this.showResultField.style.width = '100%';
        this.showResultField.style.height = '70%';
        this.style.width = '30vw';
        this.style.height = '30vh';
    }

    // クリックイベント
    public onElementClickSingle(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        if (element.getElementId() === this.submitButton.getElementId()) {
            // 通信ボタンクリック
            if (!this.urlInput.reportValidity()) {
                return;
            }

            const url = this.urlInput.getValue();
            if (!URL.canParse(url)) {
                alert('URL parse error');
                return;
            }

            const task = new oujTask.AjaxTask(new oujTask.AjaxTaskProp(new URL(url), 'GET', 'text', null), this);
            task.send();
        } else if (element.getElementId() === this.closeButton.getElementId()) {
            // 閉じるボタン
            this.close('');
        } else if (element.getElementId() === this.clearButton.getElementId()) {
            // クリア
            this.showResultField.deleteAllChildren();
        }
    }
    // ダブルクリックイベント
    public onElementClickDBL(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}
    // 第1ボタン以外のクリックイベント
    public onElementClickAUX(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}

    // 成功時に呼び出される
    public onAjaxEventSuccess(task: oujTask.AjaxTask): void {
        this.showResultField.deleteAllChildren();
        this.showResultField.addChild(new oujElement.TextElement(task.xhr.responseText));
    }
    // 失敗時に呼び出される
    public onAjaxEventFail(task: oujTask.AjaxTask): void {
        alert('ajax通信に失敗しました。');
    }
}

// サンプルページ7
export class Page7 extends BaseContent implements oujElement.ClickEventListener {
    // ラッパー
    protected wrapper: oujElement.DivElement;
    // ダイアログ
    protected dialog: SampleDialog;
    // ダイアログ表示ボタン
    protected showDialogButton: oujElement.InputElement;

    // コンストラクタ
    public constructor() {
        super();

        this.wrapper = new oujElement.DivElement();
        this.dialog = new SampleDialog();

        this.showDialogButton = new oujElement.InputElement(
            new oujElement.InputProp('ダイアログ表示', 'button', '', true, false, false, '', false),
        );
        this.showDialogButton.setClickEventListener(this);

        this.initialize();
    }

    // 初期化
    protected initialize(): void {
        const label1 = new oujElement.LabelElement();

        label1.addChild(this.showDialogButton);

        this.addChild(label1);

        this.addChild(new oujElement.HRElement());

        this.addChild(this.wrapper);
        this.wrapper.style.display = 'block';
        this.wrapper.style.width = '80vw';
        this.wrapper.style.height = '80vh';

        this.wrapper.addChild(this.dialog);
    }

    // クリックイベント
    public onElementClickSingle(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        if (element.getElementId() === this.showDialogButton.getElementId()) {
            // 開くボタンクリック
            this.dialog.showModal();
        }
    }
    // ダブルクリックイベント
    public onElementClickDBL(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}
    // 第1ボタン以外のクリックイベント
    public onElementClickAUX(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}
}
