/**
 * glのコンテキスト
 *
 * テクスチャのbindインデックスとbind番号について、bindインデックスはWebGLRenderingContext.TEXTURE0等が対応し、
 * bind番号はTEXTURE0なら0、TEXTURE5なら5が対応する
 */
import { DrawType, TextureMinMagFilter, TextureWrapFilter, BufferStoreType, AttributeType, BlendType } from './type';
import { Texture } from './texture';
import { Framebuffer } from './framebuffer';
import { ArrayBuffer } from './array_buffer';
import { GLObject } from './gl_object';
import { AttributeScope } from './attribute_scope';

// bind情報
type BindInfo = { bindIndex: number; bindNumber: number };

// テクスチャIDとbind情報の紐づけ
type TexBindInfo = { texId: number; bindInfo: BindInfo };

// webglのコンテキストのラッパークラス
export class GLContext {
    // コンテキストの生データ
    private readonly glContext: WebGLRenderingContext;
    // 使用中テクスチャbind番号とテクスチャIDの組合せ
    private usingTexBindInfoList: Array<TexBindInfo> = [];
    // 最大のテクスチャのbindできる数
    public readonly maxTextureCount: number;
    // framebufferのスタック
    private framebufferStack: Array<Framebuffer> = [];
    // 有効なGLObjectのID一覧
    private objectIdList: Array<number> = [];
    // 属性のスコープのスタック
    private attrScopeStack: Array<AttributeScope> = [];

