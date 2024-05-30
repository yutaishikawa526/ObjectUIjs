/**
 * shaderの基底クラス
 * WebGLProgramに対応する
 */
import { element as oujElement, util as oujUtil, task as oujTask } from 'objectuijs';

// shaderクラス
// Tは描画のときの引数の型を指定する
export abstract class Shader<T> {
    // shaderプログラム
    protected program: WebGLProgram | null = null;
    // webglコンテキスト
    protected gl: WebGLRenderingContext;

    // 頂点shaderプログラムを取得する
    protected abstract getVertexShaderSource(): string;

    // フラグメントshaderプログラムを取得する
    protected abstract getFragmentShaderSource(): string;

    // コンパイルを実行する
    protected compile(): void {
        const gl = this.gl;
        const vShader: WebGLShader | null = gl.createShader(gl.VERTEX_SHADER);
        const fShader: WebGLShader | null = gl.createShader(gl.FRAGMENT_SHADER);
        if (vShader === null || fShader === null) {
            throw new Error('shaderの作成に失敗しました。');
        }

        // 頂点シェーダ
        gl.shaderSource(vShader, this.getVertexShaderSource());
        gl.compileShader(vShader);
        if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
            throw new Error('vertex shaderのコンパイルに失敗しました。\n' + gl.getShaderInfoLog(vShader));
        }

        // フラグメントシェーダ
        gl.shaderSource(fShader, this.getFragmentShaderSource());
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

        this.program = program;
    }

    // コンストラクタ
    public constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
    }

    // 描画処理
    public draw(args: T): void {
        if (this.program === null) {
            this.compile();
        }
        this.gl.useProgram(this.program);
        this.drawCore(args);
    }

    // 描画処理のコア処理
    protected abstract drawCore(args: T): void;

    // VBOを作成&適用する
    protected appendVBO(varName: string, vertexData: AllowSharedBufferSource, stride: number): void {
        if (this.program === null) {
            throw new Error('programが初期化されていません。');
        }
        const gl = this.gl;
        const vbo = gl.createBuffer();
        const vboIndex = gl.getAttribLocation(this.program, varName);
        if (vboIndex === -1) {
            oujUtil.log(varName);
            throw new Error('vertext buffer objectのlocationの取得に失敗しました。\n');
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

        gl.enableVertexAttribArray(vboIndex);
        gl.vertexAttribPointer(vboIndex, stride, gl.FLOAT, false, 0, 0);
    }

    // uniformに4次元正方行列を設定する
    protected appendUniform(uniformName: string, uniformData: Array<number>): void {
        if (this.program === null) {
            throw new Error('programが初期化されていません。');
        }
        const gl = this.gl;
        const uniformIndex = gl.getUniformLocation(this.program, uniformName);
        gl.uniformMatrix4fv(uniformIndex, false, uniformData);
    }
}
