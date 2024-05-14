import * as ObjUiJs from 'objectuijs';

console.log('start');

// トップ階層
class Top extends ObjUiJs.element.DivElement implements ObjUiJs.element.ClickEventListener {
    // タブと本文のペア
    protected headerContentPairList: Array<HeaderContentPair> = [];
    // タブのラッパー
    protected headerWrapper: TopHeaderWrapper;
    // 本文のラッパー
    protected contentWrapper: TopContentWrapper;

    // ヘッダーの要素IDからタブと本文のペアを取得する
    protected getContentByHeaderElementId(elementId: string | null): HeaderContentPair | null {
        if (elementId === null) {
            return null;
        }
        const pair = this.headerContentPairList.find((headerContentPair: HeaderContentPair) => {
            return headerContentPair.header.getElementId() === elementId;
        });
        return pair === undefined ? null : pair;
    }

    // ヘッダーの要素IDを指定して、本文に適用する
    protected applySelect(headerElementId: string | null): void {
        const pair = this.getContentByHeaderElementId(headerElementId);
        if (this.headerContentPairList.length === 0) {
            // 要素なしの場合は何もしない
            return;
        } else if (pair === null) {
            // 未選択かつ要素ありの場合は先頭を選択する
            const first = this.headerContentPairList[0];
            this.applySelect(first.header.getElementId());
            return;
        } else {
            if (pair.header.getIsSelected()) {
                return; // 既に選択済みの場合は何もしない
            }

            this.headerContentPairList.forEach((tmpPair: HeaderContentPair) => {
                tmpPair.header.setIsSelected(false);
            });
            pair.header.setIsSelected(true); // 選択中にする

            // 本文の入れ替え
            this.contentWrapper.deleteAllChildren();
            this.contentWrapper.addChild(pair.content);
        }
    }

    // コンストラクタ
    public constructor(headerContentPairList: Array<HeaderContentPair>) {
        super();

        this.headerWrapper = new TopHeaderWrapper();
        this.contentWrapper = new TopContentWrapper();
        this.addChild(this.headerWrapper);
        this.addChild(this.contentWrapper);

        this.headerContentPairList = headerContentPairList;

        // 初期化
        this.initialize();
    }

    // 初期化
    protected initialize(): void {
        this.headerContentPairList.forEach((pair: HeaderContentPair) => {
            // クリックイベント登録
            pair.header.setClickEventListener(this);

            // ヘッダーを登録
            this.headerWrapper.addChild(pair.header);
        });

        this.applySelect(null);
    }

    // ヘッダークリック時、本文の入れ替え
    public onElementClickSingle(element: ObjUiJs.element.HTMLElement, event: ObjUiJs.element.MouseEvent): void {
        const elementId = element.getElementId();
        this.applySelect(elementId);
    }

    public onElementClickDBL(element: ObjUiJs.element.HTMLElement, event: ObjUiJs.element.MouseEvent): void {}
    public onElementClickAUX(element: ObjUiJs.element.HTMLElement, event: ObjUiJs.element.MouseEvent): void {}
}

// トップ階層のタブのラッパー
class TopHeaderWrapper extends ObjUiJs.element.DivElement {
    // タブのクラス
    public static readonly TAB_CLASS = 'header_wrapper';

    // コンストラクタ
    public constructor() {
        super();

        this.classList.add(TopHeaderWrapper.TAB_CLASS);
    }
}

// トップ階層の本文のラッパー
class TopContentWrapper extends ObjUiJs.element.DivElement {}

// トップ階層のタブの基底クラス
class BaseTopHeader extends ObjUiJs.element.DivElement {
    // 選択中のときのクラス
    public static readonly SELECTED_CLASS = 'header_selected';
    // 選択中かどうか
    protected isSelected: boolean = false;

    // コンストラクタ
    public constructor(headerTitle: string) {
        super();

        const text = new ObjUiJs.element.TextElement();
        text.setText(headerTitle);
        this.addChild(text);
    }

