import { describe, expect, it } from 'vitest'
import { parse } from '../src/parse'

describe('compiler: parse', () => {
  it('should parse template block', () => {
    const sfc = `<template>\n  <div>Hello World</div>\n</template>`
    const { template } = parse(sfc)

    expect(template).toBeDefined()
    expect(template?.type).toBe('template')
    expect(template?.content).toBe('\n  <div>Hello World</div>\n')
    expect(template?.attrs).toEqual({})
  })

  it('should parse script block', () => {
    const sfc = `<script>\nexport default {\n  name: 'App'\n}\n</script>`
    const { script } = parse(sfc)

    expect(script).toBeDefined()
    expect(script?.type).toBe('script')
    expect(script?.content).toBe('\nexport default {\n  name: \'App\'\n}\n')
    expect(script?.attrs).toEqual({})
  })

  it('should parse script setup block', () => {
    const sfc = `<script setup>\nimport { ref } from 'vue'\nconst count = ref(0)\n</script>`
    const { scriptSetup } = parse(sfc)

    expect(scriptSetup).toBeDefined()
    expect(scriptSetup?.type).toBe('script')
    expect(scriptSetup?.content).toBe('\nimport { ref } from \'vue\'\nconst count = ref(0)\n')
    expect(scriptSetup?.attrs).toEqual({ setup: 'true' })
  })

  it('should parse multiple style blocks', () => {
    const sfc = `
<style>
.global { color: red; }
</style>
<style scoped>
.local { color: blue; }
</style>
    `
    const { styles } = parse(sfc)

    expect(styles).toHaveLength(2)

    expect(styles[0].type).toBe('style')
    expect(styles[0].content).toBe('\n.global { color: red; }\n')
    expect(styles[0].attrs).toEqual({})

    expect(styles[1].type).toBe('style')
    expect(styles[1].content).toBe('\n.local { color: blue; }\n')
    expect(styles[1].attrs).toEqual({ scoped: 'true' })
  })

  it('should parse a complete SFC with attributes', () => {
    const sfc = `
<template id="app">
  <h1>{{ msg }}</h1>
</template>

<script setup lang="ts">
const msg = 'Vitest'
</script>

<style scoped lang="scss">
h1 { color: v-bind(color); }
</style>
    `
    const descriptor = parse(sfc)

    expect(descriptor.template?.attrs).toEqual({ id: 'app' })
    expect(descriptor.scriptSetup?.attrs).toEqual({ setup: 'true', lang: 'ts' })
    expect(descriptor.scriptSetup?.content).toBe('\nconst msg = \'Vitest\'\n')
    expect(descriptor.styles[0].attrs).toEqual({ scoped: 'true', lang: 'scss' })
  })

  it('should return null/empty for empty string', () => {
    const descriptor = parse('')

    expect(descriptor.template).toBeNull()
    expect(descriptor.script).toBeNull()
    expect(descriptor.scriptSetup).toBeNull()
    expect(descriptor.styles).toEqual([])
  })
})
