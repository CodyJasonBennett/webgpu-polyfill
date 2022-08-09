import { polyfill, supported } from 'webgpu-polyfill'

polyfill()

//

const canvas = document.createElement('canvas')
document.body.appendChild(canvas)

const context = canvas.getContext('webgpu')!
const adapter = await navigator.gpu.requestAdapter()
const device = await adapter!.requestDevice()
const format = navigator.gpu.getPreferredCanvasFormat()

//

const attributes = {
  position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
  uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
}

const uniforms = {
  time: 0,
  texture: await createImageBitmap(new ImageData(new Uint8ClampedArray([76, 51, 128, 255]), 1, 1)),
}

const glsl = {
  vertex: `
    in vec2 uv;
    in vec3 position;

    out vec2 vUv;
  
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1);
    }
  `,
  fragment: `
    precision highp float;

    layout(std140) uniform Uniforms {
      float time;
    };

    uniform sampler2D color;

    in vec2 vUv;
    out vec4 pc_fragColor;

    void main() {
      pc_fragColor = vec4(0.5 + 0.3 * cos(vUv.xyx + time), 0.0) + texture(color, vUv);
    }
  `,
}

const wgsl = {
  vertex: `
    struct Uniforms {
      time: f32,
    };
    @binding(0) @group(0) var<uniform> uniforms: Uniforms;

    struct VertexIn {
      @location(0) position: vec3<f32>,
      @location(1) uv: vec2<f32>,
    };

    struct VertexOut {
      @builtin(position) position: vec4<f32>,
      @location(0) color: vec4<f32>,
      @location(1) uv: vec2<f32>,
    };

    @vertex
    fn main(input: VertexIn) -> VertexOut {
      var out: VertexOut;
      out.position = vec4(input.position, 1.0);
      out.color = vec4(0.5 + 0.3 * cos(vec3(input.uv, 0.0) + uniforms.time), 0.0);
      out.uv = input.uv;
      return out;
    }
  `,
  fragment: `
    @binding(1) @group(0) var sample: sampler;
    @binding(2) @group(0) var texture: texture_2d<f32>;

    struct FragmentIn {
      @location(0) color: vec4<f32>,
      @location(1) uv: vec2<f32>,
    };

    struct FragmentOut {
      @location(0) color: vec4<f32>,
    };

    @fragment
    fn main(input: FragmentIn) -> FragmentOut {
      var out: FragmentOut;
      out.color = input.color + textureSample(texture, sample, input.uv);
      return out;
    }
  `,
}

const shaders = supported ? wgsl : glsl

const buffers = new Map<string, GPUBuffer>()
const vertexBuffers: GPUVertexBufferLayout[] = []

let shaderLocation = -1
for (const key in attributes) {
  const attribute = attributes[key as keyof typeof attributes]

  const buffer = device.createBuffer({
    size: attribute.data.byteLength,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  })
  // @ts-ignore
  new attribute.data.constructor(buffer.getMappedRange()).set(attribute.data)
  buffer.unmap()

  buffers.set(key, buffer)

  const type = attribute.data instanceof Float32Array ? 'float' : 'uint'
  const bits = attribute.data.BYTES_PER_ELEMENT * 8
  const name = type + bits
  shaderLocation++

  vertexBuffers.push({
    arrayStride: attribute.size * attribute.data.BYTES_PER_ELEMENT,
    attributes: [
      {
        format: `${name}x${attribute.size}`,
        offset: attribute.data.byteOffset,
        shaderLocation,
      } as GPUVertexAttribute,
    ],
  })
}

const pipeline = device.createRenderPipeline({
  vertex: {
    module: device.createShaderModule({ code: shaders.vertex }),
    entryPoint: 'main',
    buffers: vertexBuffers,
  },
  fragment: {
    module: device.createShaderModule({ code: shaders.fragment }),
    entryPoint: 'main',
    targets: [
      {
        format,
        writeMask: GPUColorWrite.ALL,
      },
    ],
  },
  primitive: {
    frontFace: 'ccw',
    cullMode: 'back',
    topology: 'triangle-list',
  },
  depthStencil: {
    depthWriteEnabled: true,
    depthCompare: 'less',
    format: 'depth24plus-stencil8',
  },
  layout: 'auto',
})

// Allocate UBO
const uniformsData = new Float32Array(4)
const UBO = device.createBuffer({
  size: uniformsData.byteLength,
  usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
  mappedAtCreation: true,
})
// @ts-ignore
new uniformsData.constructor(UBO.getMappedRange()).set(uniformsData)
UBO.unmap()

const sampler = device.createSampler({
  addressModeU: 'clamp-to-edge',
  addressModeV: 'clamp-to-edge',
  magFilter: 'nearest',
  minFilter: 'nearest',
})

const texture = device.createTexture({
  format,
  dimension: '2d',
  size: [uniforms.texture.width, uniforms.texture.height, 1],
  usage:
    GPUTextureUsage.COPY_DST |
    GPUTextureUsage.TEXTURE_BINDING |
    GPUTextureUsage.RENDER_ATTACHMENT |
    GPUTextureUsage.COPY_SRC,
})

device.queue.copyExternalImageToTexture({ source: uniforms.texture }, { texture }, [
  uniforms.texture.width,
  uniforms.texture.height,
])

// Bind UBO, texture
const bindGroup = device.createBindGroup({
  layout: pipeline.getBindGroupLayout(0),
  entries: [
    {
      binding: 0,
      resource: {
        buffer: UBO,
      },
    },
    {
      binding: 1,
      resource: sampler,
    },
    {
      binding: 2,
      resource: texture.createView(),
    },
  ],
})

//

let depthTextureView: GPUTextureView
function handleResize(): void {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  context.configure({
    device,
    format,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
    alphaMode: 'premultiplied',
  })
  const depthTexture = device.createTexture({
    size: [canvas.width, canvas.height, 1],
    format: 'depth24plus-stencil8',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  })

  depthTextureView = depthTexture.createView()
}
window.addEventListener('resize', handleResize)
handleResize()

function animate(time: DOMHighResTimeStamp): void {
  requestAnimationFrame(animate)

  // Begin render
  const commandEncoder = device.createCommandEncoder()
  const passEncoder = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        clearValue: [1, 1, 1, 0],
        loadOp: 'clear',
        storeOp: 'store',
      },
    ],
    depthStencilAttachment: {
      view: depthTextureView,
      depthClearValue: 1,
      depthLoadOp: 'clear',
      depthStoreOp: 'store',
      stencilClearValue: 0,
      stencilLoadOp: 'clear',
      stencilStoreOp: 'store',
    },
  })

  // Configure viewport
  passEncoder.setViewport(0, 0, canvas.width, canvas.height, 0, 1)
  passEncoder.setScissorRect(0, 0, canvas.width, canvas.height)

  // Bind
  passEncoder.setPipeline(pipeline)
  passEncoder.setBindGroup(0, bindGroup)
  let slot = 0
  for (const key in attributes) {
    const buffer = buffers.get(key)!
    passEncoder.setVertexBuffer(slot++, buffer)
  }

  // Update uniforms
  uniformsData[0] = uniforms.time = time / 1000
  device.queue.writeBuffer(UBO, uniformsData.byteOffset, uniformsData)

  // Draw
  passEncoder.draw(attributes.position.data.length / attributes.position.size)

  // Cleanup frame, submit GL commands
  passEncoder.end()
  device.queue.submit([commandEncoder.finish()])
}
requestAnimationFrame(animate)
