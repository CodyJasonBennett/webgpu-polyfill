/// <reference types="@webgpu/types" />
import {
  RenderPipelineState,
  Scissor,
  Viewport,
  _bufferData,
  _buffers,
  _contexts,
  _devices,
  _renderQueue,
  _samplers,
  _textureData,
  _textureImages,
  _textures,
} from './shared'

export const GPUTextureUsage: GPUTextureUsage = {
  __brand: 'GPUTextureUsage',
  COPY_DST: 2,
  COPY_SRC: 1,
  RENDER_ATTACHMENT: 16,
  STORAGE_BINDING: 8,
  TEXTURE_BINDING: 4,
}

export const GPUBufferUsage: GPUBufferUsage = {
  __brand: 'GPUBufferUsage',
  COPY_DST: 8,
  COPY_SRC: 4,
  INDEX: 16,
  INDIRECT: 256,
  MAP_READ: 1,
  MAP_WRITE: 2,
  QUERY_RESOLVE: 512,
  STORAGE: 128,
  UNIFORM: 64,
  VERTEX: 32,
}

export const GPUColorWrite: GPUColorWrite = {
  __brand: 'GPUColorWrite',
  RED: 1,
  GREEN: 2,
  BLUE: 4,
  ALPHA: 8,
  ALL: 15,
}

export const GPUBuffer = class implements GPUBuffer {
  readonly __brand = 'GPUBuffer'
  readonly label: string
  readonly size: GPUSize64
  readonly usage: GPUBufferUsageFlags

  constructor(descriptor: GPUBufferDescriptor) {
    this.label = descriptor.label ?? ''
    this.size = descriptor.size
    this.usage = descriptor.usage
    _buffers.add(this)
  }

  getMappedRange(offset?: GPUSize64, size?: GPUSize64): ArrayBuffer {
    const data = new Float32Array((size ?? this.size) / Float32Array.BYTES_PER_ELEMENT).subarray(offset)
    _bufferData.set(this, data)
    return data.buffer
  }
  async mapAsync(_mode: GPUMapModeFlags, _offset?: GPUSize64, _size?: GPUSize64): Promise<undefined> {
    return undefined
  }
  unmap(): undefined {
    return undefined
  }
  destroy(): undefined {
    return void _buffers.delete(this)
  }
}

export const GPUSampler = class implements GPUSampler {
  readonly __brand = 'GPUSampler'
  readonly label: string

  constructor(descriptor?: GPUSamplerDescriptor) {
    this.label = descriptor?.label ?? ''
    _samplers.add(this)
  }
}

export const GPUExternalTexture = class implements GPUExternalTexture {
  readonly __brand = 'GPUExternalTexture'
  readonly label: string

  get expired(): boolean {
    return false
  }

  constructor(descriptor: GPUExternalTextureDescriptor) {
    this.label = descriptor.label ?? ''
  }
}

export const GPUTextureView = class implements GPUTextureView {
  readonly __brand = 'GPUTextureView'
  readonly label: string

  constructor(descriptor?: GPUTextureViewDescriptor) {
    this.label = descriptor?.label ?? ''
  }
}

export const GPUTexture = class implements GPUTexture {
  readonly __brand = 'GPUTexture'
  readonly label: string
  readonly width: GPUIntegerCoordinate
  readonly height: GPUIntegerCoordinate
  readonly depthOrArrayLayers: GPUIntegerCoordinate
  readonly mipLevelCount: GPUIntegerCoordinate
  readonly sampleCount: GPUSize32
  readonly dimension: GPUTextureDimension
  readonly format: GPUTextureFormat
  readonly usage: GPUTextureUsageFlags

  constructor(descriptor: GPUTextureDescriptor) {
    this.label = descriptor.label ?? ''
    this.width = (descriptor.size as GPUIntegerCoordinate[])[0] ?? (descriptor.size as GPUExtent3DDict).width
    this.height = (descriptor.size as GPUIntegerCoordinate[])[1] ?? (descriptor.size as GPUExtent3DDict).height
    this.depthOrArrayLayers =
      (descriptor.size as GPUIntegerCoordinate[])[2] ?? (descriptor.size as GPUExtent3DDict).depthOrArrayLayers
    this.mipLevelCount = descriptor.mipLevelCount ?? 0
    this.sampleCount = descriptor.sampleCount ?? 0
    this.dimension = descriptor.dimension ?? '2d'
    this.format = descriptor.format
    this.usage = descriptor.usage
  }

  createView(descriptor?: GPUTextureViewDescriptor): GPUTextureView {
    const view = new GPUTextureView(descriptor)
    _textures.set(view, this)
    return view
  }
  destroy(): undefined {
    return undefined
  }
}

