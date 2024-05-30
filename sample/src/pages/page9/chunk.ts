/**
 * 描画のチャンク情報
 */

// 描画中の線
export class DrawingList {
    // 描画の線の配列
    public drawingList: Array<{ x: number; y: number }> = [];
}

// 描画
export class DrawChunk {
    // 描画の線の配列
    public drawingList: DrawingList;
    // 描画後の画像情報
    public image: Uint8Array;

    // コンストラクタ
    public constructor(drawingList: DrawingList, image: Uint8Array) {
        this.drawingList = drawingList;
        this.image = image;
    }
}
