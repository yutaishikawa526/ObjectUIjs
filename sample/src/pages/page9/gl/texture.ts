/**
 * glのテクスチャのラッパー
 */
import { GLObject } from './gl_object';

// テクスチャクラス
export class Texture extends GLObject {
    // テクスチャの生データ
    public readonly glTexture: WebGLTexture;

    // コンストラクタ
    public constructor(glTexture: WebGLTexture) {
        super();
        this.glTexture = glTexture;
    }

    // テクスチャ番号を取得する
    public getTextureId(): number {
        return this.objectId;
    }
}
