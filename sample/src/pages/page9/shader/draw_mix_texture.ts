/**
 * 2枚のテクスチャを指定して、1枚目に2枚目をアルファブレンドで描画したものを
 * アルファブレンドでフレームバッファーに描画
 */
import { Shader } from '../gl/shader';
import { AttributeScope } from '../gl/attribute_scope';
import { DrawType, BlendType, TextureMinMagFilter, TextureWrapFilter } from '../gl/type';
import { Texture } from '../gl/texture';

// テクスチャをそのまま描画
export class DrawMixTextureShader extends Shader<{ first: Texture; second: Texture }> {
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
    protected drawCore(args: { first: Texture; second: Texture }): void {
        if (this.program === null) {
            throw new Error('programが初期化されていません。');
        }
        const context = this.context;

        const attrScope = new AttributeScope();
        attrScope.blend = true;
        attrScope.culling = false;
        attrScope.blendFunc = { src: BlendType.SRC_ALPHA, dest: BlendType.ONE_MINUS_SRC_ALPHA };
        context.pushAttrScope(attrScope);

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

        const firstBindNumber = context.bindTexture2D(firstTexture);
        const firstUniIndex = context.getUniformLocation(this.program, 'u_texture_first');
        context.generateMipmap2D(firstTexture);
        context.uniform1i(firstUniIndex, firstBindNumber);
        context.setTextureMinMagFilter2D(firstTexture, TextureMinMagFilter.NEAREST, TextureMinMagFilter.NEAREST);
        context.setTextureWrapFilter2D(firstTexture, TextureWrapFilter.CLAMP_TO_EDGE, TextureWrapFilter.CLAMP_TO_EDGE);

        const secondBindNumber = context.bindTexture2D(secondTexture);
        const secondUniIndex = context.getUniformLocation(this.program, 'u_texture_second');
        context.generateMipmap2D(secondTexture);
        context.uniform1i(secondUniIndex, secondBindNumber);
        context.setTextureMinMagFilter2D(secondTexture, TextureMinMagFilter.NEAREST, TextureMinMagFilter.NEAREST);
        context.setTextureWrapFilter2D(secondTexture, TextureWrapFilter.CLAMP_TO_EDGE, TextureWrapFilter.CLAMP_TO_EDGE);

        // 描画
        context.drawArrays(DrawType.TRIANGLE_STRIP, 0, vertexPos.length / posStride);

        context.popAttrScope();
    }
}
