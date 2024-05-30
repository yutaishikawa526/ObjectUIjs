/**
 * 配列バッファーのラッパークラス
 */
import { GLContext } from './context';
import { GLObject } from './gl_object';

export class ArrayBuffer extends GLObject {
    // bufferの生データ
    public readonly buffer: WebGLBuffer;

    // コンストラクタ
    public constructor(context: GLContext, buffer: WebGLBuffer) {
        super(context);
        this.buffer = buffer;
    }
}
