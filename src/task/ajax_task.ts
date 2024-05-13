/*
ajax通信の通信完了を処理するタスク
*/
import * as Task from './task';

type gXMLHttpRequest = globalThis.XMLHttpRequest;
type gProgressEvent = globalThis.ProgressEvent;
type gXMLHttpRequestResponseType = globalThis.XMLHttpRequestResponseType;
type gUrl = globalThis.URL;
type gFormData = globalThis.FormData;

/**
 * ajax通信処理のイベントリスナー
 */
export interface AjaxEventListener {
    // 成功時に呼び出される
    onAjaxEventSuccess(task: TaskAjax): void;
    // 失敗時に呼び出される
    onAjaxEventFail(task: TaskAjax): void;
}

/**
 * ajax通信を処理するタスクのプロパティ
 */
export class TaskAjaxProp {
    public url: gUrl;
    public method: string;
    public responseType: gXMLHttpRequestResponseType;
    public formData: gFormData | null = null;

    // コンストラクタ
    public constructor(
        url: gUrl,
        method: string,
        responseType: gXMLHttpRequestResponseType,
        formData: gFormData | null = null,
    ) {
        this.url = url;
        this.method = method;
        this.responseType = responseType;
        this.formData = formData;
    }
}

/**
 * ajax通信を処理するタスク
 */
export class TaskAjax extends Task.TaskObject implements Task.TaskListener {
    // ajax通信のオブジェクト
    public xhr: gXMLHttpRequest;
    // 通信完了時のイベント
    public progressEvent: gProgressEvent | null = null;
    // 送信のフォーム情報
    protected formData: gFormData | null = null;
    // ajaxイベントのリスナー
    protected eventListener: AjaxEventListener;

    // 送信処理
    public send(): void {
        this.xhr.send(this.formData);

        this.xhr.addEventListener('loadend', (event: gProgressEvent) => {
            this.progressEvent = event;
            const taskManager = Task.TaskManager.getInstance();
            taskManager.dispatch(this);
        });
    }

    // タスクを実行する
    public run(): void {
        if (this.xhr.status === 200) {
            this.eventListener.onAjaxEventSuccess(this);
        } else {
            this.eventListener.onAjaxEventFail(this);
        }
    }

    // コンストラクタ
    public constructor(taskAjaxProp: TaskAjaxProp, eventListener: AjaxEventListener) {
        super(null);
        this.taskListener = this;

        this.xhr = new globalThis.XMLHttpRequest();
        this.xhr.open(taskAjaxProp.method, taskAjaxProp.url);
        this.xhr.responseType = taskAjaxProp.responseType;
        this.formData = taskAjaxProp.formData;
        this.eventListener = eventListener;
    }

    public onTaskStart(task: Task.TaskObject): void {}
    public onTaskCancel(task: Task.TaskObject): void {}
    public onTaskFinish(task: Task.TaskObject): void {}
}
