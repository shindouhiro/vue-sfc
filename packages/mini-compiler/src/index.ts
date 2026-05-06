import { parse } from './parse'
import { compileScript } from './script'
import { compileStyle } from './style'
import { compileTemplate } from './template'

/**
 * 编译整个 Vue 单文件组件
 */
export function compileSFC(source: string, id: string): string {
  // 1. 解析
  const descriptor = parse(source)

  // 2. 编译 Script
  const scriptCode = compileScript(descriptor)

  // 3. 编译 Template
  const templateCode = compileTemplate(descriptor)

  // 4. 编译 Style (这里仅生成 CSS 字符串，实际通常由构建工具通过 plugin 注入 document.head)
  const styleCode = compileStyle(descriptor, id)

  // 5. 组合最终的模块代码
  return `
${templateCode}

${scriptCode.replace('export default', 'const __sfc_main =')}

__sfc_main.render = render
__sfc_main.__scopeId = "data-v-${id}"

/*
  最终生成的样式代码（演示用）：
  ${styleCode.replace(/\n/g, '\n  ')}
*/

export default __sfc_main
`
}

export * from './parse'
export * from './script'
export * from './style'
export * from './template'
