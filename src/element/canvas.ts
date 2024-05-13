/*
canvasのElement
*/
import * as Html from './html';

type gCanvas = globalThis.HTMLCanvasElement;
type g2DContext = globalThis.CanvasRenderingContext2D;
type g2DSettings = globalThis.CanvasRenderingContext2DSettings;
type gWebGLContext = globalThis.WebGLRenderingContext;
type gWebGLContextAttributes = globalThis.WebGLContextAttributes;

// canvasのElement
export class CanvasElement extends Html.HTMLElementVariable<gCanvas> {
    // コンストラクタ
    public constructor() {
        super(document.createElement('canvas'));
    }

    // width,heightを設定する
    public setWidthHeight(width: number, height: number) {
        this.htmlVariable.width = width;
        this.htmlVariable.height = height;
    }

    /**
     * base64形式のURLを取得する
     * @param type 画像のタイプ。省略時は「image/png」
     * @param quality 0から1の画像の非可逆圧縮の割合
     * @returns base64形式のURL
     */
    public getDataUrl(type: string | undefined = undefined, quality: string | undefined = undefined): string {
        return this.htmlVariable.toDataURL(type, quality);
    }

    // キャンバスAPIのコンテキストを取得する
    public get2DContext(options: g2DSettings | undefined = undefined): g2DContext | null {
        return this.htmlVariable.getContext('2d', options);
    }

    // webglのコンテキストを取得する
    public getWebGLContent(attributes: gWebGLContextAttributes | undefined = undefined): gWebGLContext | null {
        return this.htmlVariable.getContext('webgl', attributes);
    }

    // webgl2のコンテキストを取得する
    public getWebGL2Content(attributes: gWebGLContextAttributes | undefined = undefined): gWebGLContext | null {
        return this.htmlVariable.getContext('webgl2', attributes);
    }
}
