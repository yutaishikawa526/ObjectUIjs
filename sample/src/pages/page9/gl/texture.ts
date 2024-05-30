/**
 * glのテクスチャのラッパー
 */
import { GLContext } from './context';
import { GLObject } from './gl_object';

// テクスチャクラス
export class Texture extends GLObject {
    // テクスチャの生データ
    public readonly glTexture: WebGLTexture;

    // コンストラクタ
    public constructor(context: GLContext, glTexture: WebGLTexture) {
        super(context);
        this.glTexture = glTexture;
    }

    // テクスチャ番号を取得する
    public getTextureId(): number {
        return this.objectId;
    }
}
