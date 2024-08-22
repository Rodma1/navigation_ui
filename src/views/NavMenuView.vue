<template>
    <div id = "navMenu">
        <el-container>

            <el-header style="padding: 0 0px; height: 70px; ">
                <el-menu :default-active="activeIndex" :router='true' class="el-menu-demo" mode="horizontal"
                    @select="handleSelect">
                    <el-menu-item  style= "height: 100%; line-height: 70px;" v-for="(item, index) in itemList" :index="item.path" :key="index">
                        <span slot="title">{{ item.title }}</span>
                    </el-menu-item>
                </el-menu>
            </el-header>
            <el-main>
                <!-- 在模板中使用 <router-view> 来显示组件 -->
                <router-view></router-view>
            </el-main>
        </el-container>
    </div>
</template>
  
<script>
export default {
    name: "navMenu",
    data() {
        return {
            activeIndex: 'home',
            itemList: [
                { path: '/home', title: '首页' },
                { path: '/about', title: '关于我' },
                { path: '/menu', title: '收集的网站'},
                { path: '/elasticsearch', title: 'es的基本操作'},
                { path: '/article', title: '我的文章'},
                { path: '/phrases', title: '优美句子'}
            ]
        };
    },
    watch: {
        $route() {
            this.setCurrentRoute()
        }
    },
    // computed: {
    //     toIndex() {  // 根据路径绑定到对应的一级菜单，防止页面刷新重新跳回第一个
    //         return '/' + this.$route.path.split('/')[1];
    //     },
    // },
    mounted() {
    },
    created() {
        this.setCurrentRoute()
    },
    methods: {
        handleSelect(path) {
            console.log(path);
            this.activeIndex = path
        },
        setCurrentRoute() {
            this.activeIndex = this.$route.name;//关键   通过他就可以监听到当前路由状态并激活当前菜单
        }

    }
}
</script>

<style>
.el-menu-demo {
    background-color:#ADD8E6 !important;
    border-radius: 10px;
}


</style>

<!-- 参考：https://blog.csdn.net/qq_48961214/article/details/130345936 -->