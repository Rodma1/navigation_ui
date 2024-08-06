import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import IndexView from '../views/IndexView.vue'
import AboutView from '../views/AboutView.vue'
import NavMenuView from '../views/NavMenuView.vue'
import ElasticsearchView from '../views/ElasticsearchView.vue'
import ArticleView from "@/views/ArticleView.vue";
// import { component } from 'vue/types/umd'
Vue.use(VueRouter)

const routes = [
  {
    path:'/',// 程序启动默认路由
    component: NavMenuView,
    meta: {title: '整体页面布局'},
    redirect: '/home',// 重定向到首页
    children:[
      {
        path: '/home',
        name: 'home',
        component: HomeView
      },
      {
        path: '/menu',
        name: 'menu',
        component: IndexView
      },
      {
        path: '/about',
        name: 'about',
        component: AboutView
      }, {
        path: '/elasticsearch',
        name: 'elasticsearch',
        component: ElasticsearchView,
        children:[
          {
            path: '/home',
            name: 'home',
            component: HomeView
          }
        ]
      },
      {
        path: '/article',
        name: 'article',
        component: ArticleView
      },
    
    ]
  }
 
]

const router = new VueRouter({
  routes
})

export default router
