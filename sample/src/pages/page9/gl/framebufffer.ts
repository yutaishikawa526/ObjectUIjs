/**
 * framebufferのラッパークラス
 */

// フレームバッファー
export class Framebuffer {
    // 次のframebuffer番号
    private static nextFBId: number = 1;

    // frame bufferの生データ
    public readonly framebuffer: WebGLFramebuffer;
    // framebuffer番号
    public readonly framebufferId: number;

    // コンストラクタ
    public constructor(framebuffer: WebGLFramebuffer) {
        this.framebuffer = framebuffer;
        this.framebufferId = Framebuffer.nextFBId;
        Framebuffer.nextFBId++;
    }
}
