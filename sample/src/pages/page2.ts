/**
 * サンプルページ2
 */
import { BaseContent } from '../component';
import { element as oujElement } from 'objectuijs';

// サンプルページ2
export class Page2
    extends BaseContent
    implements oujElement.ClickEventListener, oujElement.FormItemEventListener, oujElement.FormSubmitEventListener
{
    // フォーム
    protected form: oujElement.FormElement;
    // 入力項目の変化を表示するフィールド
    protected showResultField: oujElement.DivElement;

    // コンストラクタ
    public constructor() {
        super();

        this.showResultField = new oujElement.DivElement();
        this.addChild(this.showResultField);

        const form = new oujElement.FormElement();
        this.form = form;
        this.addChild(form);
        form.setFormSubmitListener(this);

        // フォームアイテム作成
        const select = new oujElement.SelectElement(new oujElement.FormItemProp('a', 't', true, false, false));
        select.setOptionListByProp([
            new oujElement.DefaultOptionProp('label1,value:a', 'a'),
            new oujElement.DefaultOptionProp('label2,value:b', 'b'),
            new oujElement.DefaultOptGroupProp('group1', [
                new oujElement.DefaultOptionProp('label3,value:c', 'c'),
                new oujElement.DefaultOptionProp('label4,value:d', 'd'),
            ]),
        ]);
        form.addChild(select);
        form.addChild(new oujElement.BRElement());

        const textarea = new oujElement.TextareaElement(
            new oujElement.TextareaProp('default value', 'xxx', true, false, false, 'place holder'),
        );
        form.addChild(textarea);
        form.addChild(new oujElement.BRElement());

        const checkbox1 = new oujElement.InputElement(
            new oujElement.InputProp('a', 'checkbox', 'checkboxName', false, false, false, '', false),
        );
        const checkbox2 = new oujElement.InputElement(
            new oujElement.InputProp('b', 'checkbox', 'checkboxName', false, false, false, '', true),
        );
        const checkbox3 = new oujElement.InputElement(
            new oujElement.InputProp('c', 'checkbox', 'checkboxName', false, false, false, '', false),
        );
        form.addChild(checkbox1);
        form.addChild(checkbox2);
        form.addChild(checkbox3);
        form.addChild(new oujElement.BRElement());

        const dateInput = new oujElement.InputElement(
            new oujElement.InputProp('2000-01-01', 'date', 'dateName', true, false, false, '', false),
        );
        form.addChild(dateInput);
        form.addChild(new oujElement.BRElement());

        const textInput = new oujElement.InputElement(
            new oujElement.InputProp('hhgyhdyt', 'text', 'dateName', true, false, false, '', false),
        );
        form.addChild(textInput);
        form.addChild(new oujElement.BRElement());

        const eventBtn = new oujElement.InputElement(
            new oujElement.InputProp('イベント設定', 'button', 'btn', true, false, false, '', false),
        );
        form.addChild(eventBtn);
        eventBtn.setClickEventListener(this);

        const submitBtn = new oujElement.InputElement(
            new oujElement.InputProp('送信', 'submit', 'submitBtn', true, false, false, '', false),
        );
        form.addChild(submitBtn);
    }

    // クリックイベント
    public onElementClickSingle(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        console.log(this.form);
        console.log(this.form.getFormItemList());

        this.form.getFormItemList().forEach((formItem: oujElement.FormItemElement) => {
            formItem.setFormItemListener(this);
        });
    }
    // ダブルクリックイベント
    public onElementClickDBL(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}
    // 第1ボタン以外のクリックイベント
    public onElementClickAUX(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}

    // 入力イベント
    public onFormItemInput(element: oujElement.FormItemElement, event: oujElement.FormItemEvent): void {}
    // 変更イベント
    public onFormItemChange(element: oujElement.FormItemElement, event: oujElement.FormItemEvent): void {
        const showF = this.showResultField;
        const val = element.getValue();
        const text = new oujElement.TextElement();
        text.setText('新しい値:' + val);
        showF.deleteAllChildren();
        showF.addChild(text);
    }

    // 入力イベント
    public onFormSubmit(element: oujElement.FormElement, event: oujElement.SubmitEvent): void {
        console.log('送信が実施されます。');
        alert('送信が実施されます。');
    }
}
