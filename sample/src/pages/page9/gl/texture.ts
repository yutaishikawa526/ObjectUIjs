/**
 * glのテクスチャのラッパー
 */

// テクスチャクラス
export class Texture {
    // 次のテクスチャ番号
    private static nextTextureId: number = 1;

    // テクスチャの生データ
    public readonly glTexture: WebGLTexture;
    // テクスチャ番号
    public readonly textureId: number;
    // テクスチャが有効かどうか(削除済されていないかどうか)
    private isValid: boolean;

    // コンストラクタ
    public constructor(glTexture: WebGLTexture) {
        this.glTexture = glTexture;
        this.isValid = true;
        this.textureId = Texture.nextTextureId;
        Texture.nextTextureId++;
    }

    // テクスチャを無効化する
    public setInvalid(): void {
        this.isValid = false;
    }
    // テクスチャが有効かどうか取得する
    public getIsValid(): boolean {
        return this.isValid;
    }
}
