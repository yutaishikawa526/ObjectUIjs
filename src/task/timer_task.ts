/*
一定期間ごとに呼び出すタスク
*/
import * as Task from './task';

// タイマーの実施タスク
class TimerObject extends Task.TaskObject {
    // タイマータスク
    public readonly timerTask: TimerTask;
    // インターバルID
    protected readonly intervalId: number;

    // コンストラクタ
    public constructor(timerTask: TimerTask) {
        super();

        this.timerTask = timerTask;
        const interval = timerTask.getInterval();
        const intervalId = setInterval(this.exeTask.bind(this), interval);
        this.intervalId = intervalId;
    }

    // タスクの起動
    protected exeTask(): void {
        if (this.timerTask.isTimerRunning()) {
            this.dispatch(true);
            return;
        } else {
            // タスクが停止している
            clearInterval(this.intervalId);
            TimerManager.getInstance().removeTimerTask(this);
        }
    }

    // タスクを実行する
    public run(): void {
        this.timerTask.run();
    }
}

// タイマーマネージャー
class TimerManager {
    // 現在のタイマータスクの一覧
    private timerTaskList: Array<TimerObject> = [];

    /**
     * タイマータスクを追加する
     * @param task タイマータスク
     */
    public addTimerTask(task: TimerTask): void {
        const timerObject = new TimerObject(task);
        this.timerTaskList.push(timerObject);
    }

    /**
     * タイマータスクを削除する
     * @param task タイマータスク
     */
    public removeTimerTask(timerObject: TimerObject): void {
        this.timerTaskList = this.timerTaskList.filter((tObj: TimerObject) => {
            return timerObject.taskId !== tObj.taskId;
        });
    }

    // シングルトンインスタンス
    private static instance: TimerManager | null = null;
    // シングルトンインスタンスを取得する
    public static getInstance(): TimerManager {
        if (this.instance === null) {
            this.instance = new this();
        }
        return this.instance;
    }
    // コンストラクタ
    private constructor() {}
}

// 一定期間ごとに呼び出すタスク
export abstract class TimerTask {
    // タイマーに設定中かどうか
    private timerRunning: boolean = false;

    // タイマーに設定中かどうかを取得する
    public isTimerRunning(): boolean {
        return this.timerRunning;
    }

    // 開始する
    public start(): void {
        if (this.timerRunning) {
            return;
        }
        this.timerRunning = true;
        TimerManager.getInstance().addTimerTask(this);
    }

    // 停止する
    public stop(): void {
        this.timerRunning = false;
    }

    // 実行するタスク
    public abstract run(): void;

    // インターバルを取得する(ms)
    public abstract getInterval(): number;
}
