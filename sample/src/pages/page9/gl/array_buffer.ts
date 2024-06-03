/**
 * 配列バッファーのラッパークラス
 */
import { GLObject } from './gl_object';

export class ArrayBuffer extends GLObject {
    // bufferの生データ
    public readonly buffer: WebGLBuffer;

    // コンストラクタ
    public constructor(buffer: WebGLBuffer) {
        super();
        this.buffer = buffer;
    }
}
