import { describe, expect, it } from 'vitest'
import { compileSFC } from '../src/index'

describe('compiler: index', () => {
  it('should compile SFC to full module', () => {
    const source = `
      <template>
        <div class="test">Hello</div>
      </template>
      <script>
        export default { name: "App" }
      </script>
      <style scoped>
        .test { color: red; }
      </style>
    `
    const result = compileSFC(source, '12345')
    
    expect(result).toContain('__sfc_main.render = render')
    expect(result).toContain('__sfc_main.__scopeId = "data-v-12345"')
    expect(result).toContain('.test[data-v-12345]{ color: red; }')
    expect(result).toContain('export default __sfc_main')
  })
})
