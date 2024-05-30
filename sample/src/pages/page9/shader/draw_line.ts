/**
 * 線を描画するshader
 */
import { Shader } from './base';

// 線を描画
export class DrawLineShader extends Shader<{
    vertexPos: Array<number>; // 頂点配列。2次元で指定。座標系は左上を(0,0)とする。ピクセル指定
    vertexColor: Array<number>; // 色の配列
    lineWidth: number; // 太さ。ピクセルで指定
    rect: { width: number; height: number }; // 描画矩形の幅と高さ。ピクセルで指定
    edgeDivision: number; // 端を何分割で丸くするか。0なら端は平坦
}> {
    // 頂点shaderプログラムを取得する
    protected getVertexShaderSource(): string {
        // prettier-ignore
        const vsprg = ''
            + 'attribute vec2 a_position;'
            + 'attribute vec4 a_color;'
            + 'uniform mat4 u_matrix;'
            + 'varying vec4 v_color;'
            + ''
            + 'void main(void){'
            + '    v_color = a_color;'
            + '    gl_Position = u_matrix * vec4(a_position, 1.0, 1.0);'
            + '}'
            + '';

        return vsprg;
    }

    // フラグメントshaderプログラムを取得する
    protected getFragmentShaderSource(): string {
        // prettier-ignore
        const fsprg = ''
            + 'precision mediump float;'
            + 'varying vec4 v_color;'
            + ''
            + 'void main(void){'
            + '    gl_FragColor = v_color;'
            + '}'
            + '';

        return fsprg;
    }

    // 描画処理のコア処理
    protected drawCore(args: {
        vertexPos: Array<number>;
        vertexColor: Array<number>;
        lineWidth: number;
        rect: { width: number; height: number };
        edgeDivision: number;
    }): void {
        if (this.program === null) {
            throw new Error('programが初期化されていません。');
        }
        const gl = this.gl;

        const vertexPos = args.vertexPos;
        const vertexColor = args.vertexColor;
        const width = args.rect.width;
        const height = args.rect.height;
        const lineWidth = args.lineWidth;
        const edgeDivision = Math.ceil(args.edgeDivision);

        if (vertexPos.length < 4) {
            throw new Error('2点以上必要です。');
        } else if (vertexPos.length * 2 !== vertexColor.length) {
            throw new Error('色と座標の整合性が取れていません。');
        } else if (lineWidth <= 0) {
            throw new Error('太さは正の値である必要があります。');
        } else if (width <= 0 || height <= 0) {
            throw new Error('幅、高さは正の値である必要があります。');
        } else if (edgeDivision < 0) {
            throw new Error('端の分割は0以上を指定する必要があります。');
        }

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.disable(gl.CULL_FACE); // 表裏を無視

        const vertexStride = 2;
        const colorStride = 4;

        const unitAngle = Math.PI / (edgeDivision + 1);
        const pairCosSinList: Array<{ cos: number; sin: number }> = [];
        for (let i = 0; i < edgeDivision; i++) {
            pairCosSinList.push({ cos: Math.cos(unitAngle * (i + 1)), sin: Math.sin(unitAngle * (i + 1)) });
        }

        let index: number = 0;
        const modifiedVPos: Array<number> = [];
        const modifiedVCol: Array<number> = [];
        while (true) {
            if (index + 3 >= vertexPos.length) {
                break;
            }
            const x = vertexPos[index];
            const y = vertexPos[index + 1];
            const nextX = vertexPos[index + 2];
            const nextY = vertexPos[index + 3];
            const subX = nextX - x;
            const subY = nextY - y;
            const length = Math.sqrt(subX * subX + subY * subY);
            if (length === 0) {
                index += 2;
                continue;
            }
            const direction: { x: number; y: number } = { x: subX, y: subY };
            const vertDirction: { x: number; y: number } = {
                x: (((-1.0 * subY) / length) * lineWidth) / 2.0,
                y: ((subX / length) * lineWidth) / 2.0,
            };

            const color: Array<number> = [
                vertexColor[index * 2],
                vertexColor[index * 2 + 1],
                vertexColor[index * 2 + 2],
                vertexColor[index * 2 + 3],
            ];
            const nextColor: Array<number> = [
                vertexColor[index * 2 + 4],
                vertexColor[index * 2 + 5],
                vertexColor[index * 2 + 6],
                vertexColor[index * 2 + 7],
            ];

            // 頂点配列、色配列作成
            if (edgeDivision === 0) {
                // 端なし
                modifiedVPos.push(x + vertDirction.x, y + vertDirction.y);
                modifiedVPos.push(x - vertDirction.x, y - vertDirction.y);
                modifiedVPos.push(nextX + vertDirction.x, nextY + vertDirction.y);
                modifiedVPos.push(nextX - vertDirction.x, nextY - vertDirction.y);
                modifiedVPos.push(nextX, nextY);
                modifiedVPos.push(nextX, nextY);

                modifiedVCol.push(...color, ...color);
                modifiedVCol.push(...nextColor, ...nextColor, ...nextColor, ...nextColor);
            } else {
                // 端あり
                // 根本の丸を作成
                const vertL: Array<{ x: number; y: number }> = [];
                vertL.push({ x: x + vertDirction.x, y: y + vertDirction.y });
                pairCosSinList.forEach((pCosSin: { cos: number; sin: number }) => {
                    const vx = pCosSin.cos * vertDirction.x - pCosSin.sin * vertDirction.y;
                    const vy = pCosSin.sin * vertDirction.x + pCosSin.cos * vertDirction.y;
                    vertL.push({ x: x + vx, y: y + vy });
                });
                vertL.push({ x: x - vertDirction.x, y: y - vertDirction.y });

                for (let i = 0; i < vertL.length; i++) {
                    modifiedVPos.push(vertL[i].x, vertL[i].y);
                    modifiedVCol.push(...color);

                    if (i >= vertL.length - 1) {
                        break;
                    }

                    i++;

                    modifiedVPos.push(vertL[i].x, vertL[i].y);
                    modifiedVCol.push(...color);
                    if (i >= vertL.length - 1) {
                        break;
                    }

                    modifiedVPos.push(x, y);
                    modifiedVCol.push(...color);
                }

                // 本体作成
                modifiedVPos.push(x - vertDirction.x, y - vertDirction.y);
                modifiedVCol.push(...color);

                modifiedVPos.push(x + vertDirction.x, y + vertDirction.y);
                modifiedVCol.push(...color);

                modifiedVPos.push(nextX - vertDirction.x, nextY - vertDirction.y);
                modifiedVCol.push(...nextColor);

                modifiedVPos.push(nextX + vertDirction.x, nextY + vertDirction.y);
                modifiedVCol.push(...nextColor);

                // 先っぽの丸を作成
                vertL.splice(0, vertL.length);
                vertL.push({ x: nextX + vertDirction.x, y: nextY + vertDirction.y });
                pairCosSinList.forEach((pCosSin: { cos: number; sin: number }) => {
                    const vx = pCosSin.cos * vertDirction.x + pCosSin.sin * vertDirction.y;
                    const vy = -1 * pCosSin.sin * vertDirction.x + pCosSin.cos * vertDirction.y;
                    vertL.push({ x: nextX + vx, y: nextY + vy });
                });
                vertL.push({ x: nextX - vertDirction.x, y: nextY - vertDirction.y });

                for (let i = 0; i < vertL.length; i++) {
                    modifiedVPos.push(vertL[i].x, vertL[i].y);
                    modifiedVCol.push(...nextColor);

                    if (i >= vertL.length - 1) {
                        break;
                    }

                    i++;

                    modifiedVPos.push(vertL[i].x, vertL[i].y);
                    modifiedVCol.push(...nextColor);

                    modifiedVPos.push(nextX, nextY);
                    modifiedVCol.push(...nextColor);
                }

                modifiedVPos.push(nextX, nextY);
                modifiedVCol.push(...nextColor);
                modifiedVPos.push(nextX, nextY);
                modifiedVCol.push(...nextColor);
            }

            index += 2;
        }

        //const startX = modifiedVPos[0];
        //const startY = modifiedVPos[1];
        //console.log('----------------------------');
        //for(let i=0;i<modifiedVPos.length;){
        //    const x = modifiedVPos[i] - startX;
        //    const y = modifiedVPos[i + 1] - startY;
        //    console.log('(' + x + ',' + y + ')');
        //    i += 2;
        //}
        //console.log('----------------------------');

        this.appendVBO('a_position', new Float32Array(modifiedVPos), vertexStride);
        this.appendVBO('a_color', new Float32Array(modifiedVCol), colorStride);

        // prettier-ignore
        const projMatrix = [// 座標変換行列
            2.0 / width, 0.0, 0.0, 0.0,
            0.0, -2.0 / height, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            -1.0, 1.0, 0.0, 1.0,
        ];

        this.appendUniform('u_matrix', projMatrix);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, modifiedVPos.length / vertexStride);

        gl.disable(gl.BLEND);
    }
}
