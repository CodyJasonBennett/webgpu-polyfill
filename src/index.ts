import * as globals from './GPU'

export const supported = 'gpu' in navigator

const getContext = HTMLCanvasElement.prototype.getContext

export function polyfill(force = false): void {
  if (!force && supported) return

  // @ts-ignore
  for (const key in globals) window[key] = globals[key]
  // @ts-ignore
  navigator.gpu = new GPU()

  // @ts-ignore
  HTMLCanvasElement.prototype.getContext = function (
    this: HTMLCanvasElement,
    type: string,
    ...options: unknown[]
  ): GPUCanvasContext | unknown {
    return type === 'webgpu'
      ? Object.assign(new GPUCanvasContext(), { canvas: this })
      : getContext.bind(this)(type, ...options)
  }
}

export { globals }