export const GPUBindGroupLayout = class implements GPUBindGroupLayout {
  readonly __brand = 'GPUBindGroupLayout'
  readonly label: string

  constructor(descriptor: GPUBindGroupLayoutDescriptor) {
    this.label = descriptor.label ?? ''
  }
}

export const GPUPipelineLayout = class implements GPUPipelineLayout {
  readonly __brand = 'GPUPipelineLayout'
  readonly label: string

  constructor(descriptor: GPUPipelineLayoutDescriptor) {
    this.label = descriptor.label ?? ''
  }
}

export const GPUCompilationInfo = class implements GPUCompilationInfo {
  readonly __brand = 'GPUCompilationInfo'
  readonly messages: GPUCompilationMessage[] = []
}

export const GPUShaderModule = class implements GPUShaderModule {
  readonly __brand = 'GPUShaderModule'
  readonly label: string

  constructor(descriptor: GPUShaderModuleDescriptor) {
    this.label = descriptor.label ?? ''
  }

  async compilationInfo(): Promise<GPUCompilationInfo> {
    return new GPUCompilationInfo()
  }
}

export const GPUBindGroup = class implements GPUBindGroup {
  readonly __brand = 'GPUBindGroup'
  readonly label: string

  constructor(descriptor: GPUBindGroupDescriptor) {
    this.label = descriptor.label ?? ''
  }
}

export const GPUComputePipeline = class implements GPUComputePipeline {
  readonly __brand = 'GPUComputePipeline'
  readonly label: string

  constructor(descriptor: GPUComputePipelineDescriptor) {
    this.label = descriptor.label ?? ''
  }

  getBindGroupLayout(_index: number): GPUBindGroupLayout {
    return new GPUBindGroupLayout({ label: '', entries: [] })
  }
}

export const GPURenderPipeline = class implements GPURenderPipeline {
  readonly __brand = 'GPURenderPipeline'
  readonly label: string

  constructor(descriptor: GPURenderPipelineDescriptor) {
    this.label = descriptor.label ?? ''
  }

  getBindGroupLayout(_index: number): GPUBindGroupLayout {
    return new GPUBindGroupLayout({ label: '', entries: [] })
  }
}

export const GPURenderBundle = class implements GPURenderBundle {
  readonly __brand = 'GPURenderBundle'
  readonly label: string

  constructor(descriptor?: GPUObjectDescriptorBase) {
    this.label = descriptor?.label ?? ''
  }
}

export const GPURenderBundleEncoder = class implements GPURenderBundleEncoder {
  readonly __brand = 'GPURenderBundleEncoder'
  readonly label: string

  constructor(descriptor: GPURenderBundleEncoderDescriptor) {
    this.label = descriptor.label ?? ''
  }

  finish(descriptor?: GPUObjectDescriptorBase): GPURenderBundle {
    return new GPURenderBundle(descriptor)
  }
  pushDebugGroup(_groupLabel: string): undefined {
    return undefined
  }
  popDebugGroup(): undefined {
    return undefined
  }
  insertDebugMarker(_markerLabel: string): undefined {
    return undefined
  }
  setBindGroup(
    _index: GPUIndex32,
    _bindGroup: GPUBindGroup,
    _dynamicOffsets?: Iterable<GPUBufferDynamicOffset>,
  ): undefined {
    return undefined
  }
  setPipeline(_pipeline: GPURenderPipeline): undefined {
    return undefined
  }
  setIndexBuffer(_buffer: GPUBuffer, _indexFormat: GPUIndexFormat, _offset?: GPUSize64, _size?: GPUSize64): undefined {
    return undefined
  }
  setVertexBuffer(_slot: GPUIndex32, _buffer: GPUBuffer, _offset?: GPUSize64, _size?: GPUSize64): undefined {
    return undefined
  }
  draw(
    _vertexCount: GPUSize32,
    _instanceCount?: GPUSize32,
    _firstVertex?: GPUSize32,
    _firstInstance?: GPUSize32,
  ): undefined {
    return undefined
  }
  drawIndexed(
    _indexCount: GPUSize32,
    _instanceCount?: GPUSize32,
    _firstIndex?: GPUSize32,
    _baseVertex?: GPUSignedOffset32,
    _firstInstance?: GPUSize32,
  ): undefined {
    return undefined
  }
  drawIndirect(_indirectBuffer: GPUBuffer, _indirectOffset: GPUSize64): undefined {
    return undefined
  }
  drawIndexedIndirect(_indirectBuffer: GPUBuffer, _indirectOffset: GPUSize64): undefined {
    return undefined
  }
}

