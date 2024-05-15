/*
fileのインポートを処理するタスク
*/
import * as Task from './task';

type gFileReader = globalThis.FileReader;
type gFile = globalThis.File;

/**
 * ファイルインポートのイベントリスナー
 */
export interface FileImportEventListener {
    // インポート後に呼ばれる
    onFileImportFinish(result: string, imprt: FileImportTask): void;
    // インポートに失敗したときに呼ばれる
    onFileImportFail(imprt: FileImportTask): void;
}

// ファイルインポートのタイプ
export enum FileImportType {
    text, // 文字列形式
    base64Url, // base64形式のURL
}

/**
 * ファイルのインポートを処理するクラス
 */
export class FileImportTask extends Task.TaskObject implements Task.TaskListener {
    // ファイル読み込みのイベントリスナー
    protected fileImportListener: FileImportEventListener;
    // ファイル読み込みクラス
    protected fileReader: gFileReader;

    // タスクを実行する
    public run(): void {
        const res = this.fileReader.result;
        if (typeof res === 'string') {
            this.fileImportListener.onFileImportFinish(res, this);
        } else {
            this.fileImportListener.onFileImportFail(this);
        }
    }

    // 読み込み開始
    public startFileImport(importType: FileImportType, file: gFile): void {
        this.fileReader.onloadend = this.loadend.bind(this);
        if (importType === FileImportType.text) {
            this.fileReader.readAsText(file);
        } else if (importType === FileImportType.base64Url) {
            this.fileReader.readAsDataURL(file);
        }
    }

    // 読込完了時処理
    protected loadend(): void {
        this.dispatch(true);
    }

    // コンストラクタ
    public constructor(fileImportListener: FileImportEventListener) {
        super(null);
        this.taskListener = this;

        this.fileImportListener = fileImportListener;
        this.fileReader = new globalThis.FileReader();
    }

    public onTaskStart(task: Task.TaskObject): void {}
    public onTaskCancel(task: Task.TaskObject): void {}
    public onTaskFinish(task: Task.TaskObject): void {}
}
