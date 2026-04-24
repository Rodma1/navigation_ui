import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import '@/styles/variables.scss'
import '@/styles/global.scss'
import 'element-plus/dist/index.css'
import '@/styles/element-overrides.scss'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from '@/utils/axios'
import JsonViewer from 'vue-json-viewer'
import JsonEditor from 'vue-jsoneditor'
import observeVisibility from '@/directives/observeVisibility'

// 抑制 ResizeObserver 循环错误（Element Plus 常见无害警告）
const debounceError = window.onerror
window.onerror = (message, source, lineno, colno, error) => {
  if (message && message.includes('ResizeObserver')) return true
  if (debounceError) return debounceError(message, source, lineno, colno, error)
  return false
}

// 创建 Vue 应用实例
const app = createApp(App)

// 注册全局属性
app.config.globalProperties.axios = axios

// 注册组件
app.use(JsonViewer)
app.use(JsonEditor)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册自定义指令
app.directive('observe', observeVisibility)

// 使用插件
app.use(ElementPlus)
app.use(store)
app.use(router)

// 挂载应用
app.mount('#app')
