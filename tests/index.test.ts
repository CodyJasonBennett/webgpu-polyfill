import { describe, it, expect } from 'vitest'
import { polyfill, globals, supported } from 'webgpu-polyfill'

polyfill()

describe('polyfill', () => {
  it('should set globals', () => {
    // @ts-ignore
    for (const key in globals) expect(window[key]).toBe(globals[key])
  })

  it('should set navigator.gpu', () => {
    expect(supported).toBe(false)
    expect(navigator.gpu).toBeDefined()
  })

  it('should augment canvas#getContext', () => {
    const canvas = document.createElement('canvas')
    expect(canvas.getContext('unknown')).toBe(null)
    expect(canvas.getContext('webgpu')).toBeInstanceOf(GPUCanvasContext)
  })
})
