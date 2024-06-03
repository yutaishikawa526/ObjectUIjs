/**
 * 描画ペンの基底クラス
 */
import { gl as oujGL } from 'objectuijs';

export abstract class Pen {
    // 描画する
    public abstract draw(
        vertexPos: Array<number>, // 頂点配列。2次元で指定。座標系は左上を(0,0)とする。ピクセル指定
        drawColor: { r: number; g: number; b: number; a: number }, // 色
        lineWidth: number, // 太さ。ピクセルで指定
        rect: { width: number; height: number }, // 描画矩形の幅と高さ。ピクセルで指定
        selectAreaTexture: oujGL.Texture, // 範囲選択のテクスチャ
    ): void;

    // 範囲選択を描画する
    public abstract drawSelectArea(
        vertexPos: Array<number>, // 頂点配列。2次元で指定。座標系は左上を(0,0)とする。ピクセル指定
        lineWidth: number, // 太さ。ピクセルで指定
        rect: { width: number; height: number }, // 描画矩形の幅と高さ。ピクセルで指定
    ): void;
}
