/**
 * 2枚のテクスチャを指定して、1枚目に2枚目をアルファブレンドで描画したものを
 * アルファブレンドでフレームバッファーに描画
 */
import { Shader } from './base';

// テクスチャをそのまま描画
export class DrawMixTextureShader extends Shader<{ first: WebGLTexture; second: WebGLTexture }> {
    // 頂点shaderプログラムを取得する
    protected getVertexShaderSource(): string {
        // prettier-ignore
        const vsprg = ''
            + 'attribute vec3 a_position;'
            + 'attribute vec2 a_textureCoord;'
            + 'varying vec2 v_TextureCoord;'
            + ''
            + 'void main(void){'
            + '    v_TextureCoord = a_textureCoord;'
            + '    gl_Position = vec4(a_position, 1.0);'
            + '}'
            + '';

        return vsprg;
    }

    // フラグメントshaderプログラムを取得する
    protected getFragmentShaderSource(): string {
        // prettier-ignore
        const fsprg = ''
            + 'precision mediump float;'
            + ''
            + 'varying vec2 v_TextureCoord;'
            + 'uniform sampler2D u_texture_first;'
            + 'uniform sampler2D u_texture_second;'
            + ''
            + 'void main(void){'
            + '    vec4 firstSmpColor = texture2D(u_texture_first, v_TextureCoord);'
            + '    vec4 secondSmpColor = texture2D(u_texture_second, v_TextureCoord);'
            + '    float srcAlpha = secondSmpColor[3];'
            + '    float destAlpha = firstSmpColor[3];'
            + '    float outAlpha = srcAlpha * srcAlpha + destAlpha * (1.0 - srcAlpha);'
            + '    vec3 srcRBGA = vec3(secondSmpColor[0], secondSmpColor[1], secondSmpColor[2]);'
            + '    vec3 destRBGA = vec3(firstSmpColor[0], firstSmpColor[1], firstSmpColor[2]);'
            + '    vec3 outRBGA = srcRBGA * srcAlpha + destRBGA * (1.0 - srcAlpha);'
            + '    gl_FragColor = vec4(outRBGA, outAlpha);'
            + '}'
            + '';

        return fsprg;
    }

    // 描画処理のコア処理
    protected drawCore(args: { first: WebGLTexture; second: WebGLTexture }): void {
        if (this.program === null) {
            throw new Error('programが初期化されていません。');
        }
        const gl = this.gl;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // prettier-ignore
        const vertexPos = [// 頂点座標配列
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
        ];

        // prettier-ignore
        const textureCoord = [// テクスチャ座標配列
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
        ];

        const posStride = 3;
        const textureStride = 2;

        this.appendVBO('a_position', new Float32Array(vertexPos), posStride);
        this.appendVBO('a_textureCoord', new Float32Array(textureCoord), textureStride);

        const firstTexture = args.first;
        const secondTexture = args.second;

        gl.activeTexture(gl.TEXTURE5);
        gl.bindTexture(gl.TEXTURE_2D, firstTexture);
        const firstUniIndex = gl.getUniformLocation(this.program, 'u_texture_first');
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.uniform1i(firstUniIndex, 5);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        gl.activeTexture(gl.TEXTURE6);
        gl.bindTexture(gl.TEXTURE_2D, secondTexture);
        const secondUniIndex = gl.getUniformLocation(this.program, 'u_texture_second');
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.uniform1i(secondUniIndex, 6);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        // 描画
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPos.length / posStride);

        gl.disable(gl.BLEND);
    }
}