export const GPURenderPassEncoder = class implements GPURenderPassEncoder {
  readonly __brand = 'GPURenderPassEncoder'
  readonly label: string
  private _viewport: Viewport = { x: 0, y: 0, width: 0, height: 0 }
  private _scissor: Scissor = { x: 0, y: 0, width: 0, height: 0 }
  private _pipeline?: GPURenderPipeline
  private _pipelineState?: RenderPipelineState

  constructor(descriptor: GPURenderPassDescriptor) {
    this.label = descriptor.label ?? ''
  }

  setViewport(x: number, y: number, width: number, height: number, _minDepth: number, _maxDepth: number): undefined {
    return void Object.assign(this._viewport, { x, y, width, height })
  }
  setScissorRect(
    x: GPUIntegerCoordinate,
    y: GPUIntegerCoordinate,
    width: GPUIntegerCoordinate,
    height: GPUIntegerCoordinate,
  ): undefined {
    return void Object.assign(this._scissor, { x, y, width, height })
  }
  setPipeline(pipeline: GPURenderPipeline): undefined {
    this._pipeline = pipeline
    this._pipelineState = { buffers: new Map(), bindGroups: new Map(), vertexCount: 0, indexCount: 0 }

    return undefined
  }
  setBindGroup(
    index: GPUIndex32,
    bindGroup: GPUBindGroup,
    _dynamicOffsets?: Iterable<GPUBufferDynamicOffset>,
  ): undefined {
    return void this._pipelineState!.bindGroups.set(index, bindGroup)
  }
  setIndexBuffer(buffer: GPUBuffer, _indexFormat: GPUIndexFormat, _offset?: GPUSize64, _size?: GPUSize64): undefined {
    return void this._pipelineState!.buffers.set(-1, buffer)
  }
  setVertexBuffer(slot: GPUIndex32, buffer: GPUBuffer, _offset?: GPUSize64, _size?: GPUSize64): undefined {
    return void this._pipelineState!.buffers.set(slot, buffer)
  }
  draw(
    vertexCount: GPUSize32,
    _instanceCount?: GPUSize32,
    _firstVertex?: GPUSize32,
    _firstInstance?: GPUSize32,
  ): undefined {
    return void (this._pipelineState!.vertexCount = vertexCount)
  }
  drawIndexed(
    indexCount: GPUSize32,
    _instanceCount?: GPUSize32,
    _firstIndex?: GPUSize32,
    _baseVertex?: GPUSignedOffset32,
    _firstInstance?: GPUSize32,
  ): undefined {
    return void (this._pipelineState!.indexCount = indexCount)
  }
  drawIndirect(_indirectBuffer: GPUBuffer, _indirectOffset: GPUSize64): undefined {
    return undefined
  }
  drawIndexedIndirect(_indirectBuffer: GPUBuffer, _indirectOffset: GPUSize64): undefined {
    return undefined
  }
  end(): undefined {
    return void _renderQueue.set(this._pipeline!, this._pipelineState!)
  }
  setBlendConstant(_color: GPUColor): undefined {
    return undefined
  }
  setStencilReference(_reference: GPUStencilValue): undefined {
    return undefined
  }
  beginOcclusionQuery(_queryIndex: GPUSize32): undefined {
    return undefined
  }
  endOcclusionQuery(): undefined {
    return undefined
  }
  executeBundles(_bundles: Iterable<GPURenderBundle>): undefined {
    return undefined
  }
  pushDebugGroup(_groupLabel: string): undefined {
    return undefined
  }
  popDebugGroup(): undefined {
    return undefined
  }
  insertDebugMarker(_markerLabel: string): undefined {
    return undefined
  }
}

