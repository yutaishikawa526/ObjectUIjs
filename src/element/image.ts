/*
imageのElement
*/
import * as Html from './html';

type gImage = globalThis.HTMLImageElement;

/**
 * 画像のプロパティ
 */
export class ImageProp {
    public src: string;
    public alt: string = '';
    // コンストラクタ
    public constructor(src: string, alt: string = '') {
        this.src = src;
        this.alt = alt;
    }
}

// 画像のElement
export class ImageElement extends Html.HTMLElementVariable<gImage> {
    // コンストラクタ
    public constructor() {
        super(document.createElement('img'));
    }

    // 画像のプロパティを設定する
    public setImageProp(prop: ImageProp): void {
        this.htmlVariable.src = prop.src;
        this.setAttribute('alt', prop.alt);
    }
}
