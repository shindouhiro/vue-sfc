import { describe, expect, it } from 'vitest'
import { compileStyle } from '../src/style'
import { parse } from '../src/parse'

describe('compiler: style', () => {
  it('should compile empty style', () => {
    const descriptor = parse('<template><div></div></template>')
    expect(compileStyle(descriptor, '123')).toBe('')
  })

  it('should compile normal style', () => {
    const descriptor = parse('<style>.foo { color: red; }</style>')
    expect(compileStyle(descriptor, '123')).toContain('.foo { color: red; }')
  })

  it('should compile scoped style', () => {
    const descriptor = parse('<style scoped>.foo { color: red; }</style>')
    expect(compileStyle(descriptor, '123')).toContain('.foo[data-v-123]{ color: red; }')
  })
})
