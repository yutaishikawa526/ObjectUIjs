/**
 * テクスチャを上書きでそのまま描画するshader
 */
import { DrawTextureShader } from './draw_texture';
import { ContextAttribute } from '../gl/context_attribute';
import { BlendType } from '../gl/type';

// テクスチャをそのまま描画
export class DrawTextureNoBlendShader extends DrawTextureShader {
    // attrスコープの作成
    protected createAttrScope(): ContextAttribute {
        const attr = super.createAttrScope();
        attr.blendFunc = { src: BlendType.ONE, dest: BlendType.ZERO };
        return attr;
    }
}
