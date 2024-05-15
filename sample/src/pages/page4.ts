/**
 * サンプルページ4
 */
import { BaseContent } from '../component';
import { element as oujElement, task as oujTask } from 'objectuijs';

// サンプルページ4
export class Page4
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
        this.updateButton.setCustomElementId(Page4.UPDATE_BTN_ID);
        this.updateButton.setClickEventListener(this);

        this.deleteButton = new oujElement.InputElement(
            new oujElement.InputProp('削除', 'button', '', true, false, false, '', false),
        );
        this.deleteButton.setCustomElementId(Page4.DELETE_BTN_ID);
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
        if (element.getCustomElementId() === Page4.UPDATE_BTN_ID) {
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
        } else if (element.getCustomElementId() === Page4.DELETE_BTN_ID) {
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
            task.setCustomTaskId(Page4.FILE_IMPORT_TASK_ID);
            task.startFileImport(oujTask.FileImportType.base64Url, file);
        }
    }

    // インポート後に呼ばれる
    public onFileImportFinish(result: string, imprt: oujTask.FileImportTask): void {
        if (imprt.getCustomTaskId() === Page4.FILE_IMPORT_TASK_ID) {
            // 画像ファイルの読込完了
            this.imgElem.setImageProp(new oujElement.ImageProp(result, ''));
        }
    }
    // インポートに失敗したときに呼ばれる
    public onFileImportFail(imprt: oujTask.FileImportTask): void {
        alert('インポートに失敗しました。');
    }
}
