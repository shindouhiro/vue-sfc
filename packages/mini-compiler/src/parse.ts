export interface SFCBlock {
  type: string
  content: string
  attrs: Record<string, string>
}

export interface SFCDescriptor {
  template: SFCBlock | null
  script: SFCBlock | null
  scriptSetup: SFCBlock | null
  styles: SFCBlock[]
}

/**
 * 极简的解析器，使用正则表达式从 SFC 字符串中提取块
 */
export function parse(source: string): SFCDescriptor {
  const descriptor: SFCDescriptor = {
    template: null,
    script: null,
    scriptSetup: null,
    styles: [],
  }

  // 匹配 <tag attr="value">content</tag>
  const blockRegex = /<(template|script|style)([^>]*)>([\s\S]*?)<\/\1>/g
  let match: RegExpExecArray | null

  // eslint-disable-next-line no-cond-assign
  while ((match = blockRegex.exec(source)) !== null) {
    const type = match[1]
    const attrsStr = match[2]
    const content = match[3]

    const attrs: Record<string, string> = {}
    const attrRegex = /([\w-]+)(?:=(?:"([^"]*)"|'([^']*)'))?/g
    let attrMatch: RegExpExecArray | null
    // eslint-disable-next-line no-cond-assign
    while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
      attrs[attrMatch[1]] = attrMatch[2] || attrMatch[3] || 'true'
    }

    const block: SFCBlock = { type, content, attrs }

    if (type === 'template') {
      descriptor.template = block
    }
    else if (type === 'script') {
      if (attrs.setup) {
        descriptor.scriptSetup = block
      }
      else {
        descriptor.script = block
      }
    }
    else if (type === 'style') {
      descriptor.styles.push(block)
    }
  }

  return descriptor
}
