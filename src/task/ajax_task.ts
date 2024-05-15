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
 * Ajaxタスクオブジェクト
 */
class AjaxObject extends Task.TaskObject {
    // ajaxタスク
    protected readonly task: AjaxTask;
    // ajaxイベントのリスナー
    protected readonly eventListener: AjaxEventListener;

    // 送信処理
    public send(formData: gFormData | null): void {
        this.task.xhr.send(formData);

        this.task.xhr.addEventListener('loadend', this.appendTask.bind(this));
    }

    // タスクに設定する
    protected appendTask(event: gProgressEvent): void {
        this.task.progressEvent = event;
        this.dispatch(true);
    }

    // タスクを実行する
    public run(): void {
        if (this.task.xhr.status === 200) {
            this.eventListener.onAjaxEventSuccess(this.task);
        } else {
            this.eventListener.onAjaxEventFail(this.task);
        }
    }

    // コンストラクタ
    public constructor(task: AjaxTask, eventListener: AjaxEventListener) {
        super(null);
        this.task = task;

        this.eventListener = eventListener;
    }
}

/**
 * ajax通信処理のイベントリスナー
 */
export interface AjaxEventListener {
    // 成功時に呼び出される
    onAjaxEventSuccess(task: AjaxTask): void;
    // 失敗時に呼び出される
    onAjaxEventFail(task: AjaxTask): void;
}

/**
 * ajax通信を処理するタスクのプロパティ
 */
export class AjaxTaskProp {
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
export class AjaxTask {
    // ajax通信のオブジェクト
    public readonly xhr: gXMLHttpRequest;
    // プロパティ
    public readonly ajaxProp: AjaxTaskProp;
    // 通信完了時のイベント
    public progressEvent: gProgressEvent | null = null;
    // タスクオブジェクト
    private readonly taskObject: AjaxObject;

    // 送信処理
    public send(): void {
        this.xhr.open(this.ajaxProp.method, this.ajaxProp.url);
        this.xhr.responseType = this.ajaxProp.responseType;
        this.taskObject.send(this.ajaxProp.formData);
    }

    // カスタムタスクIDを取得する
    public getCustomTaskId(): string {
        return this.taskObject.getCustomTaskId();
    }

    // カスタムタスクIDを設定する
    public setCustomTaskId(customTaskId: string): void {
        this.taskObject.setCustomTaskId(customTaskId);
    }

    // コンストラクタ
    public constructor(ajaxProp: AjaxTaskProp, eventListener: AjaxEventListener) {
        this.xhr = new globalThis.XMLHttpRequest();
        this.ajaxProp = ajaxProp;
        this.taskObject = new AjaxObject(this, eventListener);
    }
}
