<template>
    <div id="navMenu">
        <el-container>
            <el-header style="padding: 0; height: 70px;">
                <el-menu
                    :default-active="activeIndex"
                    :router="true"
                    class="el-menu-demo"
                    mode="horizontal"
                    @select="handleSelect"
                >
                    <!-- 动态渲染菜单项 -->
                    <el-menu-item
                        v-for="(item, index) in filteredItemList"
                        :key="index"
                        :index="item.path"
                        style="height: 100%; line-height: 70px;"
                    >
                        <span>{{ item.title }}</span>
                    </el-menu-item>

                    <div class="auth-buttons">
                        <!-- 登录按钮 -->
                        <el-button
                            v-if="!isLoggedIn"
                            type="primary"
                            class="nav-button"
                            @click="goToLogin"
                        >
                            登录
                        </el-button>

                        <!-- 登出按钮 -->
                        <el-button
                            v-if="isLoggedIn"
                            type="danger"
                            class="nav-button"
                            @click="handleLogout"
                        >
                            登出
                        </el-button>
                    </div>
                </el-menu>
            </el-header>
            <el-main>
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
                { path: '/article', title: '我的文章', requireLogin: true},
                { path: '/phrases', title: '优美句子', requireLogin: true},
                { path: '/memory', title: '备忘录', requireLogin: true}
            ],
            isLoggedIn: false,  // 登录状态
        };
    },
    watch: {
        $route() {
            this.setCurrentRoute();
        }
    },
    computed: {
        filteredItemList() {
            return this.itemList.filter(item => {
                if (item.requireLogin) {
                    return this.isLoggedIn;  // 仅在已登录状态下显示需要登录的菜单项
                }
                return true;  // 其他菜单项始终显示
            });
        }
    },
    created() {
        this.setCurrentRoute();
    },
    methods: {
        handleSelect(path) {
            this.activeIndex = path;
            this.checkLoginStatus();  // 检查用户是否已登录
        },
        setCurrentRoute() {
            this.activeIndex = this.$route.name; // 激活当前菜单
        },
        checkLoginStatus() {
            const token = localStorage.getItem('Authorization');
            this.isLoggedIn = !!token;  // 有 token 则表示已登录
        },
        goToLogin() {
            this.$router.push('/login');
        },
        handleLogout() {
            // 模拟登出逻辑，可以调用后端API
            this.axios.post('/api/user/logout')
                .then(response => {
                    const code = response.data.code;
                    if (code !== 200) {
                        this.$message.error(response.data.data);
                        return;
                    }
                    this.checkLoginStatus();  // 更新登录状态
                    this.$router.push('/home');  // 登出成功后跳转到首页
                })
                .catch(error => {
                    this.$message.error(error);
                });
        }
    }
}
</script>

<style>
.el-menu-demo {
    background-color: #ADD8E6 !important;
    border-radius: 10px;
}

/* 使用 Flexbox 来调整按钮的排列 */
.auth-buttons {
    display: flex;
    align-items: center; /* 垂直居中 */
    margin-left: auto;  /* 将按钮推到右侧 */
}

.nav-button {
    margin-left: 10px;  /* 按钮之间的间距 */
}
</style>
