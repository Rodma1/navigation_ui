<template>
  <div id="navMenu">
    <header class="nav-header">
      <div class="nav-inner">
        <router-link to="/home" class="nav-brand">
          <img src="@/assets/logo.png" class="brand-logo" />
          <span class="brand-text">神唱导航</span>
        </router-link>

        <!-- 桌面端导航 -->
        <nav class="nav-links" v-show="!isMobile">
          <router-link
            v-for="item in topNavItems"
            :key="item.path"
            :to="item.path"
            class="nav-link"
            active-class="nav-link--active"
          >
            {{ item.title }}
          </router-link>

          <!-- 工具箱下拉 -->
          <el-dropdown trigger="hover" @command="handleDropdownCommand">
            <span class="nav-link nav-link--dropdown" :class="{ 'nav-link--active': isToolboxActive }">
              工具箱
              <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="item in toolboxItems"
                  :key="item.path"
                  :command="item.path"
                  :class="{ 'is-active': $route.path === item.path }"
                >
                  <el-icon><component :is="item.icon" /></el-icon>
                  {{ item.title }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 个人空间下拉 -->
          <el-dropdown v-if="isLoggedIn" trigger="hover" @command="handleDropdownCommand">
            <span class="nav-link nav-link--dropdown" :class="{ 'nav-link--active': isPersonalActive }">
              个人空间
              <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="item in personalItems"
                  :key="item.path"
                  :command="item.path"
                  :class="{ 'is-active': $route.path === item.path }"
                >
                  <el-icon><component :is="item.icon" /></el-icon>
                  {{ item.title }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </nav>

        <div class="nav-actions">
          <el-input
            v-model="searchQuery"
            placeholder="搜索网站..."
            class="nav-search"
            :prefix-icon="'Search'"
            size="small"
            clearable
            @keyup.enter="handleSearch"
            v-show="!isMobile"
          />
          <button class="theme-toggle" @click="toggleTheme" :aria-label="isDark ? '切换亮色' : '切换暗色'">
            <el-icon :size="18"><component :is="isDark ? 'Sunny' : 'Moon'" /></el-icon>
          </button>
          <el-button v-if="!isLoggedIn" type="primary" size="small" round @click="goToLogin">登录</el-button>
          <el-button v-if="isLoggedIn" type="danger" size="small" round @click="handleLogout">登出</el-button>
          <button v-if="isMobile" class="hamburger-btn" @click="mobileMenuOpen = true" aria-label="菜单">
            <el-icon :size="22"><Menu /></el-icon>
          </button>
        </div>
      </div>
    </header>

    <!-- 移动端抽屉菜单 -->
    <el-drawer v-model="mobileMenuOpen" direction="ltr" size="260px" :show-close="false">
      <template #header>
        <div class="drawer-brand">
          <img src="@/assets/logo.png" class="brand-logo" />
          <span class="brand-text">神唱导航</span>
        </div>
      </template>
      <div class="drawer-nav">
        <div class="drawer-group">
          <div class="drawer-group-title">导航</div>
          <router-link
            v-for="item in topNavItems"
            :key="item.path"
            :to="item.path"
            class="drawer-link"
            active-class="drawer-link--active"
            @click="mobileMenuOpen = false"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            {{ item.title }}
          </router-link>
        </div>

        <div class="drawer-group">
          <div class="drawer-group-title">工具箱</div>
          <router-link
            v-for="item in toolboxItems"
            :key="item.path"
            :to="item.path"
            class="drawer-link"
            active-class="drawer-link--active"
            @click="mobileMenuOpen = false"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            {{ item.title }}
          </router-link>
        </div>

        <div v-if="isLoggedIn" class="drawer-group">
          <div class="drawer-group-title">个人空间</div>
          <router-link
            v-for="item in personalItems"
            :key="item.path"
            :to="item.path"
            class="drawer-link"
            active-class="drawer-link--active"
            @click="mobileMenuOpen = false"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            {{ item.title }}
          </router-link>
        </div>
      </div>
      <div class="drawer-search">
        <el-input
          v-model="searchQuery"
          placeholder="搜索网站..."
          :prefix-icon="'Search'"
          clearable
          @keyup.enter="handleSearch"
        />
      </div>
    </el-drawer>

    <main class="nav-main">
      <router-view v-slot="{ Component, route }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: 'NavMenu',
  data() {
    return {
      searchQuery: '',
      isDark: false,
      isMobile: false,
      mobileMenuOpen: false,
      // 顶层核心入口
      topNavItems: [
        { path: '/home', title: '首页', icon: 'HomeFilled' },
        { path: '/menu', title: '网站导航', icon: 'Compass' },
        { path: '/about', title: '关于我', icon: 'User' },
      ],
      // 工具箱下拉
      toolboxItems: [
        { path: '/task/plan', title: '任务计划', icon: 'List' },
        { path: '/task/checkin', title: '任务打卡', icon: 'Calendar' },
        { path: '/file-upload', title: '文件上传', icon: 'Upload' },
        { path: '/elasticsearch', title: 'ES 操作', icon: 'Search' },
      ],
      // 个人空间下拉（需登录）
      personalItems: [
        { path: '/article', title: '我的文章', icon: 'Document' },
        { path: '/phrases', title: '优美句子', icon: 'ChatDotSquare' },
        { path: '/memory', title: '备忘录', icon: 'Notebook' },
      ],
      isLoggedIn: false,
    }
  },
  computed: {
    // 工具箱下拉是否高亮
    isToolboxActive() {
      return this.toolboxItems.some(item => this.$route.path === item.path)
    },
    // 个人空间下拉是否高亮
    isPersonalActive() {
      return this.personalItems.some(item => this.$route.path === item.path)
    },
  },
  watch: {
    $route() {
      this.activeIndex = this.$route.name
    },
  },
  created() {
    this.checkLoginStatus()
    this.initTheme()
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    checkLoginStatus() {
      const token = localStorage.getItem('Authorization')
      this.isLoggedIn = !!token
    },
    goToLogin() {
      this.$router.push('/login')
    },
    handleLogout() {
      this.axios
        .post('/user/logout')
        .then(response => {
          const code = response.data.code
          if (code !== 200) {
            this.$message.error(response.data.data)
            return
          }
          this.checkLoginStatus()
          this.$router.push('/home')
        })
        .catch(error => {
          this.$message.error(error)
        })
    },
    initTheme() {
      const saved = localStorage.getItem('theme')
      this.isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
      document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light')
    },
    toggleTheme() {
      this.isDark = !this.isDark
      document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light')
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
    },
    handleResize() {
      this.isMobile = window.innerWidth < 768
    },
    handleSearch() {
      this.$store.commit('SET_SEARCH_QUERY', this.searchQuery)
      if (this.$route.path !== '/menu') {
        this.$router.push('/menu')
      }
    },
    handleDropdownCommand(path) {
      this.$router.push(path)
    },
  },
}
</script>

<style lang="scss" scoped>
.nav-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border-light);
  height: 64px;
  display: flex;
  align-items: center;
  transition: background-color var(--transition-base), border-color var(--transition-base);

  :root[data-theme="dark"] & {
    background-color: rgba(15, 23, 42, 0.85);
  }
}

