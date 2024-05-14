/*
その他ユーティリティ関数
*/
import * as Element from '../element/others';

/**
 * Blobオブジェクトを指定してダウンロードする
 * @param blob ダウンロード対象のBlobオブジェクト
 * @param fileName ファイル名
 */
export const downloadBlob = function (blob: Blob, fileName: string = 'download') {
    // URL作成
    const blobUrl = URL.createObjectURL(blob);

    // ダウンロード
    const anchorEl = new Element.AnchorElement();
    anchorEl.setHref(blobUrl);
    anchorEl.setDownload(fileName);
    anchorEl.click();
};