export const GPUComputePassEncoder = class implements GPUComputePassEncoder {
  readonly __brand = 'GPUComputePassEncoder'
  readonly label: string

  constructor(descriptor?: GPUComputePassDescriptor) {
    this.label = descriptor?.label ?? ''
  }

  setPipeline(_pipeline: GPUComputePipeline): undefined {
    return undefined
  }
  dispatchWorkgroups(
    _workgroupCountX: GPUSize32,
    _workgroupCountY?: GPUSize32,
    _workgroupCountZ?: GPUSize32,
  ): undefined {
    return undefined
  }
  dispatch(_workgroupCountX: GPUSize32, _workgroupCountY?: GPUSize32, _workgroupCountZ?: GPUSize32): undefined {
    return undefined
  }
  dispatchWorkgroupsIndirect(_indirectBuffer: GPUBuffer, _indirectOffset: GPUSize64): undefined {
    return undefined
  }
  dispatchIndirect(_indirectBuffer: GPUBuffer, _indirectOffset: GPUSize64): undefined {
    return undefined
  }
  end(): undefined {
    return undefined
  }
  insertDebugMarker(_markerLabel: string): undefined {
    return undefined
  }
  pushDebugGroup(_groupLabel: string): undefined {
    return undefined
  }
  popDebugGroup(): undefined {
    return undefined
  }
  setBindGroup(
    _index: GPUIndex32,
    _bindGroup: GPUBindGroup,
    _dynamicOffsets?: Iterable<GPUBufferDynamicOffset>,
  ): undefined {
    return undefined
  }
}

export const GPUCommandBuffer = class implements GPUCommandBuffer {
  readonly __brand = 'GPUCommandBuffer'
  readonly label: string

  constructor(descriptor?: GPUObjectDescriptorBase) {
    this.label = descriptor?.label ?? ''
  }
}

export const GPUCommandEncoder = class implements GPUCommandEncoder {
  readonly __brand = 'GPUCommandEncoder'
  readonly label: string

  constructor(descriptor?: GPUObjectDescriptorBase) {
    this.label = descriptor?.label ?? ''
  }

  beginRenderPass(descriptor: GPURenderPassDescriptor): GPURenderPassEncoder {
    return new GPURenderPassEncoder(descriptor)
  }
  beginComputePass(descriptor?: GPUComputePassDescriptor): GPUComputePassEncoder {
    return new GPUComputePassEncoder(descriptor)
  }
  copyBufferToBuffer(
    _source: GPUBuffer,
    _sourceOffset: GPUSize64,
    _destination: GPUBuffer,
    _destinationOffset: GPUSize64,
    _size: GPUSize64,
  ): undefined {
    return undefined
  }
  copyBufferToTexture(
    _source: GPUImageCopyBuffer,
    _destination: GPUImageCopyTexture,
    _copySize: GPUExtent3DStrict,
  ): undefined {
    return undefined
  }
  copyTextureToBuffer(
    _source: GPUImageCopyTexture,
    _destination: GPUImageCopyBuffer,
    _copySize: GPUExtent3DStrict,
  ): undefined {
    return undefined
  }
  copyTextureToTexture(
    _source: GPUImageCopyTexture,
    _destination: GPUImageCopyTexture,
    _copySize: GPUExtent3DStrict,
  ): undefined {
    return undefined
  }
  clearBuffer(_buffer: GPUBuffer, _offset?: GPUSize64, _size?: GPUSize64): undefined {
    return undefined
  }
  writeTimestamp(_querySet: GPUQuerySet, _queryIndex: GPUSize32): undefined {
    return undefined
  }
  resolveQuerySet(
    _querySet: GPUQuerySet,
    _firstQuery: GPUSize32,
    _queryCount: GPUSize32,
    _destination: GPUBuffer,
    _destinationOffset: GPUSize64,
  ): undefined {
    return undefined
  }
  pushDebugGroup(_groupLabel: string): undefined {
    return undefined
  }
  popDebugGroup(): undefined {
    return undefined
  }
  insertDebugMarker(_markerLabel: string): undefined {
    return undefined
  }
  finish(descriptor?: GPUObjectDescriptorBase): GPUCommandBuffer {
    return new GPUCommandBuffer(descriptor)
  }
}

