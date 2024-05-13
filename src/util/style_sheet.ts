/*
CSSのスタイルシートを適用する処理
*/

/**
 * スタイルシートを作成、適用する
 * @param styleSheet スタイルシートのプロパティ
 */
export const addStyleSheet = function (styleSheet: {
    media: 'all' | 'print' | 'screen';
    cssRules: Array<{ selectorText: string; cssTextList: Array<string> }>;
}): void {
    const styleEl = document.createElement('style');
    styleEl.setAttribute('media', styleSheet.media);
    document.head.appendChild(styleEl);
    const newStyle = styleEl.sheet;
    if (newStyle === null) {
        return;
    }

    styleSheet.cssRules.forEach((css: { selectorText: string; cssTextList: Array<string> }) => {
        let cssStr = '';
        cssStr += css.selectorText + '{';
        css.cssTextList.forEach((cssText: string) => {
            cssStr += cssText + ';';
        });
        cssStr += '}';
        newStyle.insertRule(cssStr, newStyle.cssRules.length);
    });
};
