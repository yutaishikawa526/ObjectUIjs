/**
 * テクスチャを上書きでそのまま描画するshader
 */
import { DrawTextureShader } from './draw_texture';
import { gl as oujGL } from 'objectuijs';

// テクスチャをそのまま描画
export class DrawTextureNoBlendShader extends DrawTextureShader {
    // attrスコープの作成
    protected createAttrScope(): oujGL.ContextAttribute {
        const attr = super.createAttrScope();
        attr.blendFunc = { src: oujGL.BlendType.ONE, dest: oujGL.BlendType.ZERO };
        return attr;
    }
}
