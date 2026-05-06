import { describe, expect, it } from 'vitest'
import { parse } from '../src/parse'
import { compileTemplate } from '../src/template'

describe('compiler: template', () => {
  it('should handle empty template', () => {
    const descriptor = parse('<script></script>')
    expect(compileTemplate(descriptor)).toBe('const render = () => {}')
  })

  it('should compile normal template', () => {
    const descriptor = parse('<template><div>\nHello\n</div></template>')
    const result = compileTemplate(descriptor)
    console.log({ result })
    expect(result).toContain('import { h } from \'vue\'')
    expect(result).toContain('innerHTML: "<div>\\nHello\\n</div>"')
  })
})
