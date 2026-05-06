# Vue SFC 编译产物解析

本文档通过实例演示 `mini-compiler` 是如何将一个 `.vue` 单文件组件转换为浏览器可运行的 JavaScript 模块的。

## 1. 原始 SFC 文件 (`App.vue`)

```vue
<template>
  <div class="container">
    <h1>Hello {{ name }}</h1>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const name = ref('Vue SFC')
</script>

<style scoped>
.container {
  padding: 20px;
}
h1 {
  color: #42b983;
}
</style>
```

## 2. 编译后的 JavaScript 代码

`compileSFC(source, '7a7a37b4')` 的输出结果如下：

```javascript
// --- [Template 编译结果] ---
import { h } from 'vue'

export function render(_ctx, _cache) {
  // 在这个极简编译器中，我们将模板转为了带有 innerHTML 的渲染函数
  return h('div', { 
    innerHTML: "<div class=\"container\">\n    <h1>Hello {{ name }}</h1>\n  </div>" 
  })
}

// --- [Script 编译结果] ---
import { defineComponent } from 'vue'

// 这里的 export default 被替换成了 const __sfc_main，以便后续进行对象增强
const __sfc_main = defineComponent({
  setup() {
    const name = ref('Vue SFC')

    // 实际编译器会在此处返回模板中引用的所有变量
    return { name }
  }
})

// --- [胶水代码 / 组合阶段] ---

// 1. 挂载渲染函数
__sfc_main.render = render

// 2. 注入 Scoped ID (对应 style 编译时生成的 hash)
__sfc_main.__scopeId = "data-v-7a7a37b4"

/*
 * [Style 编译结果] 
 * 样式代码通常由构建工具插件（如 vite:css）处理，
 * 最终会生成类似以下的选择器，并注入到页面中：
 * 
 * .container[data-v-7a7a37b4] { padding: 20px; }
 * h1[data-v-7a7a37b4] { color: #42b983; }
 */

// --- [最终导出] ---
export default __sfc_main
```

## 3. 核心原理解析

### 3.1 什么是 SFC 描述符 (Descriptor)？
解析器 (`parse.ts`) 的第一步是利用正则将文件拆解为一个对象：
- `template`: HTML 片段
- `script`: JS 代码
- `styles`: CSS 数组

### 3.2 为什么要进行“胶水”组合？
浏览器只理解普通的 JavaScript。为了让一个 JS 对象具有渲染能力，我们需要：
1. **关联 Render 函数**：通过 `__sfc_main.render = render`。
2. **样式隔离**：通过 `__scopeId` 属性，确保该组件内的 DOM 节点能匹配到带有 `[data-v-xxx]` 属性的选择器。

## 4. 延伸：`h` 函数是如何变成真实 DOM 的？

以本项目生成的代码为例：
```javascript
return h('div', { 
  innerHTML: "<div class=\"container\">...</div>" 
})
```

### 4.1 生成 VNode
`h` 函数运行后会产生一个 **VNode (虚拟节点)** 对象，它本质上是一个 JS 对象，用来描述我们想要的 DOM 结构：
```javascript
{ 
  type: 'div', 
  props: { 
    innerHTML: "<div class=\"container\">...</div>" 
  }, 
  children: null 
}
```

### 4.2 渲染器 (Renderer) 执行
当 Vue 的渲染引擎处理这个 VNode 时，它会调用底层的浏览器原生 API：
1. **创建容器**：调用 `document.createElement('div')`。
2. **处理属性**：它遍历 `props` 字典，发现有一个特殊的 `innerHTML` 键。
3. **注入内容**：它直接调用原生 DOM 方法 `el.innerHTML = vnode.props.innerHTML`。
4. **插入页面**：将创建好的 `el` 插入到真实的 DOM 树中。

### 4.3 为什么我们的编译器用 `innerHTML`？
传统的 Vue 编译器会将模板拆解成一棵完整的 VNode 树（每个标签都是一个 `h` 调用）。但我们的 `mini-compiler` 为了保持极简，将整个模板作为一个字符串处理，并利用了浏览器自带的 HTML 解析能力（即 `innerHTML`）来还原界面。这虽然损失了精细化更新（Diff）的能力，但能最直观地演示“编译”到“运行”的闭环。

---

> **注意**：本项目的编译器是一个“极简实现”用于原理教学。真实的 Vue 官方编译器 (`@vue/compiler-sfc`) 会进行复杂的 AST 分析、代码静态提升 (Hoisting) 以及 PatchFlags 标记，以实现极致的运行时性能。
