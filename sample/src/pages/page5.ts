/**
 * サンプルページ5
 */
import { BaseContent } from '../component';
import { element as oujElement, task as oujTask } from 'objectuijs';

const gDate = globalThis.Date;

// サンプルページ5
export class Page5 extends BaseContent implements oujElement.ClickEventListener {
    // タイマータスク
    protected timerTask: oujTask.TimerTask;
    // 開始・停止ボタン
    protected startEndButton: oujElement.InputElement;
    // リセットボタン
    protected resetButton: oujElement.InputElement;
    // 時間表示用の要素
    protected showTimeText: oujElement.TextElement;

    // 確定済みの秒数(ms)
    protected confirmedTime: number = 0;
    // 開始の時刻
    protected preDateTime: number | null = null;
    // 未確定の秒数(ms)
    protected preConfirmedTime: number = 0;

    // コンストラクタ
    public constructor() {
        super();

        this.timerTask = new (class extends oujTask.TimerTask {
            // delegateクラス
            protected delegate: Page5;

            // 実行するタスク
            public run(): void {
                this.delegate.timerClock();
            }

            // インターバルを取得する(ms)
            // 10より小さいのは禁止
            public getInterval(): number {
                return 10;
            }

            // コンストラクタ
            public constructor(delegate: Page5) {
                super();
                this.delegate = delegate;
            }
        })(this);

        this.startEndButton = new oujElement.InputElement(
            new oujElement.InputProp('開始', 'button', '', true, false, false, '', false),
        );
        this.startEndButton.setClickEventListener(this);

        this.resetButton = new oujElement.InputElement(
            new oujElement.InputProp('リセット', 'button', '', true, false, false, '', false),
        );
        this.resetButton.setClickEventListener(this);

        this.showTimeText = new oujElement.TextElement();

        this.initialize();
    }

    // 初期化
    protected initialize(): void {
        const label1 = new oujElement.LabelElement();
        const label2 = new oujElement.LabelElement();

        label1.addChild(this.startEndButton);
        label2.addChild(this.resetButton);

        this.addChild(label1);
        this.addChild(label2);

        this.addChild(new oujElement.HRElement());

        const p = new oujElement.ParagraphElement();
        p.addChild(new oujElement.TextElement('結果: '));
        p.addChild(this.showTimeText);
        this.addChild(p);

        this.showTimer();
    }

    // 表示欄に時間を表示
    protected showTimer(): void {
        const total = this.confirmedTime + this.preConfirmedTime;
        const time = total > 0 ? Math.trunc(total) : 0;
        if (time === 0) {
            this.showTimeText.setText('');
            return;
        }

        const miliSec = time % 1000;
        const sec = ((time - miliSec) / 1000) % 60;
        const min = (time - miliSec - sec * 1000) / 1000 / 60;

        this.showTimeText.setText(min + ':' + ('00' + sec).slice(-2) + ':' + ('000' + miliSec).slice(-3));
    }

    // タイマーイベント
    public timerClock(): void {
        if (this.preDateTime === null) {
            this.preDateTime = gDate.now();
        }
        const nowDT = gDate.now();
        this.preConfirmedTime = nowDT - this.preDateTime;
        this.showTimer();
    }

    // クリックイベント
    public onElementClickSingle(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {
        if (element.getElementId() === this.startEndButton.getElementId()) {
            // 開始または停止ボタンクリック
            if (this.timerTask.isTimerRunning()) {
                // タイマーが回っているときは、停止する
                this.timerTask.stop();

                this.preDateTime = null;
                this.confirmedTime += this.preConfirmedTime;
                this.preConfirmedTime = 0;

                this.startEndButton.setInputProp(
                    new oujElement.InputProp('開始', 'button', '', true, false, false, '', false),
                );
            } else {
                // タイマーが止まっているときに再度開始する
                this.timerTask.start();

                this.preDateTime = gDate.now();
                this.preConfirmedTime = 0;

                this.startEndButton.setInputProp(
                    new oujElement.InputProp('停止', 'button', '', true, false, false, '', false),
                );
            }
        } else if (element.getElementId() === this.resetButton.getElementId()) {
            // リセットボタンをクリック
            this.timerTask.stop();

            this.confirmedTime = 0;
            this.preConfirmedTime = 0;
            this.preDateTime = null;

            this.showTimer();
            this.startEndButton.setInputProp(
                new oujElement.InputProp('開始', 'button', '', true, false, false, '', false),
            );
        }
    }
    // ダブルクリックイベント
    public onElementClickDBL(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}
    // 第1ボタン以外のクリックイベント
    public onElementClickAUX(element: oujElement.HTMLElement, event: oujElement.MouseEvent): void {}
}
