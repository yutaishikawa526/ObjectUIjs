/*
callback関数を指定してのタスク
*/
import * as Task from './task';

export class CallbackTask extends Task.TaskObject {
    // callback関数
    protected callback: Function;

    // コンストラクタ
    public constructor(callback: Function) {
        super();
        this.callback = callback;
    }

    // タスクを実行する
    public run(): void {
        this.callback();
    }
}
