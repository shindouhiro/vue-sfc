import { describe, expect, it } from 'vitest'
import { compileScript } from '../src/script'
import { parse } from '../src/parse'

describe('compiler: script', () => {
  it('should compile empty script if none exists', () => {
    const descriptor = parse('<template><div></div></template>')
    expect(compileScript(descriptor)).toBe('export default {}')
  })

  it('should compile standard script', () => {
    const descriptor = parse('<script>export default { name: "App" }</script>')
    expect(compileScript(descriptor)).toBe('export default { name: "App" }')
  })

  it('should compile script setup', () => {
    const descriptor = parse('<script setup>\nconst a = 1\n</script>')
    const result = compileScript(descriptor)
    expect(result).toContain('import { defineComponent } from \'vue\'')
    expect(result).toContain('const a = 1')
  })
})
