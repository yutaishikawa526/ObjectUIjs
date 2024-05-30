/**
 * サンプルページ9
 */
import { BaseContent } from '../../component';
import { CanvasView } from './canvasView';
import { element as oujElement, util as oujUtil, task as oujTask } from 'objectuijs';

// サンプルページ9
export class Page9 extends BaseContent {
    // コンストラクタ
    public constructor() {
        super();

        this.classList.add('page9');

        this.addChild(new CanvasView());
    }
}