export const GPUCanvasContext = class implements GPUCanvasContext {
  readonly __brand = 'GPUCanvasContext'
  public canvas!: HTMLCanvasElement
  private _format: GPUTextureFormat = 'bgra8unorm'
  private _usage: GPUTextureUsageFlags = GPUTextureUsage.RENDER_ATTACHMENT
  private _texture?: GPUTexture

  configure(configuration: GPUCanvasConfiguration): undefined {
    this._format = configuration.format
    if (configuration.usage) this._usage = configuration.usage

    return undefined
  }
  unconfigure(): undefined {
    return undefined
  }
  getPreferredFormat(_adapter: GPUAdapter): GPUTextureFormat {
    return this._format
  }
  getCurrentTexture(): GPUTexture {
    if (
      this._texture?.width !== this.canvas.width ||
      this._texture?.height !== this.canvas.height ||
      this._texture?.format !== this._format ||
      this._texture?.usage !== this._usage
    ) {
      if (this._texture) {
        _contexts.delete(this._texture)
        this._texture.destroy()
      }

      this._texture = new GPUTexture({
        size: [this.canvas.width, this.canvas.height, 1],
        format: this._format,
        usage: this._usage,
      })
      _contexts.set(this._texture, this)
    }

    return this._texture
  }
}

export const GPUQueue = class implements GPUQueue {
  readonly __brand = 'GPUQueue'
  readonly label = ''

  writeBuffer(
    buffer: GPUBuffer,
    _bufferOffset: GPUSize64,
    data: BufferSource | SharedArrayBuffer,
    _dataOffset?: GPUSize64,
    _size?: GPUSize64,
  ): undefined {
    return void _bufferData.set(buffer, data)
  }
  submit(_commandBuffers: Iterable<GPUCommandBuffer>): undefined {
    return undefined
  }
  async onSubmittedWorkDone(): Promise<undefined> {
    return undefined
  }
  writeTexture(
    destination: GPUImageCopyTexture,
    data: BufferSource | SharedArrayBuffer,
    _dataLayout: GPUImageDataLayout,
    _size: GPUExtent3DStrict,
  ): undefined {
    return void _textureData.set(destination.texture, data)
  }
  copyExternalImageToTexture(
    source: GPUImageCopyExternalImage,
    destination: GPUImageCopyTextureTagged,
    _copySize: GPUExtent3DStrict,
  ): undefined {
    return void _textureImages.set(destination.texture, source.source)
  }
}

export const GPUDeviceLostInfo = class implements GPUDeviceLostInfo {
  readonly __brand = 'GPUDeviceLostInfo'
  readonly message: string
  readonly reason: GPUDeviceLostReason | undefined

  constructor(message: string, reason?: GPUDeviceLostReason) {
    this.message = message
    this.reason = reason
  }
}

export const GPUQuerySet = class implements GPUQuerySet {
  readonly __brand = 'GPUQuerySet'
  readonly label: string
  readonly type: GPUQueryType
  readonly count: GPUSize32

  constructor(descriptor: GPUQuerySetDescriptor) {
    this.label = descriptor.label ?? ''
    this.type = descriptor.type
    this.count = descriptor.count
  }

  destroy(): undefined {
    return undefined
  }
}

export const GPUSupportedFeatures = class extends Set implements GPUSupportedFeatures {}
export const GPUSupportedLimits = class implements GPUSupportedLimits {
  readonly __brand = 'GPUSupportedLimits'
  readonly maxTextureDimension1D = 0
  readonly maxTextureDimension2D = 0
  readonly maxTextureDimension3D = 0
  readonly maxTextureArrayLayers = 0
  readonly maxBindGroups = 0
  readonly maxDynamicUniformBuffersPerPipelineLayout = 0
  readonly maxDynamicStorageBuffersPerPipelineLayout = 0
  readonly maxSampledTexturesPerShaderStage = 0
  readonly maxSamplersPerShaderStage = 0
  readonly maxStorageBuffersPerShaderStage = 0
  readonly maxStorageTexturesPerShaderStage = 0
  readonly maxUniformBuffersPerShaderStage = 0
  readonly maxUniformBufferBindingSize = 0
  readonly maxStorageBufferBindingSize = 0
  readonly minUniformBufferOffsetAlignment = 0
  readonly minStorageBufferOffsetAlignment = 0
  readonly maxVertexBuffers = 0
  readonly maxVertexAttributes = 0
  readonly maxVertexBufferArrayStride = 0
  readonly maxInterStageShaderComponents = 0
  readonly maxInterStageShaderVariables = 0
  readonly maxColorAttachments = 0
  readonly maxComputeWorkgroupStorageSize = 0
  readonly maxComputeInvocationsPerWorkgroup = 0
  readonly maxComputeWorkgroupSizeX = 0
  readonly maxComputeWorkgroupSizeY = 0
  readonly maxComputeWorkgroupSizeZ = 0
  readonly maxComputeWorkgroupsPerDimension = 0
}

