/**
 * サンプルページ8
 */
import { BaseContent } from '../component';
import { element as oujElement, util as oujUtil, task as oujTask } from 'objectuijs';

// SelfComposeの候補の表示欄
class ChoiceSelfCompose extends oujElement.DivElement implements oujElement.ClickEventListener {
    // 候補として表示するSelfCompose
    protected selfCompose: SelfCompose;
    // 削除
    protected deleteButton: oujElement.InputElement;
    // 表示
    protected showButton: oujElement.InputElement;

    // SelfComposeの要素ID
    public getSelfComposeElementId(): string {
        return this.selfCompose.getElementId();
    }

    // コンストラクタ
    public constructor(selfCompose: SelfCompose) {
        super();
        this.selfCompose = selfCompose;

        this.deleteButton = new oujElement.InputElement(
            new oujElement.InputProp('削除', 'button', '', true, false, false, '', false),
        );
        this.deleteButton.setClickEventListener(this);

        this.showButton = new oujElement.InputElement(
            new oujElement.InputProp('表示', 'button', '', true, false, false, '', false),
        );
        this.showButton.setClickEventListener(this);

        this.addChild(new oujElement.TextElement(selfCompose.getTitle()));
        this.addChild(this.deleteButton);
        this.addChild(this.showButton);
        this.style.border = '2px black solid';
    }

    // クリックイベント
    public onElementClickSingle(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        if (element.getElementId() === this.deleteButton.getElementId()) {
            // 削除
            this.selfCompose.removeFromParentSelfCompose();
        } else if (element.getElementId() === this.showButton.getElementId()) {
            // 表示
            this.selfCompose.show2ParentSelfCompose();
        }
    }
    // ダブルクリックイベント
    public onElementClickDBL(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}
    // 第1ボタン以外のクリックイベント
    public onElementClickAUX(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}
}

