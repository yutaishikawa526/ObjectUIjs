const path = require('path');

module.exports = [];

/**
 * module.exportsにコンパイル設定を適用する
 * @param {*} entryFileName エントリーポイント
 * @param {*} outputFileName 出力ファイル
 * @param {*} isDebug デバッグモードかどうか
 * @returns なし
 */
const pushExports = function (entryFileName, outputFileName, isDebug) {
    const mode = isDebug ? 'development' : 'production';
    const expt = {
        mode: mode, // production or development
        module: {
            rules: [
                {
                    // compile typescript
                    test: new RegExp('.ts$'),
                    use: 'ts-loader',
                },
            ],
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
    };
    expt.entry = entryFileName;
    expt.output = {
        path: path.resolve(__dirname, 'build'),
        filename: outputFileName,
    };
    module.exports.push(expt);
};

// 以下にコンパイルのエントリーポイントと出力するJSファイル名を指定する
const entryPoint2OutFile = [
    {
        entry: './src/sample1.ts',
        output: 'sample1.js',
    },
];

entryPoint2OutFile.forEach(({ entry: entry, output: output }) => {
    // デバッグ&リリースビルド
    pushExports(entry, '__' + output, true);
    pushExports(entry, output, false);
});
