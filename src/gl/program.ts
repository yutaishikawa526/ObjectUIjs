/**
 * glのshaderプログラムのラッパー
 */
import { GLObject } from './gl_object';

// テクスチャクラス
export class Program extends GLObject {
    // テクスチャの生データ
    public readonly program: WebGLProgram;

    // コンストラクタ
    public constructor(program: WebGLProgram) {
        super();
        this.program = program;
    }
}
