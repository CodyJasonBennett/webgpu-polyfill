import { polyfill, supported } from 'webgpu-polyfill'
import { mat4, mat3, vec3 } from 'gl-matrix'

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
  position: {
    size: 3,
    data: new Float32Array([
      0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5,
      -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
      -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5,
      0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
    ]),
  },
  normal: {
    size: 3,
    data: new Float32Array([
      1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
      -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    ]),
  },
  uv: {
    size: 2,
    data: new Float32Array([
      0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0,
      1, 0, 0, 1, 1, 1, 0, 0, 1, 0,
    ]),
  },
  index: {
    size: 1,
    data: new Uint16Array([
      0, 2, 1, 2, 3, 1, 4, 6, 5, 6, 7, 5, 8, 10, 9, 10, 11, 9, 12, 14, 13, 14, 15, 13, 16, 18, 17, 18, 19, 17, 20, 22,
      21, 22, 23, 21,
    ]),
  },
}

const uniforms = {
  projectionMatrix: mat4.create(),
  modelViewMatrix: mat4.create(),
  normalMatrix: mat3.create(),
  color: new Float32Array([1, 0.4, 0.7]),
}

const glsl = {
  vertex: `
    layout(std140) uniform Uniforms {
      mat4 projectionMatrix;
      mat4 modelViewMatrix;
      mat3 normalMatrix;
      vec3 color;
    };

    in vec3 position;
    in vec3 normal;
    out vec3 vNormal;
    out vec3 vColor;

    void main() {
      vNormal = normalMatrix * normal;
      vColor = color;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragment: `
    precision highp float;

    in vec3 vNormal;
    in vec3 vColor;
    out vec4 pc_fragColor;

    void main() {
      float lighting = dot(vNormal, normalize(vec3(10)));
      pc_fragColor = vec4(vColor + lighting * 0.1, 1.0);
    }
  `,
}

const wgsl = {
  vertex: `
    struct Uniforms {
      projectionMatrix: mat4x4<f32>,
      modelViewMatrix: mat4x4<f32>,
      normalMatrix: mat3x3<f32>,
      color: vec3<f32>,
    };
    @binding(0) @group(0) var<uniform> uniforms: Uniforms;

    struct VertexIn {
      @location(0) position: vec3<f32>,
      @location(1) normal: vec3<f32>,
    };

    struct VertexOut {
      @builtin(position) position: vec4<f32>,
      @location(0) color: vec3<f32>,
      @location(1) normal: vec3<f32>,
    };

    @vertex
    fn main(input: VertexIn) -> VertexOut {
      var out: VertexOut;
      out.position = uniforms.projectionMatrix * uniforms.modelViewMatrix * vec4(input.position, 1.0);
      out.color = uniforms.color;
      out.normal = uniforms.normalMatrix * input.normal;
      return out;
    }
  `,
  fragment: `
    struct FragmentIn {
      @location(0) color: vec3<f32>,
      @location(1) normal: vec3<f32>,
    };

    struct FragmentOut {
      @location(0) color: vec4<f32>,
    };

    @fragment
    fn main(input: FragmentIn) -> FragmentOut {
      var out: FragmentOut;
      var lighting = dot(input.normal, normalize(vec3(10.0)));
      out.color = vec4(input.color + lighting * 0.1, 1.0);
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
    usage: GPUBufferUsage.COPY_DST | (key === 'index' ? GPUBufferUsage.INDEX : GPUBufferUsage.VERTEX),
    mappedAtCreation: true,
  })
  // @ts-ignore
  new attribute.data.constructor(buffer.getMappedRange()).set(attribute.data)
  buffer.unmap()

  buffers.set(key, buffer)

  if (key !== 'index') {
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

// Pad to 16 byte chunks of 2, 4 (std140 layout)
const pad2 = (n: number): number => n + (n % 2)
const pad4 = (n: number): number => n + ((4 - (n % 4)) % 4)

// Allocate UBO
const length = pad4(
  Object.values(uniforms).reduce(
    (n: number, u) => n + (typeof u === 'number' ? 1 : u.length <= 2 ? pad2(u.length) : pad4(u.length)),
    0,
  ),
)
const uniformsData = new Float32Array(length)
const UBO = device.createBuffer({
  size: uniformsData.byteLength,
  usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
  mappedAtCreation: true,
})
// @ts-ignore
new uniformsData.constructor(UBO.getMappedRange()).set(uniformsData)
UBO.unmap()

// Bind UBO
const bindGroup = device.createBindGroup({
  layout: pipeline.getBindGroupLayout(0),
  entries: [{ binding: 0, resource: { buffer: UBO } }],
})

//

let depthTextureView: GPUTextureView
function handleResize(): void {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  mat4.perspectiveZO(uniforms.projectionMatrix, 45, canvas.width / canvas.height, 0.1, 1000)

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

const viewMatrix = mat4.create()
mat4.fromTranslation(viewMatrix, vec3.set(vec3.create(), 0, 0, 5))
mat4.invert(viewMatrix, viewMatrix)

const modelMatrix = mat4.create()

function animate(time: DOMHighResTimeStamp): void {
  requestAnimationFrame(animate)

  // Calculate modelMatrix
  mat4.identity(modelMatrix)
  mat4.rotateZ(modelMatrix, modelMatrix, time / 1500)
  mat4.rotateY(modelMatrix, modelMatrix, time / 1500)

  // Calculate normals
  mat4.copy(uniforms.modelViewMatrix, viewMatrix)
  mat4.multiply(uniforms.modelViewMatrix, uniforms.modelViewMatrix, modelMatrix)
  mat3.normalFromMat4(uniforms.normalMatrix, uniforms.modelViewMatrix)

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
    if (key === 'index') passEncoder.setIndexBuffer(buffer, 'uint16')
    else passEncoder.setVertexBuffer(slot++, buffer)
  }

  // Update uniforms
  let offset = 0
  for (const key in uniforms) {
    const uniform = uniforms[key as keyof typeof uniforms]

    if (typeof uniform === 'number') {
      uniformsData[offset] = uniform
      offset += 1 // leave empty space to stack primitives
    } else {
      const pad = uniform.length <= 2 ? pad2 : pad4
      offset = pad(offset) // fill in empty space
      uniformsData.set(uniform, offset)
      offset += pad(uniform.length)
    }
  }
  device.queue.writeBuffer(UBO, uniformsData.byteOffset, uniformsData)

  // Draw
  passEncoder.drawIndexed(attributes.index.data.length / attributes.index.size)

  // Cleanup frame, submit GL commands
  passEncoder.end()
  device.queue.submit([commandEncoder.finish()])
}
requestAnimationFrame(animate)
