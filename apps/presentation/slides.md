---
theme: seriph
background: https://cover.sli.dev
class: text-center
highlighter: shiki
lineNumbers: false
info: |
  ## Vue SFC 编译原理深度解析
  基于极简编译器的动画演示
drawings:
  persist: false
transition: slide-left
title: Vue SFC 编译原理
---

# Vue SFC 编译原理

从单文件组件到可执行的 JavaScript 模块

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-2 py-1 rounded cursor-pointer" hover="bg-white bg-opacity-10">
    开始探索 <carbon:arrow-right class="inline"/>
  </span>
</div>

---

## transition: fade-out

# 什么是 SFC？

Vue 的单文件组件 (Single-File Component) 是一种特殊的文件格式，它允许我们将模板、逻辑和样式封装在同一个文件中。

<div class="grid grid-cols-2 gap-4">
<div>

```vue
<script setup>
import { ref } from 'vue'
const msg = ref('Hello Vue SFC!')
</script>

<template>
  <div class="msg">
    {{ msg }}
  </div>
</template>

<style scoped>
.msg {
  color: red;
}
</style>
```

</div>
<div>
  <br>
  <v-click>

但是，浏览器**不认识** `.vue` 文件！

因此，我们需要 **@vue/compiler-sfc**。

  </v-click>
  <v-click>

> 核心目标：<br>
> 将一段 **字符串** 转换成浏览器可执行的 **JavaScript 模块**。

  </v-click>
</div>
</div>

---

## transition: slide-up

# Vue SFC 编译流程全景图

使用 Mermaid 绘制的完整思维导图。

```mermaid
graph TD
    A[App.vue 源字符串] --> B(1. Parse 解析)

    B -->|生成 AST / Descriptor| C{SFC Descriptor}

    C -->|提取 <script setup>| D[2. compileScript]
    C -->|提取 <template>| E[3. compileTemplate]
    C -->|提取 <style scoped>| F[4. compileStyle]

    D -->|处理宏 & 绑定导出| G[普通 setup() 函数]
    E -->|AST 转换| H[渲染函数 render]
    F -->|添加 data-v-hash| I[注入到 DOM 的 CSS]

    G --> J((5. 组装组合模块))
    H --> J
    I --> J

    J --> K[export default Component]
```

<v-click>
<div class="absolute bottom-10 right-10 opacity-70">
接下来，让我们一步步揭开这个过程的魔法...
</div>
</v-click>

---

# 1. Parse (解析阶段)

第一步，我们需要将原始的代码拆解。

````md magic-move
```vue
<template>
  <div>{{ msg }}</div>
</template>

<script setup>
const msg = 'Hello'
</script>

<style scoped>
div { color: red; }
</style>
```

```javascript
// Parse 生成的 Descriptor 描述对象
{
  template: {
    type: 'template',
    content: '\n  <div>{{ msg }}</div>\n',
    attrs: {}
  },
  scriptSetup: {
    type: 'script',
    content: '\nconst msg = "Hello"\n',
    attrs: { setup: true }
  },
  styles: [{
    type: 'style',
    content: '\ndiv { color: red; }\n',
    attrs: { scoped: true }
  }]
}
```
````

<v-click>
<div class="mt-4 opacity-80">
编译器内部通过**有限状态机**（或正则表达式）找到各个标签对，剥离出 `content` 与 `attrs`。
</div>
</v-click>

---

# 2. compileScript (编译脚本)

`<script setup>` 是一个语法糖，它需要被还原回普通的 Options API 结构。

````md magic-move
```javascript
// 提取出的 setup 块
const msg = 'Hello'
```

```javascript
// 转换后的结果
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const msg = 'Hello'

    // 编译器会自动分析哪些变量被模板使用了，并导出它们
    return { msg }
  }
})
```
````

<v-click>
在真实的编译器中，还会对 `defineProps`, `defineEmits` 等宏进行 AST 层面的提取和替换。
</v-click>

---

# 3. compileTemplate (编译模板)

这是 Vue 性能强大的关键：将 HTML 模板转换为经过优化的 `h()` 渲染函数。

````md magic-move
```html
<template>
  <div>{{ msg }}</div>
</template>
```

```javascript
// 转为虚拟 DOM 的渲染函数
import { createElementVNode as _createElementVNode, toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

export function render(_ctx, _cache) {
  return (_openBlock(), _createElementBlock("div", null, _toDisplayString(_ctx.msg), 1 /* TEXT */))
}
```
````

<v-click>
> 注意注释 `/* TEXT */`，这是 Vue3 特有的 **PatchFlag**，用于在 Diff 时跳过静态节点，实现靶向更新。
</v-click>

---

# 4. compileStyle (编译样式)

当带有 `scoped` 属性时，如何保证样式不污染全局？

````md magic-move
```css
/* 原始代码 */
div { color: red; }
```

```css
/* 编译器会自动为当前组件生成一个唯一的 ID：如 7a7a37b4 */
div[data-v-7a7a37b4] { color: red; }
```
````

<v-click>
同时，在组装阶段，组件对象上会被挂载 `__scopeId = "data-v-7a7a37b4"`。<br>
由于 Vue 的 render 函数中，DOM 节点会自动附带这个属性，从而实现 CSS 样式隔离！
</v-click>

---

# 5. 最终组装拼合

经过层层处理，碎片化的 Descriptor 最终成为一个优雅的 JavaScript 模块。

````md magic-move
```javascript
// Script 部分
const __sfc_main = defineComponent({
  setup() {
    const msg = 'Hello'
    return { msg }
  }
})
```

```javascript
// 加上 Template 和 Style 信息
const __sfc_main = defineComponent({ /* ... */ })

import { render } from './template.js'
__sfc_main.render = render

// 注入 Scope ID 用于 CSS 隔离
__sfc_main.__scopeId = "data-v-7a7a37b4"

export default __sfc_main
```
````

<v-click>
<div class="mt-10 flex justify-center items-center">
  <div class="text-3xl text-green-500 font-bold">
    至此，浏览器就可以完美运行这段代码啦！🎉
  </div>
</div>
</v-click>