.nav-inner {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  text-decoration: none;
  color: var(--color-text-primary);
  flex-shrink: 0;
}

.brand-logo {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
}

.brand-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  background: linear-gradient(135deg, var(--color-primary), #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  overflow-x: auto;
  &::-webkit-scrollbar {
    display: none;
  }
}

.nav-link {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    color: var(--color-primary);
    background-color: var(--color-primary-bg);
  }

  &--active {
    color: #fff;
    background-color: var(--color-primary);
  }

  &--dropdown {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
}

.dropdown-arrow {
  font-size: 12px;
  transition: transform var(--transition-fast);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-left: auto;
  flex-shrink: 0;
}

.nav-search {
  width: 200px;

  :deep(.el-input__wrapper) {
    border-radius: var(--radius-full);
    box-shadow: none;
    border: 1px solid var(--color-border);
    background-color: var(--color-bg-body);
  }
}

.theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);

  &:hover {
    color: var(--color-primary);
    border-color: var(--color-primary);
  }
}

.hamburger-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);

  &:hover {
    color: var(--color-primary);
    border-color: var(--color-primary);
  }
}

.nav-main {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: var(--space-6);
}

// Drawer styles
.drawer-brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.drawer-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.drawer-group-title {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: var(--space-2) var(--space-4) var(--space-1);
}

.drawer-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);

  &:hover {
    color: var(--color-primary);
    background-color: var(--color-primary-bg);
  }

  &--active {
    color: var(--color-primary);
    background-color: var(--color-primary-bg);
    font-weight: var(--font-weight-medium);
  }
}

.drawer-search {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-light);
}
</style>
