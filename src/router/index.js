import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import IndexView from '../views/IndexView.vue'
import AboutView from '../views/AboutView.vue'
import NavMenuView from '../views/NavMenuView.vue'
import ElasticsearchView from '../views/ElasticsearchView.vue'
import ArticleView from "@/views/ArticleView.vue"
import PhrasesView from "@/views/PhrasesView.vue"
import MemoryView from "@/views/MemoryView.vue"
import LoginView from "@/views/LoginView.vue"
import FileUpload from '@/views/FileUpload.vue'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/',
    component: NavMenuView,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'home',
        component: HomeView,
        meta: { title: '首页' }
      },
      {
        path: 'menu',
        name: 'menu',
        component: IndexView,
        meta: { title: '导航' }
      },
      {
        path: 'about',
        name: 'about',
        component: AboutView,
        meta: { title: '关于' }
      },
      {
        path: 'elasticsearch',
        name: 'elasticsearch',
        component: ElasticsearchView,
        meta: { title: '搜索引擎' }
      },
      {
        path: 'article',
        name: 'article',
        component: ArticleView,
        meta: { title: '文章管理', requiresAuth: true }
      },
      {
        path: 'phrases',
        name: 'phrases',
        component: PhrasesView,
        meta: { title: '短语管理', requiresAuth: true }
      },
      {
        path: 'memory',
        name: 'memory',
        component: MemoryView,
        meta: { title: '记忆管理', requiresAuth: true }
      },
      {
        path: 'file-upload',
        name: 'FileUpload',
        component: FileUpload,
        meta: { title: '文件上传' }
      },
      {
        path: '/task/plan',
        name: 'taskPlan',
        component: () => import('@/views/task/PlanList.vue'),
        meta: { title: '任务计划' }
      },
      {
        path: '/task/checkin',
        name: 'taskCheckIn',
        component: () => import('@/views/task/CheckInList.vue'),
        meta: { title: '任务打卡' }
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('Authorization')
  if (to.matched.some(record => record.meta.requiresAuth) && !token) {
    ElMessage.warning('请先登录')
    next('/login')
  } else {
    next()
  }
})

export default router
