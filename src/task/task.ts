/*
タスクの管理クラスの実装
*/
import * as Debug from '../util/debug';

/**
 * タスクのイベントリスナー
 */
export interface TaskListener {
    onTaskStart(task: TaskObject): void;
    onTaskCancel(task: TaskObject): void;
    onTaskFinish(task: TaskObject): void;
}

/**
 * タスクの実行状況
 */
export enum TaskStatus {
    removed, // タスクから除外状態
    dispatch, // ディスパチ状態
    starting, // 開始状態
    running, // 実行中
    cancel, // キャンセル
    finish, // 完了
}

/**
 * タスク実行クラス
 */
export abstract class TaskObject {
    // イベントリスナー
    public taskListener: TaskListener | null = null;
    // 実行ステータス
    public taskStatus: TaskStatus;

    // タスクを実行する
    public abstract run(): void;

    // コンストラクタ
    public constructor(taskListener: TaskListener | null = null) {
        this.taskListener = taskListener;
        this.taskStatus = TaskStatus.removed;
    }

    // ディスパッチする
    public dispatch(): void {
        const tskManager = TaskManager.getInstance();
        tskManager.dispatch(this);
    }
}

/**
 * タスクの管理クラス
 */
export class TaskManager {
    // シングルトンインスタンス
    private static instance: TaskManager | null = null;
    // シングルトンインスタンスを取得する
    public static getInstance(): TaskManager {
        if (this.instance === null) {
            this.instance = new this();
        }
        return this.instance;
    }

    // タスクが起動しているかどうか
    private taskExecting: boolean = false;
    // タスクの起動を予約済みかどうか
    private willTaskExec: boolean = false;

    // タスクキュー
    private taskQue: Array<TaskObject>;

    // コンストラクタ
    private constructor() {
        this.taskQue = [];
    }

    // メインループ
    private main(): void {
        this.willTaskExec = false;
        if (this.taskExecting) {
            return;
        }
        this.taskExecting = true;

        while (true) {
            const target = this.taskQue.shift();
            if (target === undefined) {
                break; // タスクが空
            }

            // タスク開始
            try {
                target.taskStatus = TaskStatus.starting;
                if (target.taskListener !== null) {
                    target.taskListener.onTaskStart(target);
                }
            } catch (err) {
                Debug.log(err);
            }

            // タスク実行中
            target.taskStatus = TaskStatus.running;
            try {
                target.run();
            } catch (err) {
                Debug.log(err);
                // タスク中断
                try {
                    target.taskStatus = TaskStatus.cancel;
                    if (target.taskListener !== null) {
                        target.taskListener.onTaskCancel(target);
                    }
                } catch (err) {
                    Debug.log(err);
                }
            }

            // タスク終了
            try {
                target.taskStatus = TaskStatus.finish;
                if (target.taskListener !== null) {
                    target.taskListener.onTaskFinish(target);
                }
            } catch (err) {
                Debug.log(err);
            }
        }

        this.taskQue = [];

        this.taskExecting = false;
    }

    // タスクをディスパッチする
    public dispatch(task: TaskObject) {
        this.taskQue.push(task);
        task.taskStatus = TaskStatus.dispatch;
        if (!this.isMainLoop() && !this.willTaskExec) {
            this.willTaskExec = true;
            // メインループではないときは、いったん現在のスレッドが完了してからメインループを起動する
            setTimeout(this.main.bind(this), 0);
        }
    }

    // メインループかどうか
    public isMainLoop(): boolean {
        return this.taskExecting;
    }
}
