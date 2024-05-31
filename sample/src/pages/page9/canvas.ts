/**
 * キャンバス
 *
 * saveChunkとdrawCanvasの整合性が取れているかがわからない…
 * 色の通常のアルファブレントって、色の足し算に対して分配法則が成り立つのか?
 * つまり、a,b,cをrgbaのピクセルだとして、[(a + b) + c = a + (b + c)]が成り立つかどうか
 */
import { element as oujElement, util as oujUtil, task as oujTask } from 'objectuijs';
import { DrawChunk, DrawingList } from './chunk';
import { DrawLineShader } from './shader/draw_line';
import { DrawTextureShader } from './shader/draw_texture';
import { DrawMixTextureShader } from './shader/draw_mix_texture';
import { DrawTextureNoBlendShader } from './shader/draw_texture_noblend';
import { GLContext } from './gl/context';
import { Texture } from './gl/texture';
import { Framebuffer } from './gl/framebuffer';
import { AttributeScope } from './gl/attribute_scope';

// キャンバス
export class Canvas extends oujElement.CanvasElement implements oujElement.MouseEventListener {
    // 現在描画中か
    protected isDrawing: boolean = false;
    // 現在描画中の線
    protected nowDrawing: DrawingList = new DrawingList();
    // chunkの一覧
    protected readonly chunkList: Array<DrawChunk> = [];
    // 戻る中のchunkの一覧
    protected readonly backChunkList: Array<DrawChunk> = [];
    // Canvasのframe bufferのテキスチャ
    protected readonly canvasTexture: Texture;
    // Canvasのframe buffer
    protected readonly canvasFrameBuffer: Framebuffer;
    // 現在描画中のテキスチャ
    protected readonly drawingTexture: Texture;
    // 現在描画中のframebuffer
    protected readonly drawingFrameBuffer: Framebuffer;
    // 高さ
    protected readonly textureHeight: number;
    // 幅
    protected readonly textureWidth: number;
    // glコンテキスト
    protected readonly gl: GLContext;
    // 線の描画のshader
    protected readonly drawLineShader: DrawLineShader;
    // テクスチャ描画のshader
    protected readonly drawTextureShader: DrawTextureShader;
    // 1枚目のテクスチャに2枚目をアルファブレンドしたものをアルファブレンドする
    // frameBuffer + (first + second)の順番
    protected readonly drawMixTextureShader: DrawMixTextureShader;
    // 上書きでのテクスチャの描画
    protected readonly drawTextureNoBlendShader: DrawTextureNoBlendShader;
    // 描画中の線の色
    protected drawColor: { r: number; g: number; b: number; a: number };
    // 描画中の線の太さ
    protected drawLineWidth: number = 10;

    // コンストラクタ
    public constructor(width: number, height: number) {
        super();
        this.setMouseEventListener(this);
        this.setWidthHeight(width, height);

        const gl = this.getWebGLContent();
        if (gl === null) {
            throw new Error('webglが利用できません。');
        }
        this.gl = new GLContext(gl);

        this.drawColor = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 };

        this.drawLineShader = new DrawLineShader(this.gl);
        this.drawTextureShader = new DrawTextureShader(this.gl);
        this.drawMixTextureShader = new DrawMixTextureShader(this.gl);
        this.drawTextureNoBlendShader = new DrawTextureNoBlendShader(this.gl);

        const round2power = function (row: number): number {
            // 数字を2の累乗で丸め込む
            let count: number = 0;
            let now: number = row;
            while (now >= 2) {
                count++;
                now = Math.floor(now / 2);
            }
            let ret = Math.pow(2, count);
            if (ret < row) {
                ret *= 2;
            }
            return ret;
        };

        this.textureHeight = round2power(height);
        this.textureWidth = round2power(width);

