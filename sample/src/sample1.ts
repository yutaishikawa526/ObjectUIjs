import { element as oujElement, util as oujUtil, task as oujTask } from 'objectuijs';

console.log('start');

const gDate = globalThis.Date;

// トップ階層
class Top extends oujElement.DivElement implements oujElement.ClickEventListener {
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
    public onElementClickSingle(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        const elementId = element.getElementId();
        this.applySelect(elementId);
    }

    public onElementClickDBL(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}
    public onElementClickAUX(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}
}

// トップ階層のタブのラッパー
class TopHeaderWrapper extends oujElement.DivElement {
    // タブのクラス
    public static readonly TAB_CLASS = 'header_wrapper';

    // コンストラクタ
    public constructor() {
        super();

        this.classList.add(TopHeaderWrapper.TAB_CLASS);
    }
}

// トップ階層の本文のラッパー
class TopContentWrapper extends oujElement.DivElement {}

// トップ階層のタブの基底クラス
class BaseTopHeader extends oujElement.DivElement {
    // 選択中のときのクラス
    public static readonly SELECTED_CLASS = 'header_selected';
    // 選択中かどうか
    protected isSelected: boolean = false;

    // コンストラクタ
    public constructor(headerTitle: string) {
        super();

        const text = new oujElement.TextElement();
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
class BaseContent extends oujElement.DivElement {}

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
class ContentPage1 extends BaseContent implements oujElement.ClickEventListener {
    // クリックのPタグのクラス
    public static readonly CLICK_P_CLASS: string = 'bdiu32fj0egb';
    // クリックのPタグ
    protected clickP: oujElement.ParagraphElement;

    // コンストラクタ
    public constructor() {
        super();

        const clickP = new oujElement.ParagraphElement();
        const text = new oujElement.TextElement();
        text.setText('click here');
        clickP.addChild(text);
        clickP.classList.add(ContentPage1.CLICK_P_CLASS);

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
            span.style.color = 'red';
            span.style.marginRight = '5px';
            const text = new oujElement.TextElement();
            span.addChild(text);
            text.setText('clicked!!!');
        }
    }
    // ダブルクリックイベント
    public onElementClickDBL(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}
    // 第1ボタン以外のクリックイベント
    public onElementClickAUX(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}
}

// サンプルページ2
class ContentPage2
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

// サンプルページ3用のテーブル
class AddDeleteTable
    extends oujElement.TableElement
    implements oujElement.ClickEventListener, oujElement.DragEventListener
{
    // テーブルのクラス
    public static readonly TABLE_CLASS = 'gbnk893hfugr33';
    // ヘッダーの一覧
    protected static readonly HEADER_LIST: Array<string> = ['', 'タイトル', '詳細', '削除'];
    // 削除ボタンのID
    protected static readonly DELETE_BTN_ID = 'delete_btn_id';
    // 削除ボタンの要素IDとtdの要素のマップ
    protected deleteBtn2TdMap: Array<{ deleteBtnId: string; td: oujElement.TableDataElement }> = [];
    // ドラッグ中のTr
    protected draggingRow: oujElement.TableRowElement | null = null;

    // コンストラクタ
    public constructor() {
        super();

        this.classList.add(AddDeleteTable.TABLE_CLASS);

        this.initialize();
    }

    // 初期化
    protected initialize(): void {
        // ヘッダーの作成
        const tr = new oujElement.TableRowElement();
        this.addChild(tr);
        AddDeleteTable.HEADER_LIST.forEach((label: string) => {
            const th = new oujElement.TableHeadElement();
            th.style.overflow = 'auto';
            th.style.resize = 'horizontal';
            th.style.textAlign = 'center';
            th.addChild(new oujElement.TextElement(label));
            tr.addChild(th);
        });

        // 本文の初期値の作成
        this.addSpecializedRow({ title: '初期値1', detail: '詳細1' });
        this.addSpecializedRow({ title: '初期値2', detail: '詳細2' });
        this.addSpecializedRow({ title: '初期値3', detail: '詳細3' });
    }

    // 行を追加
    public addSpecializedRow(rowData: { title: string; detail: string }): void {
        const tr = new oujElement.TableRowElement();
        tr.setDragEventListener(this);
        this.addChild(tr);

        const td1 = new oujElement.TableDataElement();
        td1.addChild(new oujElement.TextElement('≡'));
        td1.style.cursor = 'move';
        td1.setDraggable(true);

        const td2 = new oujElement.TableDataElement();
        td2.addChild(new oujElement.TextElement(rowData.title));

        const td3 = new oujElement.TableDataElement();
        td3.addChild(new oujElement.TextElement(rowData.detail));

        const td4 = new oujElement.TableDataElement();
        const delBtn = new oujElement.InputElement(
            new oujElement.InputProp('削除', 'button', '', false, false, false, '', false),
        );
        const label = new oujElement.LabelElement();
        label.addChild(delBtn);
        td4.addChild(label);
        delBtn.setCustomElementId(AddDeleteTable.DELETE_BTN_ID);
        delBtn.setClickEventListener(this);
        this.deleteBtn2TdMap.push({ deleteBtnId: delBtn.getElementId(), td: td4 });

        tr.addChild(td1);
        tr.addChild(td2);
        tr.addChild(td3);
        tr.addChild(td4);

        td1.style.textAlign = 'center';
        td2.style.textAlign = 'center';
        td3.style.textAlign = 'center';
        td4.style.textAlign = 'center';
    }

    // クリックイベント
    public onElementClickSingle(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        const elementId = element.getElementId();
        if (element.getCustomElementId() === AddDeleteTable.DELETE_BTN_ID) {
            // 削除ボタンクリック
            let matchIndex = this.deleteBtn2TdMap.findIndex(
                (row: { deleteBtnId: string; td: oujElement.TableDataElement }) => {
                    return row.deleteBtnId === elementId;
                },
            );
            if (matchIndex === -1) {
                return;
            }
            const matchTd = this.deleteBtn2TdMap[matchIndex].td;
            const tr = matchTd.getParentRow();
            if (tr === null) {
                return;
            }
            tr.remove();
            this.deleteBtn2TdMap.splice(matchIndex, 1);
        }
    }
    // ダブルクリックイベント
    public onElementClickDBL(element: oujElement.HTMLElement, event: oujElement.DragEvent): void {}
    // 第1ボタン以外のクリックイベント
    public onElementClickAUX(element: oujElement.HTMLElement, event: oujElement.DragEvent): void {}

    // ドラッグ開始
    public onElementDragStart(element: oujElement.HTMLElement, event: oujElement.DragEvent): void {
        if (element instanceof oujElement.TableRowElement) {
            element.style.backgroundColor = '#ccc';
            this.draggingRow = element;
        }
    }
    // ドラッグ中
    public onElementDrag(element: oujElement.HTMLElement, event: oujElement.DragEvent): void {}
    // ドラッグ終了直前
    public onElementDragEnd(element: oujElement.HTMLElement, event: oujElement.DragEvent): void {
        if (element instanceof oujElement.TableRowElement) {
            element.style.backgroundColor = '';
            this.draggingRow = null;
        }
    }
    // ドラッグ終了
    public onElementDrop(element: oujElement.HTMLElement, event: oujElement.DragEvent): void {
        if (element instanceof oujElement.TableRowElement) {
            element.style.backgroundColor = '';
            this.draggingRow = null;
        }
    }
    // 妥当なドロップターゲットに入った
    public onElementDragEnter(element: oujElement.HTMLElement, event: oujElement.DragEvent): void {}
    // 妥当なドロップターゲットの上にある
    public onElementDragOver(element: oujElement.HTMLElement, event: oujElement.DragEvent): void {
        if (element instanceof oujElement.TableRowElement) {
            if (this.draggingRow === null) {
                return; // ドラッグ対象が全く別物
            }
            const rowIndex = element.getRowIndex();
            if (rowIndex === null) {
                return;
            }
            event.event.preventDefault();

            this.deleteChild(this.draggingRow);
            this.insertChildBeforeChildIndex(rowIndex, this.draggingRow);
        }
    }
    // 妥当なドロップターゲットから離れた
    public onElementDragLeave(element: oujElement.HTMLElement, event: oujElement.DragEvent): void {}
}

// サンプルページ3
class ContentPage3 extends BaseContent implements oujElement.ClickEventListener {
    // 追加ボタンのID
    protected static readonly ADD_BTN_ID = 'add_btn_id';
    // テーブル
    protected table: AddDeleteTable;
    // タイトル入力欄
    protected titleInput: oujElement.InputElement;
    // 詳細入力欄
    protected detailInput: oujElement.InputElement;
    // 追加ボタン
    protected addButton: oujElement.InputElement;

