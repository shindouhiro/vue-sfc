import type { SFCDescriptor } from './parse'

export function compileStyle(descriptor: SFCDescriptor, id: string): string {
  const styles = descriptor.styles

  if (styles.length === 0) {
    return ''
  }

  // 极简实现：如果包含 scoped 属性，则为所有选择器添加属性选择器
  let css = ''

  for (const style of styles) {
    let content = style.content
    const isScoped = 'scoped' in style.attrs

    if (isScoped) {
      // 极其简易的正则替换，仅用于演示原理。现实中使用 PostCSS
      // eslint-disable-next-line regexp/no-super-linear-backtracking
      content = content.replace(
        /([^\r\n,{}]+)(,(?=[^}]*\{)|\s*\{)/g,
        (match, selector, tail) => {
        return `${selector.trim()}[data-v-${id}]${tail}`
      })
    }
    css += `${content}\\n`
  }

  return css
}
