import type { SFCDescriptor } from './parse'

export function compileTemplate(descriptor: SFCDescriptor): string {
  const template = descriptor.template

  if (!template) {
    return 'const render = () => {}'
  }

  // 极简实现：直接将模板字符串转为字符串形式的渲染函数
  // 现实中 @vue/compiler-dom 会将其转为 AST，再生成 createElementVNode 等代码
  // 为了演示原理，我们将模板字符串作为普通的 JS 字符串返回，或者使用简单的正则转换

  const content = template.content.trim().replace(/"/g, '\\"').replace(/\n/g, '\\n')

  return `
import { h } from 'vue'
export function render(_ctx, _cache) {
  // 这里演示极简原理，现实中会生成对应的 VNode 树
  return h('div', { innerHTML: "${content}" })
}
`
}
