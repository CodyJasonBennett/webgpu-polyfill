export const _devices = new Set<GPUDevice>()
export const _contexts = new Map<GPUTexture, GPUCanvasContext>()
export const _textures = new Map<GPUTextureView, GPUTexture>()
export const _textureData = new Map<GPUTexture, BufferSource | SharedArrayBuffer>()
export const _textureImages = new Map<GPUTexture, ImageBitmap | HTMLCanvasElement | OffscreenCanvas>()
export const _samplers = new Set<GPUSampler>()
export const _buffers = new Set<GPUBuffer>()
export const _bufferData = new Map<GPUBuffer, BufferSource | SharedArrayBuffer>()

export interface Viewport {
  x: number
  y: number
  width: number
  height: number
}

export interface Scissor {
  x: number
  y: number
  width: number
  height: number
}

export interface RenderPipelineState {
  buffers: Map<number, GPUBuffer>
  bindGroups: Map<GPUIndex32, GPUBindGroup>
  vertexCount: GPUSize32
  indexCount: GPUSize32
}

export const _renderQueue = new Map<GPURenderPipeline, RenderPipelineState>()
