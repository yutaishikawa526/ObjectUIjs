/**
 * サンプルページ3
 */
import { BaseContent } from '../component';
import { element as oujElement, util as oujUtil } from 'objectuijs';

// サンプルページ3用のテーブル
class AddDeleteTable
    extends oujElement.TableElement
    implements oujElement.ClickEventListener, oujElement.DragEventListener
{
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

        this.classList.add('page3_gbnk893hfugr33');

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
export class Page3 extends BaseContent implements oujElement.ClickEventListener {
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
        this.addButton.setCustomElementId(Page3.ADD_BTN_ID);
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
        if (element.getCustomElementId() === Page3.ADD_BTN_ID) {
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

oujUtil.addStyleSheet({
    media: 'screen',
    cssRules: [
        {
            selectorText:
                '.page3_gbnk893hfugr33' +
                ', .page3_gbnk893hfugr33 td' +
                ', .page3_gbnk893hfugr33 th' +
                ', .page3_gbnk893hfugr33 tr',
            cssTextList: ['border:2px solid #000', 'border-collapse:collapse'],
        },
    ],
});
