/**
 * GLで使用する列挙型
 */

// 描画のタイプ
export enum DrawType {
    POINTS,
    LINE_STRIP,
    LINE_LOOP,
    LINES,
    TRIANGLE_STRIP,
    TRIANGLE_FAN,
    TRIANGLES,
}

// MinMagフィルターのタイプ
export enum TextureMinMagFilter {
    LINEAR,
    NEAREST,
    NEAREST_MIPMAP_NEAREST,
    LINEAR_MIPMAP_NEAREST,
    NEAREST_MIPMAP_LINEAR,
    LINEAR_MIPMAP_LINEAR,
}

// wrapフィルターのタイプ
export enum TextureWrapFilter {
    REPEAT,
    CLAMP_TO_EDGE,
    MIRRORED_REPEAT,
}

// bufferオブジェクトのストアタイプ
export enum BufferStoreType {
    STATIC_DRAW,
    DYNAMIC_DRAW,
    STREAM_DRAW,
}

// 頂点属性のタイプ
export enum AttributeType {
    BYTE,
    SHORT,
    UNSIGNED_BYTE,
    UNSIGNED_SHORT,
    FLOAT,
}

// ブレンド関数のタイプ
export enum BlendType {
    ZERO,
    ONE,
    SRC_COLOR,
    ONE_MINUS_SRC_COLOR,
    DST_COLOR,
    ONE_MINUS_DST_COLOR,
    SRC_ALPHA,
    ONE_MINUS_SRC_ALPHA,
    DST_ALPHA,
    ONE_MINUS_DST_ALPHA,
    CONSTANT_COLOR,
    ONE_MINUS_CONSTANT_COLOR,
    CONSTANT_ALPHA,
    ONE_MINUS_CONSTANT_ALPHA,
    SRC_ALPHA_SATURATE,
}
