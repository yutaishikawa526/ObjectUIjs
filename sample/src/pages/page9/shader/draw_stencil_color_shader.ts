/**
 * 線を描画するshader
 */
import { ContextAttribute } from '../gl/context_attribute';
import { ContextScope } from '../gl/context_scope';
import { Shader } from '../gl/shader';
import { Texture } from '../gl/texture';
import { BlendType, DrawType, TextureMinMagFilter, TextureWrapFilter } from '../gl/type';

// 線を描画
export class DrawStencilColorShader extends Shader<{
    stencilTexture: Texture; // ステンシルテクスチャ
    color: { r: number; g: number; b: number; a: number }; // 色
}> {
    // 頂点shaderプログラムを取得する
    protected getVertexShaderSource(): string {
        // prettier-ignore
        const vsprg = ''
            + 'attribute vec2 a_position;'
            + 'attribute vec2 a_textureCoord;'
            + 'varying vec2 v_TextureCoord;'
            + ''
            + 'void main(void){'
            + '    v_TextureCoord = a_textureCoord;'
            + '    gl_Position = vec4(a_position, 1.0, 1.0);'
            + '}'
            + '';

        return vsprg;
    }

    // フラグメントshaderプログラムを取得する
    protected getFragmentShaderSource(): string {
        // prettier-ignore
        const fsprg = ''
            + 'precision mediump float;'
            + 'uniform vec4 u_color;'
            + 'uniform sampler2D u_texture;'
            + 'varying vec2 v_TextureCoord;'
            + ''
            + 'void main(void){'
            + '    vec4 smpColor = texture2D(u_texture, v_TextureCoord);'
            + '    gl_FragColor = u_color * smpColor;'
            + '}'
            + '';

        return fsprg;
    }

    // 描画処理のコア処理
    protected drawCore(args: {
        stencilTexture: Texture; // ステンシルテクスチャ
        color: { r: number; g: number; b: number; a: number }; // 色
    }): void {
        const program = this.program;
        if (program === null) {
            throw new Error('programが初期化されていません。');
        }
        const context = this.context;

        // prettier-ignore
        const vertexPos = [// 頂点座標配列
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            1.0, 1.0,
        ];

        // prettier-ignore
        const textureCoord = [// テクスチャ座標配列
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
        ];

        const posStride = 2;
        const textureStride = 2;

        const attr = new ContextAttribute();
        attr.blend = true;
        attr.culling = false;
        attr.blendFunc = { src: BlendType.ONE, dest: BlendType.ZERO };

        const texture = args.stencilTexture;
        const color = args.color;

        new ContextScope(
            () => {
                this.appendVBO('a_position', new Float32Array(vertexPos), posStride);
                this.appendVBO('a_textureCoord', new Float32Array(textureCoord), textureStride);
                context.uniform4f(context.getUniformLocation(program, 'u_color'), color.r, color.g, color.b, color.a);

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
            attr,
            null,
            null,
        );
    }
}
