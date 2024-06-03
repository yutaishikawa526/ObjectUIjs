/**
 * 通常のペン
 */
import { Pen } from './pen';
import { Texture } from '../gl/texture';
import { GLContext } from '../gl/context';
import { DrawLineShader } from '../shader/draw_line';
import { DrawPointsShader } from '../shader/draw_points';
import { DrawStencilColorShader } from '../shader/draw_stencil_color_shader';

export class NormalPen extends Pen {
    // コンテキスト
    protected readonly context: GLContext;
    // 範囲選択shader(2点以上)
    protected readonly selectAreaShader: DrawLineShader;
    // 範囲選択shader(1点)
    protected readonly selectAreaPointShader: DrawPointsShader;
    // 描画shader
    protected readonly drawShader: DrawStencilColorShader;

    // 描画する
    public draw(
        vertexPos: Array<number>, // 頂点配列。2次元で指定。座標系は左上を(0,0)とする。ピクセル指定
        drawColor: { r: number; g: number; b: number; a: number }, // 色
        lineWidth: number, // 太さ。ピクセルで指定
        rect: { width: number; height: number }, // 描画矩形の幅と高さ。ピクセルで指定
        selectAreaTexture: Texture, // 範囲選択のテクスチャ
    ): void {
        this.drawShader.draw({ stencilTexture: selectAreaTexture, color: drawColor });
    }

    // 範囲選択を描画する
    public drawSelectArea(
        vertexPos: Array<number>, // 頂点配列。2次元で指定。座標系は左上を(0,0)とする。ピクセル指定
        lineWidth: number, // 太さ。ピクセルで指定
        rect: { width: number; height: number }, // 描画矩形の幅と高さ。ピクセルで指定
    ): void {
        if (vertexPos.length % 2 !== 0) {
            throw new Error('2の倍数のはずです。');
        }
        const dLength = vertexPos.length / 2;

        const vCol: Array<number> = [];
        for (let i = 0; i < dLength; i++) {
            vCol.push(1.0, 1.0, 1.0, 1.0);
        }

        if (dLength === 1) {
            this.selectAreaPointShader.draw({
                vertexPos: vertexPos,
                vertexColor: vCol,
                radius: lineWidth / 2,
                rect: rect,
                edgeDivision: Math.max(Math.ceil(lineWidth / 4) * 2 + 2, 14),
            });
        } else {
            this.selectAreaShader.draw({
                vertexPos: vertexPos,
                vertexColor: vCol,
                lineWidth: lineWidth / 2,
                rect: rect,
                edgeDivision: Math.max(Math.ceil(lineWidth / 4), 6),
            });
        }
    }

    // コンストラクタ
    public constructor(context: GLContext) {
        super();
        this.context = context;
        this.selectAreaShader = new DrawLineShader(context);
        this.selectAreaPointShader = new DrawPointsShader(context);
        this.drawShader = new DrawStencilColorShader(context);
    }
}
