/**
 * スコープの基底クラス
 */

export abstract class Scope {
    // callback関数
    protected readonly callback: () => void;
    // 実行前に呼ばれる
    public abstract before(): void;
    // 実行後に呼ばれる
    public abstract after(): void;

    // 実行する
    protected exec(): void {
        try {
            this.before();

            this.callback();
        } finally {
            this.after();
        }
    }

    // コンストラクタ
    public constructor(callback: () => void) {
        this.callback = callback;
    }
}
