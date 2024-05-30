/**
 * キャンバス画面
 */
import { element as oujElement, util as oujUtil, task as oujTask } from 'objectuijs';
import { Canvas } from './canvas';
import { isJSDocThisTag } from 'typescript';

// キャンバス画面
export class CanvasView
    extends oujElement.DivElement
    implements oujElement.ClickEventListener, oujElement.FormItemEventListener
{
    // キャンバス
    protected readonly canvas: Canvas;
    // ツールバー
    protected readonly toolbar: oujElement.DivElement;
    // 戻るボタン
    protected readonly backButton: oujElement.InputElement;
    // 進むボタン
    protected readonly nextButton: oujElement.InputElement;
    // 色の選択入力欄
    protected readonly colorInput: oujElement.InputElement;
    // alpha値の入力欄
    protected readonly alphaInput: oujElement.InputElement;
    // 線の太さの入力欄
    protected readonly lineWidthInput: oujElement.InputElement;

    // コンストラクタ
    public constructor() {
        super();

        const canvasW = 800;
        const canvasH = 600;

        const canvas = new Canvas(canvasW, canvasH);

        const toolbar = new oujElement.DivElement();

        const nextButton = new oujElement.InputElement(
            new oujElement.InputProp('進む', 'button', '', false, false, false, '', false, null),
        );
        const backButton = new oujElement.InputElement(
            new oujElement.InputProp('戻る', 'button', '', false, false, false, '', false, null),
        );
        nextButton.setClickEventListener(this);
        backButton.setClickEventListener(this);

        const colorInput = new oujElement.InputElement(
            new oujElement.InputProp('#000000', 'color', '', true, false, false, '', false, null),
        );
        const alphaInput = new oujElement.InputElement(
            new oujElement.InputProp('100', 'range', '', true, false, false, '', false, null),
        );
        const lineWidthInput = new oujElement.InputElement(
            new oujElement.InputProp('10', 'range', '', true, false, false, '', false, null),
        );
        colorInput.setFormItemListener(this);
        alphaInput.setFormItemListener(this);
        lineWidthInput.setFormItemListener(this);

        this.toolbar = toolbar;
        this.canvas = canvas;
        this.nextButton = nextButton;
        this.backButton = backButton;
        this.colorInput = colorInput;
        this.alphaInput = alphaInput;
        this.lineWidthInput = lineWidthInput;

        this.initalize();
    }

    // 初期化
    protected initalize() {
        this.addChild(this.canvas);

        this.style.width = '1000px';
        this.style.height = '1000px';
        this.canvas.style.border = '2px black solid';

        this.addChild(this.toolbar);

        const label1 = new oujElement.LabelElement();
        const label2 = new oujElement.LabelElement();
        const label3 = new oujElement.LabelElement();
        const label4 = new oujElement.LabelElement();
        const label5 = new oujElement.LabelElement();
        label1.addChild(this.backButton);
        label2.addChild(this.nextButton);
        label3.addChild(new oujElement.TextElement('色:'));
        label3.addChild(this.colorInput);
        label4.addChild(new oujElement.TextElement('透明度(%):'));
        label4.addChild(this.alphaInput);
        label5.addChild(new oujElement.TextElement('太さ(px):'));
        label5.addChild(this.lineWidthInput);

        this.alphaInput.setAttribute('min', '0');
        this.alphaInput.setAttribute('max', '100');
        this.alphaInput.setAttribute('step', '1');

        this.lineWidthInput.setAttribute('min', '1');
        this.lineWidthInput.setAttribute('max', '100');
        this.lineWidthInput.setAttribute('step', '1');

        this.alphaInput.style.border = '2px black solid';
        this.lineWidthInput.style.border = '2px black solid';

        this.toolbar.addChild(label1);
        this.toolbar.addChild(label2);
        this.toolbar.addChild(label3);
        this.toolbar.addChild(label4);
        this.toolbar.addChild(label5);
    }

    // クリックイベント
    public onElementClickSingle(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        const elemId = element.getElementId();
        if (elemId === this.nextButton.getElementId()) {
            // 進むボタンクリック
            if (this.canvas.canNext()) {
                oujUtil.log('call next');
                this.canvas.doNext();
            }
        } else if (elemId === this.backButton.getElementId()) {
            // 戻るボタンクリック
            if (this.canvas.canBack()) {
                oujUtil.log('call back');
                this.canvas.doBack();
            }
        }
    }
    // ダブルクリックイベント
    public onElementClickDBL(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}
    // 第1ボタン以外のクリックイベント
    public onElementClickAUX(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}

    // 入力イベント
    public onFormItemInput(element: oujElement.FormItemElement, event: oujElement.FormItemEvent): void {}
    // 変更イベント
    public onFormItemChange(element: oujElement.FormItemElement, event: oujElement.FormItemEvent): void {
        const elemId = element.getElementId();
        if (elemId === this.colorInput.getElementId()) {
            // 色が変更
            if (!this.colorInput.reportValidity()) {
                return;
            }
            const inputCol = this.colorInput.getValue();
            const color = this.canvas.getDrawColor();
            const colorMap = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
            const [_, r1, r2, g1, g2, b1, b2] = [...inputCol];
            color.r = (colorMap.indexOf(r1) * 16 + colorMap.indexOf(r2)) / 255;
            color.g = (colorMap.indexOf(g1) * 16 + colorMap.indexOf(g2)) / 255;
            color.b = (colorMap.indexOf(b1) * 16 + colorMap.indexOf(b2)) / 255;
            this.canvas.setDrawColor(color);
        } else if (elemId === this.alphaInput.getElementId()) {
            // alpha値が変更
            if (!this.alphaInput.reportValidity()) {
                return;
            }
            const color = this.canvas.getDrawColor();
            const alpha = Number(this.alphaInput.getValue()) / 100;
            color.a = alpha;
            this.canvas.setDrawColor(color);
        } else if (elemId === this.lineWidthInput.getElementId()) {
            // 太さの値が変更
            if (!this.lineWidthInput.reportValidity()) {
                return;
            }
            const width = Number(this.lineWidthInput.getValue());
            this.canvas.setDrawLineWidth(width);
        }
    }
}
