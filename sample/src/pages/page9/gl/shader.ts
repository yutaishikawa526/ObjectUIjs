/**
 * shaderの基底クラス
 */
import { GLContext } from './context';
import { Texture } from './texture';
import { Program } from './program';
import { BufferStoreType, AttributeType, TextureMinMagFilter, TextureWrapFilter } from './type';

// shaderクラス
// Tは描画のときの引数の型を指定する
export abstract class Shader<T> {
    // shaderプログラム
    protected program: Program | null = null;
    // コンテキスト
    protected context: GLContext;

    // 頂点shaderプログラムを取得する
    protected abstract getVertexShaderSource(): string;

    // フラグメントshaderプログラムを取得する
    protected abstract getFragmentShaderSource(): string;

    // コンパイルを実行する
    protected compile(): void {
        this.program = this.context.compileShaderProgram(this.getVertexShaderSource(), this.getFragmentShaderSource());
    }

    // コンストラクタ
    public constructor(context: GLContext) {
        this.context = context;
    }

    // 描画処理
    public draw(args: T): void {
        if (this.program === null) {
            this.compile();
        }
        if (this.program === null) {
            throw new Error('ここが呼ばれるはずはありません。');
        }
        this.context.useProgram(this.program);
        this.drawCore(args);
    }

    // 描画処理のコア処理
    protected abstract drawCore(args: T): void;

    // VBOを作成&適用する
    protected appendVBO(
        varName: string,
        vertexData: AllowSharedBufferSource,
        count: number,
        storeType: BufferStoreType = BufferStoreType.STATIC_DRAW,
        attrType: AttributeType = AttributeType.FLOAT,
        normalized: boolean = false,
        stride: number = 0,
        offset: number = 0,
    ): void {
        if (this.program === null) {
            throw new Error('programが初期化されていません。');
        }
        const context = this.context;
        const vbo = context.createArrayBuffer();
        const vboIndex = context.getAttribLocation(this.program, varName);
        if (vboIndex === -1) {
            throw new Error('VBOのlocationの取得に失敗しました。\n');
        }

        context.bindArrayBuffer(vbo);
        context.arrayBufferData(vertexData, storeType);

        context.enableVertexAttribArray(vboIndex);
        context.vertexAttribPointer(vboIndex, count, attrType, normalized, stride, offset);
    }

    // uniformに4次元正方行列を設定する
    protected appendUniform(uniformName: string, uniformData: Array<number>): void {
        if (this.program === null) {
            throw new Error('programが初期化されていません。');
        }
        const context = this.context;
        const uniformIndex = context.getUniformLocation(this.program, uniformName);
        context.uniformMatrix4fv(uniformIndex, uniformData);
    }

    // テクスチャ番号をuniform変数に設定する
    protected bindTexture2DAndAttribute(
        varName: string,
        texture: Texture,
        minFilter: TextureMinMagFilter,
        magFilter: TextureMinMagFilter,
        sFilter: TextureWrapFilter,
        tFilter: TextureWrapFilter,
        generateMipmap: boolean,
    ): void {
        if (this.program === null) {
            throw new Error('programが初期化されていません。');
        }
        const context = this.context;

        const texBindNumber = context.bindTexture2D(texture);
        const textureUniIndex = context.getUniformLocation(this.program, varName);
        if (textureUniIndex === null) {
            throw new Error(varName + 'は無効なuniform変数です。');
        }
        context.uniform1i(textureUniIndex, texBindNumber);
        if (generateMipmap) {
            context.generateMipmap2D(texture);
        }
        context.setTextureMinMagFilter2D(texture, minFilter, magFilter);
        context.setTextureWrapFilter2D(texture, sFilter, tFilter);
    }
}
