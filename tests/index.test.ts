import { describe, expect, it } from 'vitest'
import { polyfill } from 'webgpu-polyfill'

describe('polyfill', () => {
  it('should not crash', () => {
    expect(() => polyfill()).not.toThrow()
  })
})
