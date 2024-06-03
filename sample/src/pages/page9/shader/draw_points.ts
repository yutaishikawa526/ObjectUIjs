/**
 * 点を描画するshader
 */
import { Shader } from '../gl/shader';
import { ContextAttribute } from '../gl/context_attribute';
import { DrawType, BlendType } from '../gl/type';
import { ContextScope } from '../gl/context_scope';

// 点を描画
export class DrawPointsShader extends Shader<{
    vertexPos: Array<number>; // 頂点配列。2次元で指定。座標系は左上を(0,0)とする。ピクセル指定
    vertexColor: Array<number>; // 色の配列
    radius: number; // 半径。ピクセルで指定
    rect: { width: number; height: number }; // 描画矩形の幅と高さ。ピクセルで指定
    edgeDivision: number; // 何分割で丸くするか。
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
        radius: number;
        rect: { width: number; height: number };
        edgeDivision: number;
    }): void {
        if (this.program === null) {
            throw new Error('programが初期化されていません。');
        }
        const context = this.context;

        const vertexPos = args.vertexPos;
        const vertexColor = args.vertexColor;
        const width = args.rect.width;
        const height = args.rect.height;
        const radius = args.radius;
        const edgeDivision = Math.ceil(args.edgeDivision);

        if (vertexPos.length < 2) {
            throw new Error('1点以上必要です。');
        } else if (vertexPos.length % 2 !== 0) {
            throw new Error('偶数点必要です。');
        } else if (vertexPos.length * 2 !== vertexColor.length) {
            throw new Error('色と座標の整合性が取れていません。');
        } else if (radius <= 0) {
            throw new Error('太さは正の値である必要があります。');
        } else if (width <= 0 || height <= 0) {
            throw new Error('幅、高さは正の値である必要があります。');
        } else if (edgeDivision < 3) {
            throw new Error('端の分割は3以上を指定する必要があります。');
        }

        const vertexStride = 2;
        const colorStride = 4;

        const unitAngle = (2 * Math.PI) / (edgeDivision + 1);
        const pairCosSinList: Array<{ cos: number; sin: number }> = [];
        for (let i = 0; i < edgeDivision; i++) {
            pairCosSinList.push({ cos: Math.cos(unitAngle * i), sin: Math.sin(unitAngle * i) });
        }

        const modifiedVPos: Array<number> = [];
        const modifiedVCol: Array<number> = [];
        for (let index = 0; index < vertexPos.length; index += 2) {
            const x = vertexPos[index];
            const y = vertexPos[index + 1];
            const color: Array<number> = [
                vertexColor[index * 2],
                vertexColor[index * 2 + 1],
                vertexColor[index * 2 + 2],
                vertexColor[index * 2 + 3],
            ];

            const vertDirction: { x: number; y: number } = {
                x: radius,
                y: 0.0,
            };

            const vertL: Array<{ x: number; y: number }> = [];
            pairCosSinList.forEach((pCosSin: { cos: number; sin: number }) => {
                const vx = pCosSin.cos * vertDirction.x - pCosSin.sin * vertDirction.y;
                const vy = pCosSin.sin * vertDirction.x + pCosSin.cos * vertDirction.y;
                vertL.push({ x: x + vx, y: y + vy });
            });
            vertL.push({ x: x + vertDirction.x, y: y + vertDirction.y });

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

            modifiedVPos.push(x, y);
            modifiedVCol.push(...color);
            modifiedVPos.push(x, y);
            modifiedVCol.push(...color);
        }

        // prettier-ignore
        const projMatrix = [// 座標変換行列
            2.0 / width, 0.0, 0.0, 0.0,
            0.0, -2.0 / height, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            -1.0, 1.0, 0.0, 1.0,
        ];

        const attr = new ContextAttribute();
        attr.blend = true;
        attr.culling = false;
        attr.blendFunc = { src: BlendType.SRC_ALPHA, dest: BlendType.ONE_MINUS_SRC_ALPHA };

        new ContextScope(
            () => {
                this.appendVBO('a_position', new Float32Array(modifiedVPos), vertexStride);
                this.appendVBO('a_color', new Float32Array(modifiedVCol), colorStride);

                this.appendUniform('u_matrix', projMatrix);

                context.drawArrays(DrawType.TRIANGLE_STRIP, 0, modifiedVPos.length / vertexStride);
            },
            context,
            attr,
            null,
            null,
        );
    }
}