export const GPUDevice = class extends EventTarget implements GPUDevice {
  readonly __brand = 'GPUDevice'
  readonly label: string
  readonly features = new GPUSupportedFeatures()
  readonly limits = new GPUSupportedLimits()
  readonly queue = new GPUQueue()
  readonly lost = new Promise<GPUDeviceLostInfo>((res) => res(new GPUDeviceLostInfo('')))

  constructor(descriptor?: GPUDeviceDescriptor) {
    super()
    this.label = descriptor?.label ?? ''
    _devices.add(this)
  }

  createSampler(descriptor?: GPUSamplerDescriptor): GPUSampler {
    return new GPUSampler(descriptor)
  }
  importExternalTexture(descriptor: GPUExternalTextureDescriptor): GPUExternalTexture {
    return new GPUExternalTexture(descriptor)
  }
  createBindGroupLayout(descriptor: GPUBindGroupLayoutDescriptor): GPUBindGroupLayout {
    return new GPUBindGroupLayout(descriptor)
  }
  createPipelineLayout(descriptor: GPUPipelineLayoutDescriptor): GPUPipelineLayout {
    return new GPUPipelineLayout(descriptor)
  }
  createComputePipeline(descriptor: GPUComputePipelineDescriptor): GPUComputePipeline {
    return new GPUComputePipeline(descriptor)
  }
  async createComputePipelineAsync(descriptor: GPUComputePipelineDescriptor): Promise<GPUComputePipeline> {
    return new GPUComputePipeline(descriptor)
  }
  createRenderPipeline(descriptor: GPURenderPipelineDescriptor): GPURenderPipeline {
    return new GPURenderPipeline(descriptor)
  }
  async createRenderPipelineAsync(descriptor: GPURenderPipelineDescriptor): Promise<GPURenderPipeline> {
    return new GPURenderPipeline(descriptor)
  }
  createRenderBundleEncoder(descriptor: GPURenderBundleEncoderDescriptor): GPURenderBundleEncoder {
    return new GPURenderBundleEncoder(descriptor)
  }
  createQuerySet(descriptor: GPUQuerySetDescriptor): GPUQuerySet {
    return new GPUQuerySet(descriptor)
  }
  pushErrorScope(_filter: GPUErrorFilter): undefined {
    return undefined
  }
  async popErrorScope(): Promise<GPUError | null> {
    return null
  }
  createBuffer(descriptor: GPUBufferDescriptor): GPUBuffer {
    return new GPUBuffer(descriptor)
  }
  createShaderModule(descriptor: GPUShaderModuleDescriptor): GPUShaderModule {
    return new GPUShaderModule(descriptor)
  }
  createBindGroup(descriptor: GPUBindGroupDescriptor): GPUBindGroup {
    return new GPUBindGroup(descriptor)
  }
  createCommandEncoder(descriptor?: GPUObjectDescriptorBase): GPUCommandEncoder {
    return new GPUCommandEncoder(descriptor)
  }
  createTexture(descriptor: GPUTextureDescriptor): GPUTexture {
    return new GPUTexture(descriptor)
  }
  destroy(): undefined {
    return void _devices.delete(this)
  }
  onuncapturederror(): undefined {
    return undefined
  }
}

export const GPUAdapterInfo = class implements GPUAdapterInfo {
  readonly __brand = 'GPUAdapterInfo'
  readonly vendor = ''
  readonly architecture = ''
  readonly device = ''
  readonly description = ''

  constructor(_unmaskHints?: string[]) {}
}

export const GPUAdapter = class implements GPUAdapter {
  readonly __brand = 'GPUAdapter'
  readonly name = 'GPUAdapter'
  readonly features = new GPUSupportedFeatures()
  readonly limits = new GPUSupportedLimits()

  get isFallbackAdapter(): boolean {
    return false
  }

  async requestAdapterInfo(unmaskHints?: string[]): Promise<GPUAdapterInfo> {
    return new GPUAdapterInfo(unmaskHints)
  }
  async requestDevice(descriptor?: GPUDeviceDescriptor): Promise<GPUDevice> {
    return new GPUDevice(descriptor)
  }
}

export const GPU = class implements GPU {
  readonly __brand = 'GPU'

  getPreferredCanvasFormat(): GPUTextureFormat {
    return 'bgra8unorm'
  }
  async requestAdapter(): Promise<GPUAdapter> {
    return new GPUAdapter()
  }
}
