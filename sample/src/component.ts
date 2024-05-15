/**
 * サンプルのタブと本文に関する部品
 */
import { element as oujElement, util as oujUtil } from 'objectuijs';

// トップ階層
export class Top extends oujElement.DivElement implements oujElement.ClickEventListener {
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
export class TopHeaderWrapper extends oujElement.DivElement {
    // コンストラクタ
    public constructor() {
        super();

        this.classList.add('header_wrapper');
    }
}

// トップ階層の本文のラッパー
export class TopContentWrapper extends oujElement.DivElement {}

// トップ階層のタブの基底クラス
export class BaseTopHeader extends oujElement.DivElement {
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
            this.classList.add('header_selected');
        } else {
            this.classList.remove('header_selected');
        }
    }
}

// 本文の基底クラス
export class BaseContent extends oujElement.DivElement {}

// タブと本文のペア
export class HeaderContentPair {
    public header: BaseTopHeader;
    public content: BaseContent;

    // コンストラクタ
    public constructor(header: BaseTopHeader, content: BaseContent) {
        this.header = header;
        this.content = content;
    }
}

oujUtil.addStyleSheet({
    media: 'screen',
    cssRules: [
        {
            selectorText: '.header_selected',
            cssTextList: ['color:white', 'background-color:green'],
        },
    ],
});
oujUtil.addStyleSheet({
    media: 'screen',
    cssRules: [
        {
            selectorText: '.header_wrapper',
            cssTextList: ['display:flex', 'cursor:pointer', 'width:fit-content'],
        },
    ],
});
