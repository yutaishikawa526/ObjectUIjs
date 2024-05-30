/**
 * テクスチャをアルファブレンドでそのまま描画するshader
 */
import { Shader } from './base';

// テクスチャをそのまま描画
export class DrawTextureShader extends Shader<WebGLTexture> {
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
            + 'uniform sampler2D u_texture;'
            + ''
            + 'void main(void){'
            + '    vec4 smpColor = texture2D(u_texture, v_TextureCoord);'
            + '    gl_FragColor = smpColor;'
            + '}'
            + '';

        return fsprg;
    }

    // 描画処理のコア処理
    protected drawCore(texture: WebGLTexture): void {
        if (this.program === null) {
            throw new Error('programが初期化されていません。');
        }
        const gl = this.gl;

        this.setBlendAndVBO();

        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        const textureUniIndex = gl.getUniformLocation(this.program, 'u_texture');
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.uniform1i(textureUniIndex, 4);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        // 描画
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.disable(gl.BLEND);
    }

    // blend設定とVBOの設定を行う
    protected setBlendAndVBO(): void {
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
    }
}
