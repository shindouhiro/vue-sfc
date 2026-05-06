import type { SFCDescriptor } from './parse'

export function compileScript(descriptor: SFCDescriptor): string {
  const scriptSetup = descriptor.scriptSetup

  if (!scriptSetup) {
    return descriptor.script ? descriptor.script.content : 'export default {}'
  }

  // 极简实现：将 <script setup> 的内容包裹在一个普通的 Vue 组件对象中
  // 现实中 @vue/compiler-sfc 会进行 AST 分析，处理宏 (defineProps 等) 和绑定导出
  return `
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
${scriptSetup.content}
    // 注意：真实编译器会自动将内部声明的变量返回，暴露给模板使用
    // 我们的极简版依赖用户手动返回，或在编译后只演示原理
    return {}
  }
})
`
}