    // コンストラクタ
    public constructor(gl: WebGLRenderingContext) {
        this.glContext = gl;
        this.maxTextureCount = Number(gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS));
    }

    // ----------- 内部で使用 -------------

    // テクスチャとしてbindできるBindInfoの一覧
    private getBindInfoList(): Array<BindInfo> {
        const gl = this.glContext;
        let list: Array<number> = [
            gl.TEXTURE0,
            gl.TEXTURE1,
            gl.TEXTURE2,
            gl.TEXTURE3,
            gl.TEXTURE4,
            gl.TEXTURE5,
            gl.TEXTURE6,
            gl.TEXTURE7,
            gl.TEXTURE8,
            gl.TEXTURE9,
            gl.TEXTURE10,
            gl.TEXTURE11,
            gl.TEXTURE12,
            gl.TEXTURE13,
            gl.TEXTURE14,
            gl.TEXTURE15,
            gl.TEXTURE16,
            gl.TEXTURE17,
            gl.TEXTURE18,
            gl.TEXTURE19,
            gl.TEXTURE20,
            gl.TEXTURE21,
            gl.TEXTURE22,
            gl.TEXTURE23,
            gl.TEXTURE24,
            gl.TEXTURE25,
            gl.TEXTURE26,
            gl.TEXTURE27,
            gl.TEXTURE28,
            gl.TEXTURE29,
            gl.TEXTURE30,
            gl.TEXTURE31,
        ];
        list = list.slice(0, this.maxTextureCount - 1);
        return list.map((bindIndex: number, bindNumber: number) => {
            return { bindIndex: bindIndex, bindNumber: bindNumber };
        });
    }

    // テクスチャがbind済みかどうか
    private isTextureBind(texture: Texture): TexBindInfo | null {
        const t2b = this.usingTexBindInfoList.find((t2b: TexBindInfo) => {
            return texture.getTextureId() === t2b.texId;
        });
        return t2b === undefined ? null : t2b;
    }

    // 新しいテクスチャbind番号とbindインデックスを取得する
    private getNewTexBindInfo(): BindInfo {
        const bindInfoList = this.getBindInfoList();
        const usingBindNumberList: Array<number> = this.usingTexBindInfoList.map((t2b: TexBindInfo) => {
            return t2b.bindInfo.bindNumber;
        });
        const binfo = bindInfoList.find((bindInfo: BindInfo) => {
            return usingBindNumberList.indexOf(bindInfo.bindNumber) === -1;
        });
        if (binfo === undefined) {
            throw new Error('textureの上限に達しました。');
        }
        return binfo;
    }

    // GLObjectがこのコンテキストで有効かどうか判定する
    // 無効なときは例外を発生する
    private checkGLObject(glObj: GLObject): void {
        const index = this.objectIdList.find((id: number) => {
            return glObj.objectId === id;
        });
        if (index === undefined) {
            throw new Error('GLObjectがこのコンテキストでは有効ではありません。');
        }
    }

    // GLObjectを登録する
    private registerGLObject(glObj: GLObject): void {
        const index = this.objectIdList.find((id: number) => {
            return glObj.objectId === id;
        });
        if (index === undefined) {
            this.objectIdList.push(glObj.objectId);
        }
    }

    // GLObjectの登録を解除する
    private unregisterGLObject(glObj: GLObject): void {
        this.objectIdList = this.objectIdList.filter((id: number) => {
            return glObj.objectId !== id;
        });
    }

    // デフォルトの属性スコープを取得する
    private getDefaultAttrScope(): AttributeScope {
        const attr = new AttributeScope();
        attr.blend = false;
        attr.culling = false;
        attr.depth = false;
        attr.blendFunc = { src: BlendType.ONE, dest: BlendType.ZERO };
        attr.frontFaceCCW = true;
        const cvv = this.getCanvasSize();
        attr.viewport = { x: 0, y: 0, width: cvv.width, height: cvv.height };
        return attr;
    }

    // 属性スコープを指定して適用する
    private appendAttrScope(attr: AttributeScope): void {
        const gl = this.glContext;

        if (attr.blend === true) {
            gl.enable(gl.BLEND);
        } else {
            gl.disable(gl.BLEND);
        }
        if (attr.culling === true) {
            gl.enable(gl.CULL_FACE);
        } else {
            gl.disable(gl.CULL_FACE);
        }
        if (attr.depth === true) {
            gl.enable(gl.DEPTH_TEST);
        } else {
            gl.disable(gl.DEPTH_TEST);
        }
        if (attr.blendFunc === null) {
            gl.blendFunc(gl.ONE, gl.ZERO);
        } else {
            const type2func = function (type: BlendType): number {
                let func: number = gl.ZERO;
                switch (type) {
                    case BlendType.ZERO:
                        func = gl.ZERO;
                        break;
                    case BlendType.ONE:
                        func = gl.ONE;
                        break;
                    case BlendType.SRC_COLOR:
                        func = gl.SRC_COLOR;
                        break;
                    case BlendType.ONE_MINUS_SRC_COLOR:
                        func = gl.ONE_MINUS_SRC_COLOR;
                        break;
                    case BlendType.DST_COLOR:
                        func = gl.DST_COLOR;
                        break;
                    case BlendType.ONE_MINUS_DST_COLOR:
                        func = gl.ONE_MINUS_DST_COLOR;
                        break;
                    case BlendType.SRC_ALPHA:
                        func = gl.SRC_ALPHA;
                        break;
                    case BlendType.ONE_MINUS_SRC_ALPHA:
                        func = gl.ONE_MINUS_SRC_ALPHA;
                        break;
                    case BlendType.DST_ALPHA:
                        func = gl.DST_ALPHA;
                        break;
                    case BlendType.ONE_MINUS_DST_ALPHA:
                        func = gl.ONE_MINUS_DST_ALPHA;
                        break;
                    case BlendType.CONSTANT_COLOR:
                        func = gl.CONSTANT_COLOR;
                        break;
                    case BlendType.ONE_MINUS_CONSTANT_COLOR:
                        func = gl.ONE_MINUS_CONSTANT_COLOR;
                        break;
                    case BlendType.CONSTANT_ALPHA:
                        func = gl.CONSTANT_ALPHA;
                        break;
                    case BlendType.ONE_MINUS_CONSTANT_ALPHA:
                        func = gl.ONE_MINUS_CONSTANT_ALPHA;
                        break;
                    case BlendType.SRC_ALPHA_SATURATE:
                        func = gl.SRC_ALPHA_SATURATE;
                        break;
                    default:
                        break;
                }
                return func;
            };
            gl.blendFunc(type2func(attr.blendFunc.src), type2func(attr.blendFunc.dest));
        }
        if (attr.viewport === null) {
            const cvv = this.getCanvasSize();
            gl.viewport(0, 0, cvv.width, cvv.height);
        } else {
            const vp = attr.viewport;
            gl.viewport(vp.x, vp.y, vp.width, vp.height);
        }
    }

    // ----------- テクスチャ関連の処理 -------------

    // テクスチャを作成する
    public createTexture(): Texture {
        const texture = this.glContext.createTexture();
        if (texture === null) {
            throw new Error('テクスチャの作成に失敗しました。');
        }
        const texObj = new Texture(this, texture);
        this.registerGLObject(texObj);
        return texObj;
    }

    /**
     * テクスチャをbindする
     * @param texture テクスチャ
     * @returns bindしたテクスチャの番号
     */
    public bindTexture2D(texture: Texture): number {
        this.checkGLObject(texture);
        const gl = this.glContext;

        const t2b = this.isTextureBind(texture);
        if (t2b === null) {
            // 未登録
            const { bindNumber: bindNumber, bindIndex: bindIndex } = this.getNewTexBindInfo();
            gl.activeTexture(bindIndex);
            gl.bindTexture(gl.TEXTURE_2D, texture.glTexture);
            this.usingTexBindInfoList.push({
                texId: texture.getTextureId(),
                bindInfo: { bindIndex: bindIndex, bindNumber: bindNumber },
            });
            return bindNumber;
        } else {
            // 登録済み
            return t2b.bindInfo.bindNumber;
        }
    }

    // テクスチャをunbindする
    public unbindTexture2D(texture: Texture): void {
        this.checkGLObject(texture);
        const gl = this.glContext;

        const t2b = this.isTextureBind(texture);
        if (t2b === null) {
            // 未登録
            return;
        }

        const bindNumber = t2b.bindInfo.bindNumber;
        const bindIndex = t2b.bindInfo.bindIndex;
        gl.activeTexture(bindIndex);
        gl.bindTexture(gl.TEXTURE_2D, null);
        this.usingTexBindInfoList = this.usingTexBindInfoList.filter((t2b: TexBindInfo) => {
            return t2b.bindInfo.bindNumber !== bindNumber;
        });
    }

    // テクスチャにMipmapを作成する
    public generateMipmap2D(texture: Texture): void {
        this.checkGLObject(texture);
        const gl = this.glContext;

        const texUnbinded = this.isTextureBind(texture) !== null;
        this.bindTexture2D(texture);
        gl.generateMipmap(gl.TEXTURE_2D);
        if (texUnbinded) {
            this.unbindTexture2D(texture); // もともと登録されていなければ登録解除する
        }
    }

    // テクスチャを削除する
    public deleteTexture(texture: Texture): void {
        this.checkGLObject(texture);

        this.unbindTexture2D(texture);
        this.glContext.deleteTexture(texture.glTexture);
        this.unregisterGLObject(texture);
    }

    // テクスチャの拡大縮小フィルターを設定する
    public setTextureMinMagFilter2D(
        texture: Texture,
        minFilter: TextureMinMagFilter,
        magFilter: TextureMinMagFilter,
    ): void {
        this.checkGLObject(texture);
        const gl = this.glContext;

        let minParam: number = gl.NEAREST_MIPMAP_LINEAR;
        let magParam: number = gl.LINEAR;

        switch (minFilter) {
            case TextureMinMagFilter.LINEAR:
                minParam = gl.LINEAR;
                break;
            case TextureMinMagFilter.NEAREST:
                minParam = gl.NEAREST;
                break;
            case TextureMinMagFilter.NEAREST_MIPMAP_NEAREST:
                minParam = gl.NEAREST_MIPMAP_NEAREST;
                break;
            case TextureMinMagFilter.LINEAR_MIPMAP_NEAREST:
                minParam = gl.LINEAR_MIPMAP_NEAREST;
                break;
            case TextureMinMagFilter.NEAREST_MIPMAP_LINEAR:
                minParam = gl.NEAREST_MIPMAP_LINEAR;
                break;
            case TextureMinMagFilter.LINEAR_MIPMAP_LINEAR:
                minParam = gl.LINEAR_MIPMAP_LINEAR;
                break;
            default:
                break;
        }
        switch (magFilter) {
            case TextureMinMagFilter.LINEAR:
                magParam = gl.LINEAR;
                break;
            case TextureMinMagFilter.NEAREST:
                magParam = gl.NEAREST;
                break;
            case TextureMinMagFilter.NEAREST_MIPMAP_NEAREST:
                magParam = gl.NEAREST_MIPMAP_NEAREST;
                break;
            case TextureMinMagFilter.LINEAR_MIPMAP_NEAREST:
                magParam = gl.LINEAR_MIPMAP_NEAREST;
                break;
            case TextureMinMagFilter.NEAREST_MIPMAP_LINEAR:
                magParam = gl.NEAREST_MIPMAP_LINEAR;
                break;
            case TextureMinMagFilter.LINEAR_MIPMAP_LINEAR:
                magParam = gl.LINEAR_MIPMAP_LINEAR;
                break;
            default:
                break;
        }

        const texUnbinded = this.isTextureBind(texture) !== null;
        this.bindTexture2D(texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minParam);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magParam);
        if (texUnbinded) {
            this.unbindTexture2D(texture); // もともと登録されていなければ登録解除する
        }
    }

    // テクスチャのs座標t座標のラッピング処理を設定する
    public setTextureWrapFilter2D(texture: Texture, sFilter: TextureWrapFilter, tFilter: TextureWrapFilter): void {
        this.checkGLObject(texture);
        const gl = this.glContext;

        let sParam: number = gl.REPEAT;
        let tParam: number = gl.REPEAT;
        switch (sFilter) {
            case TextureWrapFilter.REPEAT:
                sParam = gl.REPEAT;
                break;
            case TextureWrapFilter.CLAMP_TO_EDGE:
                sParam = gl.CLAMP_TO_EDGE;
                break;
            case TextureWrapFilter.MIRRORED_REPEAT:
                sParam = gl.MIRRORED_REPEAT;
                break;
            default:
                break;
        }
        switch (tFilter) {
            case TextureWrapFilter.REPEAT:
                tParam = gl.REPEAT;
                break;
            case TextureWrapFilter.CLAMP_TO_EDGE:
                tParam = gl.CLAMP_TO_EDGE;
                break;
            case TextureWrapFilter.MIRRORED_REPEAT:
                tParam = gl.MIRRORED_REPEAT;
                break;
            default:
                break;
        }

        const texUnbinded = this.isTextureBind(texture) !== null;
        this.bindTexture2D(texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, sParam);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, tParam);
        if (texUnbinded) {
            this.unbindTexture2D(texture); // もともと登録されていなければ登録解除する
        }
    }

    /**
     * テクスチャを初期化する
     * @param texture 対象のテクスチャ
     * @param width 幅
     * @param height 高さ
     * @param border ボーダー
     * @param pixels 初期化するピクセル情報
     */
    public texImage2D_RGBA_8BIT(
        texture: Texture,
        width: number,
        height: number,
        border: number,
        pixels: ArrayBufferView | null,
    ): void {
        this.checkGLObject(texture);
        const gl = this.glContext;

        const texUnbinded = this.isTextureBind(texture) !== null;
        this.bindTexture2D(texture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, border, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        if (texUnbinded) {
            this.unbindTexture2D(texture); // もともと登録されていなければ登録解除する
        }
    }

    // ----------- framebuffer関連の処理 -------------

    // framebufferを作成する
    public createFramebuffer(): Framebuffer {
        const gl = this.glContext;

        const framebuffer = gl.createFramebuffer();
        if (framebuffer === null) {
            throw new Error('framebufferの作成に失敗しました。');
        }
        const fbObj = new Framebuffer(this, framebuffer);
        this.registerGLObject(fbObj);

        return fbObj;
    }

    // 現在のframebufferにテクスチャを紐づける
    public bindTexture2Framebuffer(texture: Texture): void {
        this.checkGLObject(texture);
        const gl = this.glContext;

        this.bindTexture2D(texture);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    }

    // framebufferとテクスチャを指定してframebufferにテクスチャを紐付ける
    public bindTexture2DesignatedFramebuffer(framebuffer: Framebuffer, texture: Texture): void {
        const fbLast = this.checkIsLastFramebuffer(framebuffer); // 現在の最新かどうか
        if (!fbLast) {
            this.pushFramebuffer(framebuffer);
        }
        this.bindTexture2Framebuffer(texture);
        if (!fbLast) {
            this.popFramebuffer(); // 最新ではないときはもとに戻す
        }
    }

    // framebufferを最新に設定する
    public pushFramebuffer(framebuffer: Framebuffer): void {
        this.checkGLObject(framebuffer);
        const gl = this.glContext;

        this.framebufferStack.push(framebuffer);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.framebuffer);
    }

    // 最新のframebufferを取り除く
    public popFramebuffer(): void {
        const gl = this.glContext;

        this.framebufferStack.pop();
        const len = this.framebufferStack.length;
        const last = len === 0 ? null : this.framebufferStack[len - 1];
        if (last === null) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        } else {
            this.checkGLObject(last);
            gl.bindFramebuffer(gl.FRAMEBUFFER, last.framebuffer);
        }
    }

    // 現在の最新のframebufferかどうか判定する
    public checkIsLastFramebuffer(framebuffer: Framebuffer): boolean {
        this.checkGLObject(framebuffer);
        const len = this.framebufferStack.length;
        if (len === 0) {
            return false;
        } else {
            return framebuffer.getFBId() === this.framebufferStack[len - 1].getFBId();
        }
    }

    // ----------- 描画関連の処理 -----------

    // 描画を適用する
    public flush(): void {
        this.glContext.flush();
    }

    // 描画を実行する
    public drawArrays(type: DrawType, first: number, count: number): void {
        const gl = this.glContext;

        let mode: number = gl.LINES;
        switch (type) {
            case DrawType.POINTS:
                mode = gl.POINTS;
                break;
            case DrawType.LINE_STRIP:
                mode = gl.LINE_STRIP;
                break;
            case DrawType.LINE_LOOP:
                mode = gl.LINE_LOOP;
                break;
            case DrawType.LINES:
                mode = gl.LINES;
                break;
            case DrawType.TRIANGLE_STRIP:
                mode = gl.TRIANGLE_STRIP;
                break;
            case DrawType.TRIANGLE_FAN:
                mode = gl.TRIANGLE_FAN;
                break;
            case DrawType.TRIANGLES:
                mode = gl.TRIANGLES;
                break;
            default:
                break;
        }

        gl.drawArrays(mode, first, count);
    }

    // 色を指定して描画する
    public clearColor2D(r: number, g: number, b: number, a: number): void {
        const gl = this.glContext;

        gl.clearColor(r, g, b, a);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    // ピクセル情報を読み出す
    public readPixels2D(x: number, y: number, width: number, height: number, pixels: ArrayBufferView): void {
        const gl = this.glContext;

        gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    }

    // ----------- shaderの処理 -----------

    // shaderプログラムを作成する
    public compileShaderProgram(vertexSource: string, fragmentSource: string): WebGLProgram {
        const gl = this.glContext;
        const vShader: WebGLShader | null = gl.createShader(gl.VERTEX_SHADER);
        const fShader: WebGLShader | null = gl.createShader(gl.FRAGMENT_SHADER);
        if (vShader === null || fShader === null) {
            throw new Error('shaderの作成に失敗しました。');
        }

        // 頂点シェーダ
        gl.shaderSource(vShader, vertexSource);
        gl.compileShader(vShader);
        if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
            throw new Error('vertex shaderのコンパイルに失敗しました。\n' + gl.getShaderInfoLog(vShader));
        }

        // フラグメントシェーダ
        gl.shaderSource(fShader, fragmentSource);
        gl.compileShader(fShader);
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
            throw new Error('fragment shaderのコンパイルに失敗しました。\n' + gl.getShaderInfoLog(fShader));
        }

        // program作成
        const program = gl.createProgram();
        if (program === null) {
            throw new Error('programが作成できません。');
        }
        gl.attachShader(program, vShader);
        gl.attachShader(program, fShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error('programのリンクに失敗しました。\n' + gl.getProgramInfoLog(program));
        }

        return program;
    }

    // shaderプログラムを有効化する
    public useProgram(program: WebGLProgram): void {
        this.glContext.useProgram(program);
    }

    // ----------- shader変数関連の処理 -----------

    // 配列形式のbufferオブジェクトを作成
    public createArrayBuffer(): ArrayBuffer {
        const buffer = this.glContext.createBuffer();
        if (buffer === null) {
            throw new Error('bufferオブジェクトの作成に失敗しました。');
        }
        const bufferObj = new ArrayBuffer(this, buffer);
        this.registerGLObject(bufferObj);

        return bufferObj;
    }

    // 配列形式のbufferオブジェクトをbindする
    public bindArrayBuffer(buffer: ArrayBuffer): void {
        this.checkGLObject(buffer);
        const gl = this.glContext;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
    }

    // bufferオブジェクトのストアタイプを指定する
    public arrayBufferData(buffer: AllowSharedBufferSource, type: BufferStoreType): void {
        const gl = this.glContext;

        let usage: number = gl.STATIC_DRAW;
        switch (type) {
            case BufferStoreType.STATIC_DRAW:
                usage = gl.STATIC_DRAW;
                break;
            case BufferStoreType.DYNAMIC_DRAW:
                usage = gl.DYNAMIC_DRAW;
                break;
            case BufferStoreType.STREAM_DRAW:
                usage = gl.STREAM_DRAW;
                break;
            default:
                break;
        }

        gl.bufferData(gl.ARRAY_BUFFER, buffer, usage);
    }

    // bufferオブジェクトを頂点属性のインデックスに紐づける
    public enableVertexAttribArray(attrIndex: number): void {
        this.glContext.enableVertexAttribArray(attrIndex);
    }

    // 頂点bufferオブジェクトのレイアウトを指定する
    public vertexAttribPointer(
        attrIndex: number,
        size: number,
        attrType: AttributeType,
        normalized: boolean,
        stride: number,
        offset: number,
    ): void {
        const gl = this.glContext;

        let type: number = gl.FLOAT;

        switch (attrType) {
            case AttributeType.BYTE:
                type = gl.BYTE;
                break;
            case AttributeType.SHORT:
                type = gl.SHORT;
                break;
            case AttributeType.UNSIGNED_BYTE:
                type = gl.UNSIGNED_BYTE;
                break;
            case AttributeType.UNSIGNED_SHORT:
                type = gl.UNSIGNED_SHORT;
                break;
            case AttributeType.FLOAT:
                type = gl.FLOAT;
                break;
            default:
                break;
        }

        gl.vertexAttribPointer(attrIndex, size, type, normalized, stride, offset);
    }

    // 頂点属性の名前からインデックスを取得する
    public getAttribLocation(program: WebGLProgram, varName: string): number {
        return this.glContext.getAttribLocation(program, varName);
    }

    // uniform変数の名前からインデックスを取得する
    public getUniformLocation(program: WebGLProgram, varName: string): WebGLUniformLocation | null {
        return this.glContext.getUniformLocation(program, varName);
    }

    // uniform変数に値を設定する
    public uniform1f(location: WebGLUniformLocation | null, v0: number): void {
        this.glContext.uniform1f(location, v0);
    }
    public uniform1i(location: WebGLUniformLocation | null, v0: number): void {
        this.glContext.uniform1i(location, v0);
    }
    public uniform2f(location: WebGLUniformLocation | null, v0: number, v1: number): void {
        this.glContext.uniform2f(location, v0, v1);
    }
    public uniform2i(location: WebGLUniformLocation | null, v0: number, v1: number): void {
        this.glContext.uniform2f(location, v0, v1);
    }
    public uniform3f(location: WebGLUniformLocation | null, v0: number, v1: number, v2: number): void {
        this.glContext.uniform3f(location, v0, v1, v2);
    }
    public uniform3i(location: WebGLUniformLocation | null, v0: number, v1: number, v2: number): void {
        this.glContext.uniform3i(location, v0, v1, v2);
    }
    public uniform4f(location: WebGLUniformLocation | null, v0: number, v1: number, v2: number, v3: number): void {
        this.glContext.uniform4f(location, v0, v1, v2, v3);
    }
    public uniform4i(location: WebGLUniformLocation | null, v0: number, v1: number, v2: number, v3: number): void {
        this.glContext.uniform4i(location, v0, v1, v2, v3);
    }
    public uniformMatrix2fv(location: WebGLUniformLocation | null, value: Float32Array | Array<number>): void {
        this.glContext.uniformMatrix2fv(location, false, value);
    }
    public uniformMatrix3fv(location: WebGLUniformLocation | null, value: Float32Array | Array<number>): void {
        this.glContext.uniformMatrix3fv(location, false, value);
    }
    public uniformMatrix4fv(location: WebGLUniformLocation | null, value: Float32Array | Array<number>): void {
        this.glContext.uniformMatrix4fv(location, false, value);
    }

    // ----------- その他処理 -----------

    // canvasのwidth,heightを取得する
    public getCanvasSize(): { width: number; height: number } {
        const cv = this.glContext.canvas;
        return { width: cv.width, height: cv.height };
    }

    // 属性スコープを設定する
    public pushAttrScope(attr: AttributeScope): void {
        const last =
            this.attrScopeStack.length === 0
                ? this.getDefaultAttrScope()
                : this.attrScopeStack[this.attrScopeStack.length - 1];
        const attrScope = attr.clone();
        attrScope.copy(last);
        this.attrScopeStack.push(attrScope);
        this.appendAttrScope(attrScope);
    }

    // 最新の属性スコープを取り除く
    public popAttrScope(): void {
        const last = this.attrScopeStack.pop();
        if (last === undefined) {
            this.appendAttrScope(this.getDefaultAttrScope());
        } else {
            this.appendAttrScope(last);
        }
    }
}
