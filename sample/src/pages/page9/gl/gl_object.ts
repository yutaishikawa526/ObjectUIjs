/**
 * GLのコンテキストを参照するGLのオブジェクトの基底クラス
 */
import { GLContext } from './context';

// GLのオブジェクトの基底クラス
export abstract class GLObject {
    private static nextObjectId: number = 1;

    // コンテキスト
    public readonly context: GLContext;
    // glオブジェクトのID
    public readonly objectId: number;

    // コンストラクタ
    public constructor(context: GLContext) {
        this.context = context;
        this.objectId = GLObject.nextObjectId;
        GLObject.nextObjectId++;
    }
}