        const { texture: tex1, frameBuffer: fb1 } = this.createTextureAndFrameBUffer(
            this.textureWidth,
            this.textureHeight,
        );
        this.canvasTexture = tex1;
        this.canvasFrameBuffer = fb1;

        const { texture: tex2, frameBuffer: fb2 } = this.createTextureAndFrameBUffer(
            this.textureWidth,
            this.textureHeight,
        );
        this.drawingTexture = tex2;
        this.drawingFrameBuffer = fb2;

        // 透明埋め
        this.clearTransparent();
        this.drawCanvas();
    }

    // frame bufferとテクスチャのペアを作成する
    protected createTextureAndFrameBUffer(
        textureWidth: number,
        textureHeight: number,
    ): { texture: Texture; frameBuffer: Framebuffer } {
        const gl = this.gl;

        const texture = gl.createTexture();
        if (texture === null) {
            throw new Error('textureが作成できません。');
        }
        const frameBuffer = gl.createFramebuffer();
        if (frameBuffer === null) {
            throw new Error('frame bufferの作成に失敗しました。');
        }

        gl.texImage2D_RGBA_8BIT(texture, textureWidth, textureHeight, 0, null);

        return { texture: texture, frameBuffer: frameBuffer };
    }

    // 主ボタンが押されているか判定する
    protected isMainButtonDown(event: oujElement.MouseEvent): boolean {
        return event.event.buttons % 2 === 1;
    }

    // frameBufferをcanvasに描画する
    protected drawCanvas(): void {
        const gl = this.gl;

        gl.setDefaultFramebuffer();

        const ccv = gl.getCanvasSize();
        const attrScope = new AttributeScope();
        attrScope.viewport = { x: 0, y: 0, width: ccv.width, height: ccv.height };
        gl.pushAttrScope(attrScope);

        // キャンバスを白で初期化
        gl.clearColor2D(1.0, 1.0, 1.0, 1.0);

        const shader = this.drawMixTextureShader;

        // CanvasとDrawing textureの描画
        shader.draw({ first: this.canvasTexture, second: this.drawingTexture });

        gl.flush();

        gl.popAttrScope();
    }

    // frame bufferを透明埋めする
    protected clearTransparent(drawingOnly: boolean = false): void {
        const gl = this.gl;

        const attrScope = new AttributeScope();
        attrScope.viewport = { x: 0, y: 0, width: this.textureWidth, height: this.textureHeight };
        gl.pushAttrScope(attrScope);

        // drawing frame buffer
        {
            gl.pushFramebuffer(this.drawingFrameBuffer);
            gl.bindTexture2DesignatedFramebuffer(this.drawingFrameBuffer, this.drawingTexture);

            this.gl.clearColor2D(0.0, 0.0, 0.0, 0.0);

            gl.popFramebuffer();
            gl.unbindTexture2D(this.drawingTexture);
        }

        if (drawingOnly) {
            // drawing textureのみ
            return;
        }

        // canvas frame buffer
        {
            gl.pushFramebuffer(this.canvasFrameBuffer);
            gl.bindTexture2DesignatedFramebuffer(this.canvasFrameBuffer, this.canvasTexture);

            this.gl.clearColor2D(0.0, 0.0, 0.0, 0.0);

            gl.popFramebuffer();
            gl.unbindTexture2D(this.canvasTexture);
        }

        gl.popAttrScope();
    }

    // 現在の描画中の線の最新を適用する
    protected drawLastDrawing(): void {
        const dLength = this.nowDrawing.drawingList.length;
        if (dLength < 2) {
            return; // 2点以上必要
        }
        // 直前の2点
        const lastPoint = this.nowDrawing.drawingList[dLength - 1];
        const prePoint = this.nowDrawing.drawingList[dLength - 2];

        const gl = this.gl;

        gl.pushFramebuffer(this.drawingFrameBuffer);
        gl.bindTexture2DesignatedFramebuffer(this.drawingFrameBuffer, this.drawingTexture);

        const attrScope = new AttributeScope();
        attrScope.viewport = { x: 0, y: 0, width: this.textureWidth, height: this.textureHeight };
        gl.pushAttrScope(attrScope);

        const rect = this.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const color = this.drawColor;
        // prettier-ignore
        const vertexPos = [// 頂点座標配列
            prePoint.x * width, prePoint.y * height,
            lastPoint.x * width, lastPoint.y * height,
        ];
        // prettier-ignore
        const vertexColor = [// 頂点色配列
            color.r, color.g, color.b, color.a,
            color.r, color.g, color.b, color.a,
        ];
        const lineWidth = this.drawLineWidth;

        const shader = this.drawLineShader;
        shader.draw({
            vertexPos: vertexPos,
            vertexColor: vertexColor,
            lineWidth: lineWidth,
            rect: { width: width, height: height },
            edgeDivision: Math.max(Math.ceil(lineWidth / 4), 6),
        });
        gl.flush();

        gl.popFramebuffer();
        gl.unbindTexture2D(this.drawingTexture);

        gl.popAttrScope();
    }

    // Canvas textureをUint8Arrayで初期化する
    protected initTextureByPixels(pixels: Uint8Array): void {
        if (pixels.length !== this.textureHeight * this.textureWidth * 4) {
            throw new Error('pixelsのサイズが正しくありません。');
        }
        const gl = this.gl;

        // 透明で初期化
        this.clearTransparent();

        const attrScope = new AttributeScope();
        attrScope.viewport = { x: 0, y: 0, width: this.textureWidth, height: this.textureHeight };
        gl.pushAttrScope(attrScope);

        gl.pushFramebuffer(this.canvasFrameBuffer);
        gl.bindTexture2DesignatedFramebuffer(this.canvasFrameBuffer, this.canvasTexture);

        // ピクセル配列をテクスチャに変換
        const texture = gl.createTexture();
        gl.texImage2D_RGBA_8BIT(texture, this.textureWidth, this.textureHeight, 0, pixels);

        const shader = this.drawTextureNoBlendShader;

        shader.draw(texture);

        gl.flush();

        gl.popFramebuffer();
        gl.unbindTexture2D(this.canvasTexture);

        gl.popAttrScope();
    }

    // 現在のCanvasをChunkに保存する
    protected saveChunk(): void {
        const gl = this.gl;

        gl.pushFramebuffer(this.canvasFrameBuffer);
        gl.bindTexture2DesignatedFramebuffer(this.canvasFrameBuffer, this.canvasTexture);

        const attrScope = new AttributeScope();
        attrScope.viewport = { x: 0, y: 0, width: this.textureWidth, height: this.textureHeight };
        gl.pushAttrScope(attrScope);

        // drawing textureをCanvas textureに描画
        const shader = this.drawTextureShader;
        shader.draw(this.drawingTexture);

        // ピクセルの色情報を取得
        const img = new Uint8Array(this.textureWidth * this.textureHeight * 4);
        gl.readPixels2D(0, 0, this.textureWidth, this.textureHeight, img);
        this.chunkList.push(new DrawChunk(this.nowDrawing, img));
        this.backChunkList.splice(0, this.backChunkList.length);

        // drawing textureを透明化
        this.clearTransparent(true);

        gl.popFramebuffer();
        gl.unbindTexture2D(this.canvasTexture);

        gl.popAttrScope();
    }

    // mouseoverイベント
    public onElementMouseOver(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        if (element.getElementId() !== this.getElementId()) {
            return;
        }
        event.event.stopPropagation();
    }
    // mousedownイベント
    public onElementMouseDown(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        if (element.getElementId() !== this.getElementId()) {
            return;
        }
        event.event.stopPropagation();
        if (!this.isDrawing && this.isMainButtonDown(event)) {
            // 描画開始
            this.isDrawing = true;
            this.nowDrawing.drawingList = [];
            this.setNowDrawingList(element, event);
        }
    }
    // mouseenterイベント
    public onElementMouseEnter(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        if (element.getElementId() !== this.getElementId()) {
            return;
        }
        event.event.stopPropagation();
    }
    // mouseleaveイベント
    public onElementMouseLeave(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        if (element.getElementId() !== this.getElementId()) {
            return;
        }
        event.event.stopPropagation();
    }
    // mousemoveイベント
    public onElementMouseMove(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        if (element.getElementId() !== this.getElementId()) {
            return;
        }
        event.event.stopPropagation();
        if (this.isDrawing && this.isMainButtonDown(event)) {
            // 画像に適用
            this.setNowDrawingList(element, event);
            this.drawLastDrawing();
            this.drawCanvas();
        }
    }
    // mouseupイベント
    public onElementMouseUp(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        if (element.getElementId() !== this.getElementId()) {
            return;
        }
        event.event.stopPropagation();
        if (this.isDrawing && !this.isMainButtonDown(event)) {
            // 描画中かつマウスが上がったとき描画を終了する
            this.isDrawing = false;
            this.setNowDrawingList(element, event);

            // 画像に適用
            this.drawLastDrawing();
            this.drawCanvas();

            // chunkとして保存
            this.saveChunk();

            this.nowDrawing = new DrawingList();
        }
    }
    // mouseoutイベント
    public onElementMouseOut(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        if (element.getElementId() !== this.getElementId()) {
            return;
        }
        event.event.stopPropagation();
    }

    // マウスイベントから現在描画中の描画一覧に保存する
    protected setNowDrawingList(element: oujElement.HTMLElement, event: oujElement.MouseEvent) {
        const cX = event.event.clientX;
        const cY = event.event.clientY;
        const rect = element.getBoundingClientRect();
        const top = rect.top;
        const left = rect.left;
        const w = rect.width;
        const h = rect.height;
        if (w <= 0 || h <= 0) {
            return;
        }
        this.nowDrawing.drawingList.push({ x: (cX - left) / w, y: (cY - top) / h });
    }

    // 戻る処理が可能かどうか
    public canBack(): boolean {
        return this.chunkList.length > 0;
    }

    // 進む処理が可能かどうか
    public canNext(): boolean {
        return this.backChunkList.length > 0;
    }

    // 戻る処理
    public doBack(): void {
        if (!this.canBack()) {
            throw new Error('戻る処理が可能かの判定を行ってください。');
        }
        const last = this.chunkList.pop();
        if (last === undefined) {
            throw new Error('this.canBackの呼び出しによってここは呼ばれないはずです。');
        }
        this.backChunkList.push(last);
        if (this.chunkList.length === 0) {
            this.clearTransparent();
        } else {
            const newLast = this.chunkList[this.chunkList.length - 1];
            this.initTextureByPixels(newLast.image);
        }
        this.drawCanvas();
    }

    // 進む処理
    public doNext(): void {
        if (!this.canNext()) {
            throw new Error('進む処理が可能かの判定を行ってください。');
        }
        const last = this.backChunkList.pop();
        if (last === undefined) {
            throw new Error('this.canNextの呼び出しによってここは呼ばれないはずです。');
        }
        this.chunkList.push(last);
        this.initTextureByPixels(last.image);
        this.drawCanvas();
    }

    // 描画中の線の色を取得する
    public getDrawColor(): { r: number; g: number; b: number; a: number } {
        return this.drawColor;
    }
    // 描画中の線の色を設定する
    public setDrawColor(color: { r: number; g: number; b: number; a: number }): void {
        this.drawColor = color;
    }

    // 描画中の線の太さを取得する
    public getDrawLineWidth(): number {
        return this.drawLineWidth;
    }
    // 描画中の線の太さを設定する
    public setDrawLineWidth(width: number): void {
        this.drawLineWidth = width;
    }
}