    // 選択中かどうか取得する
    public getIsSelected(): boolean {
        return this.isSelected;
    }

    // 選択中にかどうかを設定する
    public setIsSelected(isSelected: boolean): void {
        this.isSelected = isSelected;
        if (this.isSelected) {
            this.classList.add(BaseTopHeader.SELECTED_CLASS);
        } else {
            this.classList.remove(BaseTopHeader.SELECTED_CLASS);
        }
    }
}

// 本文の基底クラス
class BaseContent extends ObjUiJs.element.DivElement {}

// タブと本文のペア
class HeaderContentPair {
    public header: BaseTopHeader;
    public content: BaseContent;

    // コンストラクタ
    public constructor(header: BaseTopHeader, content: BaseContent) {
        this.header = header;
        this.content = content;
    }
}

// サンプルページ1
class ContentPage1 extends BaseContent implements ObjUiJs.element.ClickEventListener {
    // クリックのPタグのクラス
    public static readonly CLICK_P_CLASS: string = 'bdiu32fj0egb';
    // クリックのPタグ
    protected clickP: ObjUiJs.element.ParagraphElement;

    // コンストラクタ
    public constructor() {
        super();

        const clickP = new ObjUiJs.element.ParagraphElement();
        const text = new ObjUiJs.element.TextElement();
        text.setText('click here');
        clickP.addChild(text);
        clickP.classList.add(ContentPage1.CLICK_P_CLASS);

        this.addChild(clickP);

        clickP.setClickEventListener(this);

        this.clickP = clickP;
    }

    // クリックイベント
    public onElementClickSingle(element: ObjUiJs.element.HTMLElement, event: ObjUiJs.element.MouseEvent): void {
        if (this.clickP.getElementId() === element.getElementId()) {
            // pタグクリック時
            this.addChild(new ObjUiJs.element.HRElement());
            const span = new ObjUiJs.element.SpanElement();
            this.addChild(span);
            span.style.color = 'red';
            const text = new ObjUiJs.element.TextElement();
            span.addChild(text);
            text.setText('clicked!!!');
        }
    }
    // ダブルクリックイベント
    public onElementClickDBL(element: ObjUiJs.element.HTMLElement, event: ObjUiJs.element.MouseEvent): void {}
    // 第1ボタン以外のクリックイベント
    public onElementClickAUX(element: ObjUiJs.element.HTMLElement, event: ObjUiJs.element.MouseEvent): void {}
}

