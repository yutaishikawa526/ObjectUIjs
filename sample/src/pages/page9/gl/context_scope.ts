/**
 * glのコンテキストのスコープ
 */
import { Scope } from '../scope';
import { Framebuffer } from './framebuffer';
import { Texture } from './texture';
import { GLContext } from './context';
import { ContextAttribute } from './context_attribute';

export class ContextScope extends Scope {
    // コンテキスト
    protected readonly context: GLContext;
    // フレームバッファー
    protected readonly framebuffer: Framebuffer | null = null;
    // フレームバッファーに紐づけるテクスチャ
    protected readonly framebufferTexture: Texture | null = null;
    // 属性のスコープ
    protected readonly attribute: ContextAttribute | null = null;

    // 実行前に呼ばれる
    public before(): void {
        const context = this.context;

        // フレームバッファー
        if (this.framebuffer !== null) {
            context.pushFramebuffer(this.framebuffer);
        }

        // フレームバッファーのテクスチャ
        if (this.framebufferTexture !== null) {
            context.bindTexture2D(this.framebufferTexture);
            context.bindTexture2Framebuffer(this.framebufferTexture);
        }

        // 属性のスコープ
        if (this.attribute !== null) {
            context.pushAttrScope(this.attribute);
        }
    }
    // 実行後に呼ばれる
    public after(): void {
        const context = this.context;

        // 属性のスコープ
        if (this.attribute !== null) {
            context.popAttrScope();
        }

        // フレームバッファーのテクスチャ
        if (this.framebufferTexture !== null) {
            context.unbindTexture2D(this.framebufferTexture);
        }

        // フレームバッファー
        if (this.framebuffer !== null) {
            context.popFramebuffer();
        }
    }

    // コンストラクタ
    public constructor(
        callback: () => void,
        context: GLContext,
        attribute: ContextAttribute | null = null,
        framebuffer: Framebuffer | null = null,
        framebufferTexture: Texture | null = null,
    ) {
        super(callback);
        this.context = context;
        this.framebuffer = framebuffer;
        this.framebufferTexture = framebufferTexture;
        this.attribute = attribute;

        this.exec();
    }
}
