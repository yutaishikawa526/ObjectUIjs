/**
 * キャンバス
 *
 * saveChunkとdrawCanvasの整合性が取れているかがわからない…
 * 色の通常のアルファブレントって、色の足し算に対して分配法則が成り立つのか?
 * つまり、a,b,cをrgbaのピクセルだとして、[(a + b) + c = a + (b + c)]が成り立つかどうか
 */
import { element as oujElement, util as oujUtil, task as oujTask } from 'objectuijs';
import { DrawChunk, DrawingList } from './chunk';
import { DrawTextureShader } from './shader/draw_texture';
import { DrawMixTextureShader } from './shader/draw_mix_texture';
import { DrawTextureNoBlendShader } from './shader/draw_texture_noblend';
import { gl as oujGL } from 'objectuijs';
import { NormalPen } from './pen/normal_pen';

// キャンバス
export class Canvas
    extends oujElement.CanvasElement
    implements oujElement.MouseEventListener, oujElement.TouchEventListener
{
    // 現在描画中か
    protected isDrawing: boolean = false;
    // 現在描画中の線
    protected nowDrawing: DrawingList = new DrawingList();
    // chunkの一覧
    protected readonly chunkList: Array<DrawChunk> = [];
    // 戻る中のchunkの一覧
    protected readonly backChunkList: Array<DrawChunk> = [];
    // Canvasのframebufferのテキスチャ
    protected readonly canvasTexture: oujGL.Texture;
    // Canvasのframebuffer
    protected readonly canvasFrameBuffer: oujGL.Framebuffer;
    // 現在描画中のテキスチャ
    protected readonly drawingTexture: oujGL.Texture;
    // 現在描画中のframebuffer
    protected readonly drawingFrameBuffer: oujGL.Framebuffer;
    // 選択範囲のテクスチャ
    protected readonly selectAreaTexture: oujGL.Texture;
    // 選択範囲のframebuffer
    protected readonly selectAreaFramebuffer: oujGL.Framebuffer;
    // 高さ
    protected readonly textureHeight: number;
    // 幅
    protected readonly textureWidth: number;
    // glコンテキスト
    protected readonly gl: oujGL.GLContext;
    // テクスチャ描画のshader
    protected readonly drawTextureShader: DrawTextureShader;
    // 1枚目のテクスチャに2枚目をアルファブレンドしたものをアルファブレンドする
    // frameBuffer + (first + second)の順番
    protected readonly drawMixTextureShader: DrawMixTextureShader;
    // 上書きでのテクスチャの描画
    protected readonly drawTextureNoBlendShader: DrawTextureNoBlendShader;
    // 通常ペン
    protected readonly normalPen: NormalPen;
    // 描画中の線の色
    protected drawColor: { r: number; g: number; b: number; a: number };
    // 描画中の線の太さ
    protected drawLineWidth: number = 10;

    // コンストラクタ
    public constructor(width: number, height: number) {
        super();
        this.setMouseEventListener(this);
        this.setTouchEventListener(this);
        this.setWidthHeight(width, height);

        const gl = this.getWebGLContent();
        if (gl === null) {
            throw new Error('webglが利用できません。');
        }
        this.gl = new oujGL.GLContext(gl);

        this.drawColor = { r: 0.0, g: 0.0, b: 0.0, a: 1.0 };

        this.drawTextureShader = new DrawTextureShader(this.gl);
        this.drawMixTextureShader = new DrawMixTextureShader(this.gl);
        this.drawTextureNoBlendShader = new DrawTextureNoBlendShader(this.gl);
        this.normalPen = new NormalPen(this.gl);

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

        const { texture: tex3, frameBuffer: fb3 } = this.createTextureAndFrameBUffer(
            this.textureWidth,
            this.textureHeight,
        );
        this.selectAreaTexture = tex3;
        this.selectAreaFramebuffer = fb3;

        // 透明埋め
        this.clearTransparent();
        this.drawCanvas();
    }

    // frame bufferとテクスチャのペアを作成する
    protected createTextureAndFrameBUffer(
        textureWidth: number,
        textureHeight: number,
    ): { texture: oujGL.Texture; frameBuffer: oujGL.Framebuffer } {
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
    // touchが一本指かどうか判定する
    protected isSingleFingure(event: oujElement.TouchEvent): boolean {
        return event.event.touches.length === 1;
    }

    // frameBufferをcanvasに描画する
    protected drawCanvas(): void {
        const gl = this.gl;

        gl.setDefaultFramebuffer();

        const ccv = gl.getCanvasSize();
        const attr = new oujGL.ContextAttribute();
        attr.viewport = { x: 0, y: 0, width: ccv.width, height: ccv.height };

        new oujGL.ContextScope(
            () => {
                // キャンバスを白で初期化
                gl.clearColor2D(1.0, 1.0, 1.0, 1.0);

                const shader = this.drawMixTextureShader;

                // CanvasとDrawing textureの描画
                shader.draw({ first: this.canvasTexture, second: this.drawingTexture });

                gl.flush();
            },
            gl,
            attr,
            null,
            null,
        );
    }

    // framebufferを透明埋めする
    protected clearTransparent(drawingOnly: boolean = false): void {
        const gl = this.gl;

        const attr = new oujGL.ContextAttribute();
        attr.viewport = { x: 0, y: 0, width: this.textureWidth, height: this.textureHeight };

        new oujGL.ContextScope(
            () => {
                new oujGL.ContextScope(
                    () => {
                        this.gl.clearColor2D(0.0, 0.0, 0.0, 0.0);
                    },
                    gl,
                    null,
                    this.drawingFrameBuffer,
                    this.drawingTexture,
                );

                new oujGL.ContextScope(
                    () => {
                        this.gl.clearColor2D(0.0, 0.0, 0.0, 0.0);
                    },
                    gl,
                    null,
                    this.selectAreaFramebuffer,
                    this.selectAreaTexture,
                );

                if (drawingOnly) {
                    // drawing texture(とselect area texture)のみ
                    return;
                }

                new oujGL.ContextScope(
                    () => {
                        this.gl.clearColor2D(0.0, 0.0, 0.0, 0.0);
                    },
                    gl,
                    null,
                    this.canvasFrameBuffer,
                    this.canvasTexture,
                );
            },
            gl,
            attr,
            null,
            null,
        );
    }

    // 現在の描画中の線の最新を適用する
    protected drawLastDrawing(): void {
        const dLength = this.nowDrawing.drawingList.length;
        if (dLength < 1) {
            return; // 1点以上必要
        }

        const rect = this.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const color = this.drawColor;
        const lineWidth = this.drawLineWidth;

        const attr = new oujGL.ContextAttribute();
        attr.viewport = { x: 0, y: 0, width: this.textureWidth, height: this.textureHeight };

        // 選択範囲の描画
        new oujGL.ContextScope(
            () => {
                if (dLength === 1) {
                    // 1点
                    const lastPoint = this.nowDrawing.drawingList[dLength - 1];
                    // prettier-ignore
                    const vertexPos = [// 頂点座標配列
                    lastPoint.x * width, lastPoint.y * height,
                ];
                    this.normalPen.drawSelectArea(vertexPos, lineWidth / 2, { width: width, height: height });
                } else {
                    // 2点以上
                    // 直前の2点
                    const lastPoint = this.nowDrawing.drawingList[dLength - 1];
                    const prePoint = this.nowDrawing.drawingList[dLength - 2];
                    // prettier-ignore
                    const vertexPos = [// 頂点座標配列
                    prePoint.x * width, prePoint.y * height,
                    lastPoint.x * width, lastPoint.y * height,
                ];
                    this.normalPen.drawSelectArea(vertexPos, lineWidth, { width: width, height: height });
                }
            },
            this.gl,
            attr,
            this.selectAreaFramebuffer,
            this.selectAreaTexture,
        );

        // drawing textureへ描画
        new oujGL.ContextScope(
            () => {
                this.normalPen.draw([], color, 0, { width: 0, height: 0 }, this.selectAreaTexture);
            },
            this.gl,
            attr,
            this.drawingFrameBuffer,
            this.drawingTexture,
        );
    }

    // Canvas textureをUint8Arrayで初期化する
    protected initTextureByPixels(pixels: Uint8Array): void {
        if (pixels.length !== this.textureHeight * this.textureWidth * 4) {
            throw new Error('pixelsのサイズが正しくありません。');
        }
        const gl = this.gl;

        // 透明で初期化
        this.clearTransparent();

        const attr = new oujGL.ContextAttribute();
        attr.viewport = { x: 0, y: 0, width: this.textureWidth, height: this.textureHeight };

        new oujGL.ContextScope(
            () => {
                // ピクセル配列をテクスチャに変換
                const texture = gl.createTexture();
                gl.texImage2D_RGBA_8BIT(texture, this.textureWidth, this.textureHeight, 0, pixels);

                const shader = this.drawTextureNoBlendShader;

                shader.draw(texture);

                gl.flush();
            },
            gl,
            attr,
            this.canvasFrameBuffer,
            this.canvasTexture,
        );
    }

    // 現在のCanvasをChunkに保存する
    protected saveChunk(): void {
        const gl = this.gl;

        const attr = new oujGL.ContextAttribute();
        attr.viewport = { x: 0, y: 0, width: this.textureWidth, height: this.textureHeight };

        new oujGL.ContextScope(
            () => {
                // drawing textureをCanvas textureに描画
                const shader = this.drawTextureShader;
                shader.draw(this.drawingTexture);

                // ピクセルの色情報を取得
                const img = new Uint8Array(this.textureWidth * this.textureHeight * 4);
                gl.readPixels2D(0, 0, this.textureWidth, this.textureHeight, img);
                this.chunkList.push(new DrawChunk(this.nowDrawing, img));
                this.backChunkList.splice(0, this.backChunkList.length);
            },
            gl,
            attr,
            this.canvasFrameBuffer,
            this.canvasTexture,
        );

        // drawing textureを透明化
        this.clearTransparent(true);
    }

    // mouseoverイベント
    public onElementMouseOver(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        if (element.getElementId() !== this.getElementId()) {
            return;
        }
        event.event.stopPropagation();
        if (event.event.cancelable) {
            event.event.preventDefault();
        }
    }
    // mousedownイベント
    public onElementMouseDown(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        if (element.getElementId() !== this.getElementId()) {
            return;
        }
        event.event.stopPropagation();
        if (event.event.cancelable) {
            event.event.preventDefault();
        }
        if (!this.isDrawing && this.isMainButtonDown(event)) {
            // 描画開始
            this.isDrawing = true;
            this.nowDrawing.drawingList = [];
            this.setNowDrawingList(element, event);
            this.drawLastDrawing();
            this.drawCanvas();
        }
    }
    // mouseenterイベント
    public onElementMouseEnter(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        if (element.getElementId() !== this.getElementId()) {
            return;
        }
        event.event.stopPropagation();
        if (event.event.cancelable) {
            event.event.preventDefault();
        }
    }
    // mouseleaveイベント
    public onElementMouseLeave(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        if (element.getElementId() !== this.getElementId()) {
            return;
        }
        event.event.stopPropagation();
        if (event.event.cancelable) {
            event.event.preventDefault();
        }
        if (this.isDrawing) {
            // マウスが離れたとき描画を終了する
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
    // mousemoveイベント
    public onElementMouseMove(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        if (element.getElementId() !== this.getElementId()) {
            return;
        }
        event.event.stopPropagation();
        if (event.event.cancelable) {
            event.event.preventDefault();
        }
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
        if (event.event.cancelable) {
            event.event.preventDefault();
        }
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
        if (event.event.cancelable) {
            event.event.preventDefault();
        }
        if (this.isDrawing) {
            // マウスが離れたとき描画を終了する
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

    // タッチ開始
    public onElementTouchStart(element: oujElement.HTMLElement, event: oujElement.TouchEvent): void {
        if (element.getElementId() !== this.getElementId()) {
            return;
        }
        event.event.stopPropagation();
        if (event.event.cancelable) {
            event.event.preventDefault();
        }
        if (!this.isDrawing && this.isSingleFingure(event)) {
            // 描画開始
            this.isDrawing = true;
            this.nowDrawing.drawingList = [];
            this.setNowDrawingListByTouch(element, event);
        }
    }
    // タッチ中
    public onElementTouchMove(element: oujElement.HTMLElement, event: oujElement.TouchEvent): void {
        if (element.getElementId() !== this.getElementId()) {
            return;
        }
        event.event.stopPropagation();
        if (event.event.cancelable) {
            event.event.preventDefault();
        }
        if (this.isDrawing && this.isSingleFingure(event)) {
            // 画像に適用
            this.setNowDrawingListByTouch(element, event);
            this.drawLastDrawing();
            this.drawCanvas();
        }
    }
    // タッチ終了
    public onElementTouchEnd(element: oujElement.HTMLElement, event: oujElement.TouchEvent): void {
        if (element.getElementId() !== this.getElementId()) {
            return;
        }
        event.event.stopPropagation();
        if (event.event.cancelable) {
            event.event.preventDefault();
        }
        if (this.isDrawing && !this.isSingleFingure(event)) {
            // 描画中かつ一本指でなくなったときに描画を終了する
            this.isDrawing = false;

            // chunkとして保存
            this.saveChunk();

            this.nowDrawing = new DrawingList();
        }
    }
    // タッチキャンセル
    public onElementTouchCancel(element: oujElement.HTMLElement, event: oujElement.TouchEvent): void {
        if (element.getElementId() !== this.getElementId()) {
            return;
        }
        event.event.stopPropagation();
        if (event.event.cancelable) {
            event.event.preventDefault();
        }
        if (this.isDrawing) {
            this.isDrawing = false;

            // chunkとして保存
            this.saveChunk();

            this.nowDrawing = new DrawingList();
        }
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

    // touchイベントから現在描画中の描画一覧に保存する
    protected setNowDrawingListByTouch(element: oujElement.HTMLElement, event: oujElement.TouchEvent) {
        if (event.event.touches.length === 0) {
            return;
        }
        const cX = event.event.touches[0].clientX;
        const cY = event.event.touches[0].clientY;
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
