/**
 * 属性のスコープ
 * viewport,blend,culling,depth,表裏設定,ブレンド関数の設定を保持する
 */
import { BlendType } from './type';

// 属性
export class AttributeScope {
    // viewport設定
    public viewport: { x: number; y: number; width: number; height: number } | null = null;
    // blend有効かどうか
    public blend: boolean | null = null;
    // cullingが有効かどうか
    public culling: boolean | null = null;
    // 表側設定はCCWかどうか
    public frontFaceCCW: boolean | null = null;
    // 深度テストが有効かどうか
    public depth: boolean | null = null;
    // Blend関数
    public blendFunc: { src: BlendType; dest: BlendType } | null = null;

    // 値をcloneする
    public clone(): AttributeScope {
        const cln = new AttributeScope();
        if (this.viewport === null) {
            cln.viewport = null;
        } else {
            cln.viewport = {
                x: this.viewport.x,
                y: this.viewport.y,
                width: this.viewport.width,
                height: this.viewport.height,
            };
        }
        cln.blend = this.blend;
        cln.culling = this.culling;
        cln.frontFaceCCW = this.frontFaceCCW;
        cln.depth = this.depth;
        if (this.blendFunc === null) {
            cln.blendFunc = null;
        } else {
            cln.blendFunc = { src: this.blendFunc.src, dest: this.blendFunc.dest };
        }
        return cln;
    }

    // 値をcopyする
    // ただしnullの値のもののみ
    public copy(attr: AttributeScope): void {
        const cln = attr.clone();
        if (this.viewport === null) {
            this.viewport = cln.viewport;
        }
        if (this.blend === null) {
            this.blend = cln.blend;
        }
        if (this.culling === null) {
            this.culling = cln.culling;
        }
        if (this.frontFaceCCW === null) {
            this.frontFaceCCW = cln.frontFaceCCW;
        }
        if (this.depth === null) {
            this.depth = cln.depth;
        }
        if (this.blendFunc === null) {
            this.blendFunc = cln.blendFunc;
        }
    }
}
