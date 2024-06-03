/**
 * テクスチャをアルファブレンドでそのまま描画するshader
 */
import { Shader } from '../gl/shader';
import { ContextAttribute } from '../gl/context_attribute';
import { DrawType, BlendType, TextureMinMagFilter, TextureWrapFilter } from '../gl/type';
import { Texture } from '../gl/texture';
import { ContextScope } from '../gl/context_scope';

// テクスチャをそのまま描画
export class DrawTextureShader extends Shader<Texture> {
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
    protected drawCore(texture: Texture): void {
        if (this.program === null) {
            throw new Error('programが初期化されていません。');
        }
        const context = this.context;

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

        new ContextScope(
            () => {
                this.appendVBO('a_position', new Float32Array(vertexPos), posStride);
                this.appendVBO('a_textureCoord', new Float32Array(textureCoord), textureStride);

                this.bindTexture2DAndAttribute(
                    'u_texture',
                    texture,
                    TextureMinMagFilter.NEAREST,
                    TextureMinMagFilter.NEAREST,
                    TextureWrapFilter.CLAMP_TO_EDGE,
                    TextureWrapFilter.CLAMP_TO_EDGE,
                    true,
                );

                // 描画
                context.drawArrays(DrawType.TRIANGLE_STRIP, 0, 4);

                context.unbindTexture2D(texture);
            },
            context,
            this.createAttrScope(),
            null,
            null,
        );
    }

    // attrスコープの作成
    protected createAttrScope(): ContextAttribute {
        const attr = new ContextAttribute();
        attr.blend = true;
        attr.culling = false;
        attr.blendFunc = { src: BlendType.SRC_ALPHA, dest: BlendType.ONE_MINUS_SRC_ALPHA };
        return attr;
    }
}
