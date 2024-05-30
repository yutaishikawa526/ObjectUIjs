/**
 * テクスチャを上書きでそのまま描画するshader
 */
import { DrawTextureShader } from './draw_texture';

// テクスチャをそのまま描画
export class DrawTextureNoBlendShader extends DrawTextureShader {
    // blend設定とVBOの設定を行う
    protected setBlendAndVBO(): void {
        super.setBlendAndVBO();

        // Blendを上書きに設定
        const gl = this.gl;
        gl.blendFunc(gl.ONE, gl.ZERO);
    }
}