    // コンストラクタ
    public constructor() {
        super();

        this.table = new AddDeleteTable();

        this.titleInput = new oujElement.InputElement(
            new oujElement.InputProp('', 'text', '', true, false, false, 'タイトルを入力してください。', false),
        );
        this.detailInput = new oujElement.InputElement(
            new oujElement.InputProp('', 'text', '', true, false, false, '詳細を入力してください。', false),
        );
        this.addButton = new oujElement.InputElement(
            new oujElement.InputProp('追加', 'button', '', true, false, false, '', false),
        );
        this.addButton.setCustomElementId(ContentPage3.ADD_BTN_ID);
        this.addButton.setClickEventListener(this);

        this.initialize();
    }

    // 初期化
    protected initialize(): void {
        // 本文作成

        this.addChild(this.table);

        const label1 = new oujElement.LabelElement();
        const label2 = new oujElement.LabelElement();
        const label3 = new oujElement.LabelElement();

        label1.addChild(this.titleInput);
        label1.addChild(this.detailInput);
        label1.addChild(this.addButton);

        this.addChild(label1);
        this.addChild(label2);
        this.addChild(label3);
    }

    // クリックイベント
    public onElementClickSingle(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        if (element.getCustomElementId() === ContentPage3.ADD_BTN_ID) {
            // 追加ボタンクリック
            if (!this.titleInput.reportValidity() || !this.detailInput.reportValidity()) {
                return;
            }

            this.table.addSpecializedRow({ title: this.titleInput.getValue(), detail: this.detailInput.getValue() });
        }
    }
    // ダブルクリックイベント
    public onElementClickDBL(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}
    // 第1ボタン以外のクリックイベント
    public onElementClickAUX(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}
}

// サンプルページ4
class ContentPage4
    extends BaseContent
    implements oujElement.ClickEventListener, oujElement.FormItemEventListener, oujTask.FileImportEventListener
{
    // 更新ボタンのID
    protected static readonly UPDATE_BTN_ID = 'update_btn_id';
    // 画像の削除
    protected static readonly DELETE_BTN_ID = 'delete_btn_id';
    // ファイルインポートタスクのID
    protected static readonly FILE_IMPORT_TASK_ID = 'file_import_task_id';
    // 画像
    protected imgElem: oujElement.ImageElement;
    // URL入力欄
    protected urlInput: oujElement.InputElement;
    // 画像ファイルの選択
    protected imgFileInput: oujElement.InputElement;
    // 追加ボタン
    protected updateButton: oujElement.InputElement;
    // 削除ボタン
    protected deleteButton: oujElement.InputElement;

    // コンストラクタ
    public constructor() {
        super();

        this.imgElem = new oujElement.ImageElement();
        this.imgElem.setImageProp(new oujElement.ImageProp('', ''));

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

        this.imgFileInput = new oujElement.InputElement(
            new oujElement.InputProp(
                '',
                'file',
                '',
                true,
                false,
                false,
                'URLを入力してください。',
                false,
                '^https?://.*$',
            ),
        );
        this.imgFileInput.setAttribute('accept', 'image/*');
        this.imgFileInput.setFormItemListener(this);

        this.updateButton = new oujElement.InputElement(
            new oujElement.InputProp('更新', 'button', '', true, false, false, '', false),
        );
        this.updateButton.setCustomElementId(ContentPage4.UPDATE_BTN_ID);
        this.updateButton.setClickEventListener(this);

        this.deleteButton = new oujElement.InputElement(
            new oujElement.InputProp('削除', 'button', '', true, false, false, '', false),
        );
        this.deleteButton.setCustomElementId(ContentPage4.DELETE_BTN_ID);
        this.deleteButton.setClickEventListener(this);

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
        label4.addChild(this.imgFileInput);

        this.addChild(label1);
        this.addChild(label2);
        this.addChild(label3);
        this.addChild(label4);

        this.addChild(new oujElement.HRElement());

        this.addChild(this.imgElem);
        this.imgElem.style.display = 'block';
        this.imgElem.style.width = '80vw';
    }

    // クリックイベント
    public onElementClickSingle(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        if (element.getCustomElementId() === ContentPage4.UPDATE_BTN_ID) {
            // 更新ボタンクリック
            if (!this.urlInput.reportValidity()) {
                return;
            }

            const url = this.urlInput.getValue();
            if (!URL.canParse(url)) {
                alert('URL parse error');
                return;
            }
            this.imgElem.setImageProp(new oujElement.ImageProp(url, url));
        } else if (element.getCustomElementId() === ContentPage4.DELETE_BTN_ID) {
            this.imgElem.setImageProp(new oujElement.ImageProp('', ''));
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
        if (element.getElementId() === this.imgFileInput.getElementId()) {
            // 画像の入力
            const file = this.imgFileInput.getFileList()?.item(0);
            if (file === null || file === undefined) {
                return;
            }
            const task = new oujTask.FileImportTask(this);
            task.setCustomTaskId(ContentPage4.FILE_IMPORT_TASK_ID);
            task.startFileImport(oujTask.FileImportType.base64Url, file);
        }
    }

    // インポート後に呼ばれる
    public onFileImportFinish(result: string, imprt: oujTask.FileImportTask): void {
        if (imprt.getCustomTaskId() === ContentPage4.FILE_IMPORT_TASK_ID) {
            // 画像ファイルの読込完了
            this.imgElem.setImageProp(new oujElement.ImageProp(result, ''));
        }
    }
    // インポートに失敗したときに呼ばれる
    public onFileImportFail(imprt: oujTask.FileImportTask): void {
        alert('インポートに失敗しました。');
    }
}

// サンプルページ5
class ContentPage5 extends BaseContent implements oujElement.ClickEventListener {
    // タイマータスク
    protected timerTask: oujTask.TimerTask;
    // 開始・停止ボタン
    protected startEndButton: oujElement.InputElement;
    // リセットボタン
    protected resetButton: oujElement.InputElement;
    // 時間表示用の要素
    protected showTimeText: oujElement.TextElement;

    // 確定済みの秒数(ms)
    protected confirmedTime: number = 0;
    // 開始の時刻
    protected preDateTime: number | null = null;
    // 未確定の秒数(ms)
    protected preConfirmedTime: number = 0;

    // コンストラクタ
    public constructor() {
        super();

        this.timerTask = new (class extends oujTask.TimerTask {
            // delegateクラス
            protected delegate: ContentPage5;

            // 実行するタスク
            public run(): void {
                this.delegate.timerClock();
            }

            // インターバルを取得する(ms)
            // 10より小さいのは禁止
            public getInterval(): number {
                return 10;
            }

            // コンストラクタ
            public constructor(delegate: ContentPage5) {
                super();
                this.delegate = delegate;
            }
        })(this);

        this.startEndButton = new oujElement.InputElement(
            new oujElement.InputProp('開始', 'button', '', true, false, false, '', false),
        );
        this.startEndButton.setClickEventListener(this);

        this.resetButton = new oujElement.InputElement(
            new oujElement.InputProp('リセット', 'button', '', true, false, false, '', false),
        );
        this.resetButton.setClickEventListener(this);

        this.showTimeText = new oujElement.TextElement();

        this.initialize();
    }

    // 初期化
    protected initialize(): void {
        const label1 = new oujElement.LabelElement();
        const label2 = new oujElement.LabelElement();

        label1.addChild(this.startEndButton);
        label2.addChild(this.resetButton);

        this.addChild(label1);
        this.addChild(label2);

        this.addChild(new oujElement.HRElement());

        const p = new oujElement.ParagraphElement();
        p.addChild(new oujElement.TextElement('結果: '));
        p.addChild(this.showTimeText);
        this.addChild(p);

        this.showTimer();
    }

    // 表示欄に時間を表示
    protected showTimer(): void {
        const total = this.confirmedTime + this.preConfirmedTime;
        const time = total > 0 ? Math.trunc(total) : 0;
        if (time === 0) {
            this.showTimeText.setText('');
            return;
        }

        const miliSec = time % 1000;
        const sec = ((time - miliSec) / 1000) % 60;
        const min = (time - miliSec - sec * 1000) / 1000 / 60;

        this.showTimeText.setText(min + ':' + ('00' + sec).slice(-2) + ':' + ('000' + miliSec).slice(-3));
    }

    // タイマーイベント
    public timerClock(): void {
        if (this.preDateTime === null) {
            this.preDateTime = gDate.now();
        }
        const nowDT = gDate.now();
        this.preConfirmedTime = nowDT - this.preDateTime;
        this.showTimer();
    }

    // クリックイベント
    public onElementClickSingle(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        if (element.getElementId() === this.startEndButton.getElementId()) {
            // 開始または停止ボタンクリック
            if (this.timerTask.isTimerRunning()) {
                // タイマーが回っているときは、停止する
                this.timerTask.stop();

                this.preDateTime = null;
                this.confirmedTime += this.preConfirmedTime;
                this.preConfirmedTime = 0;

                this.startEndButton.setInputProp(
                    new oujElement.InputProp('開始', 'button', '', true, false, false, '', false),
                );
            } else {
                // タイマーが止まっているときに再度開始する
                this.timerTask.start();

                this.preDateTime = gDate.now();
                this.preConfirmedTime = 0;

                this.startEndButton.setInputProp(
                    new oujElement.InputProp('停止', 'button', '', true, false, false, '', false),
                );
            }
        } else if (element.getElementId() === this.resetButton.getElementId()) {
            // リセットボタンをクリック
            this.timerTask.stop();

            this.confirmedTime = 0;
            this.preConfirmedTime = 0;
            this.preDateTime = null;

            this.showTimer();
            this.startEndButton.setInputProp(
                new oujElement.InputProp('開始', 'button', '', true, false, false, '', false),
            );
        }
    }
    // ダブルクリックイベント
    public onElementClickDBL(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}
    // 第1ボタン以外のクリックイベント
    public onElementClickAUX(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}
}

// サンプルページ6
class ContentPage6 extends BaseContent implements oujElement.ClickEventListener, oujElement.IframeLoadEventListener {
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
        this.updateButton.setCustomElementId(ContentPage6.UPDATE_BTN_ID);
        this.updateButton.setClickEventListener(this);

        this.deleteButton = new oujElement.InputElement(
            new oujElement.InputProp('削除', 'button', '', true, false, false, '', false),
        );
        this.deleteButton.setCustomElementId(ContentPage6.DELETE_BTN_ID);
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
        if (element.getCustomElementId() === ContentPage6.UPDATE_BTN_ID) {
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
        } else if (element.getCustomElementId() === ContentPage6.DELETE_BTN_ID) {
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

            const task = new oujTask.TaskAjax(new oujTask.TaskAjaxProp(new URL(url), 'GET', 'text', null), this);
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
    public onAjaxEventSuccess(task: oujTask.TaskAjax): void {
        this.showResultField.deleteAllChildren();
        this.showResultField.addChild(new oujElement.TextElement(task.xhr.responseText));
    }
    // 失敗時に呼び出される
    public onAjaxEventFail(task: oujTask.TaskAjax): void {
        alert('ajax通信に失敗しました。');
    }
}

// サンプルページ7
class ContentPage7 extends BaseContent implements oujElement.ClickEventListener {
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

const toppage = new Top([
    new HeaderContentPair(new BaseTopHeader('ヘッダー1'), new ContentPage1()),
    new HeaderContentPair(new BaseTopHeader('ヘッダー2'), new ContentPage2()),
    new HeaderContentPair(new BaseTopHeader('ヘッダー3'), new ContentPage3()),
    new HeaderContentPair(new BaseTopHeader('ヘッダー4'), new ContentPage4()),
    new HeaderContentPair(new BaseTopHeader('ヘッダー5'), new ContentPage5()),
    new HeaderContentPair(new BaseTopHeader('ヘッダー6'), new ContentPage6()),
    new HeaderContentPair(new BaseTopHeader('ヘッダー7'), new ContentPage7()),
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
oujUtil.addStyleSheet({
    media: 'screen',
    cssRules: [
        {
            selectorText: '.' + ContentPage1.CLICK_P_CLASS,
            cssTextList: ['color:red', 'cursor:pointer', 'background-color:yellow', 'width:fit-content'],
        },
    ],
});
oujUtil.addStyleSheet({
    media: 'screen',
    cssRules: [
        {
            selectorText: '.' + BaseTopHeader.SELECTED_CLASS,
            cssTextList: ['color:white', 'background-color:green'],
        },
    ],
});
oujUtil.addStyleSheet({
    media: 'screen',
    cssRules: [
        {
            selectorText: '.' + TopHeaderWrapper.TAB_CLASS,
            cssTextList: ['display:flex', 'cursor:pointer', 'width:fit-content'],
        },
    ],
});
oujUtil.addStyleSheet({
    media: 'screen',
    cssRules: [
        {
            selectorText:
                '.' +
                AddDeleteTable.TABLE_CLASS +
                ', .' +
                AddDeleteTable.TABLE_CLASS +
                ' td' +
                ', .' +
                AddDeleteTable.TABLE_CLASS +
                ' th' +
                ', .' +
                AddDeleteTable.TABLE_CLASS +
                ' tr',
            cssTextList: ['border:2px solid #000;', 'border-collapse:collapse'],
        },
    ],
});

console.log('end');
