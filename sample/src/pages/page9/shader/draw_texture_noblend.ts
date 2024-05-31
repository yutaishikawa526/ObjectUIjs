/**
 * テクスチャを上書きでそのまま描画するshader
 */
import { DrawTextureShader } from './draw_texture';
import { AttributeScope } from '../gl/attribute_scope';
import { BlendType } from '../gl/type';

// テクスチャをそのまま描画
export class DrawTextureNoBlendShader extends DrawTextureShader {
    // attrスコープの作成
    protected createAttrScope(): AttributeScope {
        const attrScope = super.createAttrScope();
        attrScope.blendFunc = { src: BlendType.ONE, dest: BlendType.ZERO };
        return attrScope;
    }
}