// 自身を構成要素に持つ要素
class SelfCompose
    extends oujElement.DivElement
    implements oujElement.ClickEventListener, oujElement.DialogCloseEventListener
{
    // 子要素
    protected selfChildren: Array<SelfCompose> = [];
    // 表示中の子要素
    protected showedSelfChildren: Array<SelfCompose> = [];
    // 候補の表示項目
    protected choiceSelfComposeList: Array<ChoiceSelfCompose> = [];
    // 親要素
    protected readonly selfComposeParent: SelfCompose | null;
    // タイトル
    protected title: string;
    // 一覧の表示欄
    protected showListField: oujElement.DivElement;
    // 表示するの子要素の表示欄
    protected showSelfChildrenField: oujElement.DivElement;
    // 非表示ボタン
    protected hideButton: oujElement.InputElement;
    // 候補の新規追加ボタン
    protected addNewChoiceButton: oujElement.InputElement;
    // 候補のタイトル入力欄
    protected newChoiceNameInput: oujElement.InputElement;
    // 連番候補新規追加ボタン
    protected sequenceButton: oujElement.InputElement;
    // 連番
    protected sequence: number = 1;
    // 拡大表示ボタン
    protected expandButton: oujElement.InputElement;
    // 拡大表示用dialog
    protected dialog: oujElement.DialogElement | null = null;
    // ダイアログ閉じるボタンのID
    protected static readonly DIALOG_CLOSE_BTN_ID = 'dialog_close_btn_id';
    // ダイアログ再表示のキー
    protected static readonly DIALOG_REOPEN_KEY = 'reopen_dialog';

    // コンストラクタ
    public constructor(title: string, selfComposeParent: SelfCompose | null = null) {
        super();
        this.selfComposeParent = selfComposeParent;
        this.title = title;
        this.showListField = new oujElement.DivElement();
        this.showSelfChildrenField = new oujElement.DivElement();

        this.classList.add('page8_gg65hst');

        this.addNewChoiceButton = new oujElement.InputElement(
            new oujElement.InputProp('候補追加', 'button', '', true, false, false, '', false),
        );
        this.addNewChoiceButton.setClickEventListener(this);

        this.newChoiceNameInput = new oujElement.InputElement(
            new oujElement.InputProp('', 'text', '', true, false, false, '新しい候補の名前を入力して下さい。', false),
        );

        this.hideButton = new oujElement.InputElement(
            new oujElement.InputProp('非表示', 'button', '', true, false, false, '', false),
        );
        this.hideButton.setClickEventListener(this);

        this.sequenceButton = new oujElement.InputElement(
            new oujElement.InputProp('連番追加', 'button', '', true, false, false, '', false),
        );
        this.sequenceButton.setClickEventListener(this);

        this.expandButton = new oujElement.InputElement(
            new oujElement.InputProp('拡大', 'button', '', true, false, false, '', false),
        );
        this.expandButton.setClickEventListener(this);

        const titleDiv = new oujElement.DivElement();
        const label1 = new oujElement.LabelElement();
        const label2 = new oujElement.LabelElement();
        const label3 = new oujElement.LabelElement();
        const label4 = new oujElement.LabelElement();
        const label5 = new oujElement.LabelElement();
        label1.addChild(this.newChoiceNameInput);
        label2.addChild(this.addNewChoiceButton);
        if (this.selfComposeParent !== null) {
            label3.addChild(this.hideButton);
        }
        label4.addChild(this.sequenceButton);
        label5.addChild(this.expandButton);
        titleDiv.addChild(new oujElement.TextElement(title + ' : '));
        titleDiv.addChild(label1);
        titleDiv.addChild(label2);
        titleDiv.addChild(label4);
        titleDiv.addChild(label3);
        titleDiv.addChild(label5);

        this.addChild(titleDiv);
        this.addChild(this.showSelfChildrenField);
        this.addChild(this.showListField);

        this.style.margin = '0';
        titleDiv.style.margin = '0';
        this.showListField.style.margin = '0';
        this.showSelfChildrenField.style.margin = '0';

        this.style.border = '1px black solid';
        titleDiv.style.border = '1px black solid';
        this.showListField.style.border = '1px black solid';
        this.showSelfChildrenField.style.border = '1px black solid';

        this.style.overflow = 'auto';
        titleDiv.style.overflow = 'auto';
        this.showListField.style.overflow = 'auto';
        this.showSelfChildrenField.style.overflow = 'auto';

        this.style.display = 'flex';
        this.style.flexWrap = 'wrap';
        this.style.alignContent = 'space-around';
        this.style.justifyContent = 'space-around';
        this.showSelfChildrenField.style.display = 'flex';
        this.showSelfChildrenField.style.flexWrap = 'wrap';
        this.showSelfChildrenField.style.alignContent = 'space-around';
        this.showSelfChildrenField.style.justifyContent = 'space-around';

        if (this.selfComposeParent === null) {
            this.style.width = '100%';
            this.style.height = '100%';
        } else {
            this.style.width = '47%';
            this.style.height = '47%';
        }
        titleDiv.style.width = '95%';
        titleDiv.style.height = '5%';
        this.showListField.style.width = '10%';
        this.showListField.style.height = '85%';
        this.showSelfChildrenField.style.width = '85%';
        this.showSelfChildrenField.style.height = '85%';

        this.style.fontSize = '1em';
        this.showSelfChildrenField.style.fontSize = '0.5em';
    }

    // タイトルを取得する
    public getTitle(): string {
        return this.title;
    }

    // 候補を新たに追加する
    protected addChoiceSelfCompose(child: SelfCompose): void {
        this.selfChildren.push(child);
        this.choiceSelfComposeList.push(new ChoiceSelfCompose(child));

        this.setNeedReappendNode();
    }

    // 候補を削除する
    protected deleteChoiceSelfCompose(child: SelfCompose): void {
        this.selfChildren = this.selfChildren.filter((slfC: SelfCompose) => {
            return child.getElementId() !== slfC.getElementId();
        });
        this.showedSelfChildren = this.showedSelfChildren.filter((slfC: SelfCompose) => {
            return child.getElementId() !== slfC.getElementId();
        });
        this.choiceSelfComposeList = this.choiceSelfComposeList.filter((cSlfC: ChoiceSelfCompose) => {
            return child.getElementId() !== cSlfC.getSelfComposeElementId();
        });

        this.setNeedReappendNode();
    }

    // 子要素を新たに表示する
    protected showChildSelfCompose(child: SelfCompose): void {
        // 表示は最大4つまで
        if (this.showedSelfChildren.length >= 4) {
            alert('表示は最大4つまでです。');
            return;
        }
        const index = this.showedSelfChildren.findIndex((slfC: SelfCompose) => {
            return child.getElementId() === slfC.getElementId();
        });
        if (index !== -1) {
            return; // すでに表示済み
        }

        this.showedSelfChildren.push(child);
        this.setNeedReappendNode();
    }

    // 子要素を非表示にする
    protected hideChildSelfCompose(child: SelfCompose): void {
        this.showedSelfChildren = this.showedSelfChildren.filter((slfC: SelfCompose) => {
            return child.getElementId() !== slfC.getElementId();
        });
        this.setNeedReappendNode();
    }

    // 親から取り除く
    public removeFromParentSelfCompose(): void {
        if (this.selfComposeParent !== null) {
            this.selfComposeParent.deleteChoiceSelfCompose(this);
        }
    }

    // 表示する
    public show2ParentSelfCompose(): void {
        if (this.selfComposeParent !== null) {
            this.selfComposeParent.showChildSelfCompose(this);
        }
    }

    // トップの親要素を取得する
    protected getTopParent(): SelfCompose {
        return this.selfComposeParent === null ? this : this.selfComposeParent.getTopParent();
    }

    // 連番を取得し、カウントアップする
    protected getSequenceAndCountUp(): string {
        const top = this.getTopParent();
        if (top.getElementId() === this.getElementId()) {
            const ret = this.sequence;
            this.sequence++;
            return String(ret);
        } else {
            return top.getSequenceAndCountUp();
        }
    }

    // 拡大表示用のダイアログに子要素を表示する
    protected showInDialog(): void {
        if (this.dialog === null) {
            this.dialog = new oujElement.DialogElement();
            this.addChild(this.dialog);
        }
        const dialog = this.dialog;
        if (dialog.isOpen()) {
            return; // すでに表示済み
        }
        dialog.deleteAllChildren();
        dialog.style.overflow = 'scroll';
        dialog.style.width = '90vw';
        dialog.style.height = '90vh';
        dialog.style.fontSize = '1rem';

        const wrapper = new oujElement.DivElement();
        wrapper.style.width = '150vw';
        wrapper.style.height = '150vh';
        wrapper.style.fontSize = '2rem';

        const closeBtn = new oujElement.InputElement(
            new oujElement.InputProp('閉じる', 'button', '', true, false, false, '', false),
        );
        closeBtn.setClickEventListener(this);
        closeBtn.setCustomElementId(SelfCompose.DIALOG_CLOSE_BTN_ID);

        this.deleteChild(this.showSelfChildrenField);
        dialog.addChild(closeBtn);
        dialog.addChild(new oujElement.HRElement());
        dialog.addChild(wrapper);
        wrapper.addChild(this.showSelfChildrenField);
        dialog.setDialogCloseListener(this);
        dialog.showModal();
    }

    // 描画処理の呼び出し前の呼ばれる
    // このメソッド内までにchildElementsを作成する
    public beforeRender(): void {
        this.showListField.deleteAllChildren();
        this.showSelfChildrenField.deleteAllChildren();

        this.showedSelfChildren.forEach((elem: SelfCompose) => {
            // 表示中の子要素を設定
            this.showSelfChildrenField.addChild(elem);
        });

        this.choiceSelfComposeList.forEach((elem: ChoiceSelfCompose) => {
            // 候補の表示
            this.showListField.addChild(elem);
        });
    }

    // クリックイベント
    public onElementClickSingle(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        if (element.getElementId() === this.addNewChoiceButton.getElementId()) {
            // 新規候補追加
            if (!this.newChoiceNameInput.reportValidity()) {
                return;
            }

            const name = this.newChoiceNameInput.getValue();

            this.addChoiceSelfCompose(new SelfCompose(name, this));
        } else if (element.getElementId() === this.hideButton.getElementId()) {
            // 非表示
            if (this.selfComposeParent !== null) {
                this.selfComposeParent.hideChildSelfCompose(this);
                if (this.selfComposeParent.dialog !== null && this.selfComposeParent.dialog.isOpen()) {
                    // ダイアログを表示している場合は再表示
                    this.selfComposeParent.dialog.close(SelfCompose.DIALOG_REOPEN_KEY);
                }
            }
        } else if (element.getElementId() === this.sequenceButton.getElementId()) {
            // 連番で追加
            this.addChoiceSelfCompose(new SelfCompose(this.getSequenceAndCountUp(), this));
        } else if (element.getElementId() === this.expandButton.getElementId()) {
            // 拡大ボタン
            this.showInDialog();
        } else if (element.getCustomElementId() === SelfCompose.DIALOG_CLOSE_BTN_ID) {
            // ダイアログ閉じるボタン
            if (this.dialog !== null) {
                this.dialog.close('');
            }
        }
    }
    // ダブルクリックイベント
    public onElementClickDBL(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}
    // 第1ボタン以外のクリックイベント
    public onElementClickAUX(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}

    // 閉じるイベント
    public onDialogClose(element: oujElement.DialogElement, event: oujElement.DialogCloseEvent): void {
        if (this.dialog !== null && this.dialog.getElementId() === element.getElementId()) {
            element.setDialogCloseListener(null);
            element.deleteAllChildren();
            this.insertChildBeforeId(this.showListField.getElementId(), this.showSelfChildrenField);
            if (element.getRetValue() === SelfCompose.DIALOG_REOPEN_KEY) {
                // 再表示
                this.showInDialog();
            }
        }
    }
}

// サンプルページ8
export class Page8 extends BaseContent {
    // コンストラクタ
    public constructor() {
        super();

        const wrapper = new oujElement.DivElement();
        wrapper.style.display = 'block';
        wrapper.style.width = '80vw';
        wrapper.style.height = '80vh';

        const selfCompose = new SelfCompose('トップ');

        this.addChild(wrapper);
        wrapper.addChild(selfCompose);
    }
}

oujUtil.addStyleSheet({
    media: 'screen',
    cssRules: [
        {
            selectorText: '.page8_gg65hst *',
            cssTextList: ['font-size:1em', 'margin:0', 'padding:0', 'border-width: 0.1em', 'line-height: 1.5em'],
        },
    ],
});
