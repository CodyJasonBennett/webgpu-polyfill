import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  root: !!process.argv[2] ? undefined : 'examples',
  resolve: {
    alias: {
      'webgpu-polyfill': path.resolve(process.cwd(), 'src'),
    },
  },
  test: {
    dir: 'tests',
    environment: 'jsdom',
  },
  build: {
    minify: false,
    sourcemap: true,
    target: 'esnext',
    lib: {
      formats: ['es'],
      entry: 'src/index.ts',
      fileName: '[name]',
    },
    rollupOptions: {
      external: (id) => !id.startsWith('.') && !path.isAbsolute(id),
      output: {
        preserveModules: true,
        sourcemapExcludeSources: true,
      },
    },
  },
  plugins: [
    {
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'index.d.ts', source: `export * from '../src'` })
      },
    },
  ],
})
