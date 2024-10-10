import Vue from 'vue';
import VueRouter from 'vue-router';
import HomeView from '../views/HomeView.vue';
import IndexView from '../views/IndexView.vue';
import AboutView from '../views/AboutView.vue';
import NavMenuView from '../views/NavMenuView.vue';
import ElasticsearchView from '../views/ElasticsearchView.vue';
import ArticleView from "@/views/ArticleView.vue";
import PhrasesView from "@/views/PhrasesView.vue";
import MemoryView from "@/views/MemoryView.vue";
import LoginView from "@/views/LoginView.vue";  // 导入登录组件

Vue.use(VueRouter);

const routes = [
  {
    path: '/', // 程序启动默认路由
    component: NavMenuView,
    meta: { title: '整体页面布局' },
    redirect: '/home', // 重定向到首页
    children: [
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
      },
      {
        path: '/elasticsearch',
        name: 'elasticsearch',
        component: ElasticsearchView,
      },
      {
        path: '/article',
        name: 'article',
        component: ArticleView,
        meta: { requiresAuth: true } // 需要登录

      },
      {
        path: '/phrases',
        name: 'phrases',
        component: PhrasesView,
        meta: { requiresAuth: true } // 需要登录
      },
      {
        path: '/memory',
        name: 'memory',
        component: MemoryView,
        meta: { requiresAuth: true } // 需要登录
      }
    ]
  },
  {
    path: '/login', // 登录路由
    name: 'login',
    component: LoginView
  }
];

const router = new VueRouter({
  routes
});

// 路由守卫，检查登录状态
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('Authorization'); // 检查Cookie中是否有token
  console.log("测试" + token)
  if (to.matched.some(record => record.meta.requiresAuth) && !token) {
    // 如果需要登录但没有token，重定向到登录页面
    next('/login');
  } else {
    next(); // 否则继续导航
  }
});



export default router;
