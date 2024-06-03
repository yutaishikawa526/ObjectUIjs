/**
 * GLのコンテキストを参照するGLのオブジェクトの基底クラス
 */

// GLのオブジェクトの基底クラス
export abstract class GLObject {
    private static nextObjectId: number = 1;

    // glオブジェクトのID
    public readonly objectId: number;

    // コンストラクタ
    public constructor() {
        this.objectId = GLObject.nextObjectId;
        GLObject.nextObjectId++;
    }
}