// サンプルページ2
class ContentPage2
    extends BaseContent
    implements ObjUiJs.element.ClickEventListener, ObjUiJs.element.FormItemEventListener
{
    // フォーム
    protected form: ObjUiJs.element.FormElement;

    // コンストラクタ
    public constructor() {
        super();

        const form = new ObjUiJs.element.FormElement();
        this.form = form;
        this.addChild(form);

        // フォームアイテム作成
        const select = new ObjUiJs.element.SelectElement(
            new ObjUiJs.element.FormItemProp('a', 't', true, false, false),
        );
        select.setOptionListByProp([
            new ObjUiJs.element.DefaultOptionProp('label1,value:a', 'a'),
            new ObjUiJs.element.DefaultOptionProp('label2,value:b', 'b'),
            new ObjUiJs.element.DefaultOptGroupProp('group1', [
                new ObjUiJs.element.DefaultOptionProp('label3,value:c', 'c'),
                new ObjUiJs.element.DefaultOptionProp('label4,value:d', 'd'),
            ]),
        ]);
        form.addChild(select);
        form.addChild(new ObjUiJs.element.BRElement());

        const textarea = new ObjUiJs.element.TextareaElement(
            new ObjUiJs.element.TextareaProp('default value', 'xxx', true, false, false, 'place holder'),
        );
        form.addChild(textarea);
        form.addChild(new ObjUiJs.element.BRElement());

        const checkbox1 = new ObjUiJs.element.InputElement(
            new ObjUiJs.element.InputProp('a', 'checkbox', 'checkboxName', true, false, false, '', false),
        );
        const checkbox2 = new ObjUiJs.element.InputElement(
            new ObjUiJs.element.InputProp('b', 'checkbox', 'checkboxName', true, false, false, '', true),
        );
        const checkbox3 = new ObjUiJs.element.InputElement(
            new ObjUiJs.element.InputProp('c', 'checkbox', 'checkboxName', true, false, false, '', false),
        );
        form.addChild(checkbox1);
        form.addChild(checkbox2);
        form.addChild(checkbox3);
        form.addChild(new ObjUiJs.element.BRElement());

        const dateInput = new ObjUiJs.element.InputElement(
            new ObjUiJs.element.InputProp('2000-01-01', 'date', 'dateName', true, false, false, '', false),
        );
        form.addChild(dateInput);
        form.addChild(new ObjUiJs.element.BRElement());

        const textInput = new ObjUiJs.element.InputElement(
            new ObjUiJs.element.InputProp('hhgyhdyt', 'text', 'dateName', true, false, false, '', false),
        );
        form.addChild(textInput);
        form.addChild(new ObjUiJs.element.BRElement());

        const submitBtn = new ObjUiJs.element.InputElement(
            new ObjUiJs.element.InputProp('イベント設定', 'button', 'dateName', true, false, false, '', false),
        );
        form.addChild(submitBtn);
        submitBtn.setClickEventListener(this);
    }

    // クリックイベント
    public onElementClickSingle(element: ObjUiJs.element.HTMLElement, event: ObjUiJs.element.MouseEvent): void {
        console.log(this.form);
        console.log(this.form.getFormItemList());

        this.form.getFormItemList().forEach((formItem: ObjUiJs.element.FormItemElement) => {
            formItem.setFormItemListener(this);
        });
    }
    // ダブルクリックイベント
    public onElementClickDBL(element: ObjUiJs.element.HTMLElement, event: ObjUiJs.element.MouseEvent): void {}
    // 第1ボタン以外のクリックイベント
    public onElementClickAUX(element: ObjUiJs.element.HTMLElement, event: ObjUiJs.element.MouseEvent): void {}

    // 入力イベント
    public onFormItemInput(element: ObjUiJs.element.FormItemElement, event: ObjUiJs.element.FormItemEvent): void {}
    // 変更イベント
    public onFormItemChange(element: ObjUiJs.element.FormItemElement, event: ObjUiJs.element.FormItemEvent): void {
        console.log(element);
    }
}

const toppage = new Top([
    new HeaderContentPair(new BaseTopHeader('ヘッダー1'), new ContentPage1()),
    new HeaderContentPair(new BaseTopHeader('ヘッダー2'), new ContentPage2()),
]);

const wrapper = document.getElementsByTagName('body')[0];
{
    let child;
    while ((child = wrapper.lastChild)) {
        child.remove();
    }
}

toppage.addToNode(wrapper);

// css作成
ObjUiJs.util.addStyleSheet({
    media: 'screen',
    cssRules: [
        {
            selectorText: '.' + ContentPage1.CLICK_P_CLASS,
            cssTextList: ['color:red', 'mouse:pointer', 'background-color:yellow'],
        },
    ],
});
ObjUiJs.util.addStyleSheet({
    media: 'screen',
    cssRules: [
        {
            selectorText: '.' + BaseTopHeader.SELECTED_CLASS,
            cssTextList: ['color:white', 'background-color:green'],
        },
    ],
});
ObjUiJs.util.addStyleSheet({
    media: 'screen',
    cssRules: [
        {
            selectorText: '.' + TopHeaderWrapper.TAB_CLASS,
            cssTextList: ['display:flex'],
        },
    ],
});
