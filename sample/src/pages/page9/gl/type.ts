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
