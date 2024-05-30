/**
 * framebufferのラッパークラス
 */
import { GLContext } from './context';
import { GLObject } from './gl_object';

// フレームバッファー
export class Framebuffer extends GLObject {
    // frame bufferの生データ
    public readonly framebuffer: WebGLFramebuffer;

    // コンストラクタ
    public constructor(context: GLContext, framebuffer: WebGLFramebuffer) {
        super(context);
        this.framebuffer = framebuffer;
    }

    // framebuffer番号を取得する
    public getFBId(): number {
        return this.objectId;
    }
}
