import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from '@/utils/axios'
import JsonViewer from 'vue-json-viewer'
import JsonEditor from 'vue-jsoneditor'

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

// 使用插件
app.use(ElementPlus)
app.use(store)
app.use(router)

// 挂载应用
app.mount('#app')
