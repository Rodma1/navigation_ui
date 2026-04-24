<template>
  <div class="nav-page">
    <!-- 移动端侧边栏收起按钮 -->
    <button v-if="isMobile" class="sidebar-toggle" @click="sidebarOpen = !sidebarOpen">
      <el-icon :size="16"><component :is="sidebarOpen ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
      {{ sidebarOpen ? '收起分类' : '展开分类导航' }}
    </button>

    <aside class="nav-sidebar" :class="{ 'nav-sidebar--collapsed': isMobile && !sidebarOpen }">
      <div class="sidebar-inner">
        <h3 class="sidebar-title">分类导航</h3>
        <el-tree
          :data="categories"
          :props="defaultProps"
          @node-click="handleNodeClick"
          class="category-tree"
          :highlight-current="true"
          :default-expand-all="!isMobile"
        />
      </div>
    </aside>
    <main class="nav-content">
      <div v-if="filteredCategories.length === 0 && searchQuery" class="empty-tip">
        <el-icon :size="48" color="var(--color-text-muted)"><Search /></el-icon>
        <p>没有找到匹配「{{ searchQuery }}」的网站</p>
      </div>
      <CategoryContent v-for="category in filteredCategories" :key="category.id" :category="category" />
    </main>
  </div>
</template>

<script>
import CategoryContent from '@/components/website/CategoryContent.vue'

export default {
  components: { CategoryContent },
  data() {
    return {
      activeCategory: '1',
      sidebarOpen: false,
      isMobile: false,
      categories: [
        {
          id: null,
          parentId: null,
          sort: null,
          name: '',
          icon: 'el-icon-search',
          children: [],
          delFlag: '0',
          sites: [
            {
              id: null,
              categoryId: null,
              name: '',
              image: '',
              description: '',
              url: '',
              createTime: '',
              updateTime: '',
              createBy: null,
              updateBy: null,
            },
          ],
        },
      ],
      defaultProps: {
        children: 'children',
        label: 'name',
      },
    }
  },
  computed: {
    searchQuery() {
      return this.$store.getters.searchQuery
    },
    filteredCategories() {
      const query = this.searchQuery
      if (!query) return this.categories
      return this.filterCategories(this.categories, query.toLowerCase())
    },
  },
  created() {
    this.fetchCategories()
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize() {
      this.isMobile = window.innerWidth < 900
    },
    async fetchCategories() {
      try {
        const response = await this.axios.get('/cyzNavigateCategory/tree')
        this.categories = response.data.data
      } catch (error) {
        console.error(error)
      }
    },
    handleNodeClick(data) {
      const targetElement = document.getElementById(`category-${data.id}`)
      if (targetElement) {
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        })
        // 移动端点击后收起侧边栏
        if (this.isMobile) {
          this.sidebarOpen = false
        }
      }
    },
    filterCategories(categories, query) {
      if (!categories) return []
      return categories
        .map(cat => {
          const filteredSites = (cat.sites || []).filter(
            site =>
              (site.name && site.name.toLowerCase().includes(query)) ||
              (site.description && site.description.toLowerCase().includes(query))
          )
          const filteredChildren = this.filterCategories(cat.children, query)
          if (filteredSites.length > 0 || filteredChildren.length > 0) {
            return {
              ...cat,
              sites: filteredSites,
              children: filteredChildren,
            }
          }
          return null
        })
        .filter(Boolean)
    },
  },
}
</script>

<style lang="scss" scoped>
.nav-page {
  display: flex;
  gap: var(--space-8);
  align-items: flex-start;
}

.sidebar-toggle {
  display: none;
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  align-items: center;
  justify-content: center;
  gap: var(--space-2);

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
}

.nav-sidebar {
  position: sticky;
  top: 80px;
  width: 220px;
  flex-shrink: 0;
  max-height: calc(100vh - 96px);
  overflow-y: auto;
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);

  &--collapsed {
    display: none;
  }
}

.sidebar-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 var(--space-3) 0;
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border-light);
}

.category-tree {
  background: transparent;

  --el-tree-node-hover-bg-color: var(--color-primary-bg);

  :deep(.el-tree-node__content) {
    height: 36px;
    border-radius: var(--radius-sm);
    transition: background-color var(--transition-fast), color var(--transition-fast);
  }

  :deep(.el-tree-node__expand-icon) {
    transition: transform var(--transition-base);
  }

  // 展开/收起子列表动画
  :deep(.el-tree-node__children) {
    overflow: hidden;
    transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
  }

  :deep(.el-tree-node.is-current > .el-tree-node__content) {
    background-color: var(--color-primary-bg);
    color: var(--color-primary);
    font-weight: var(--font-weight-medium);
  }

  :deep(.el-tree-node__content:hover) {
    color: var(--color-primary);
  }
}

.nav-content {
  flex: 1;
  min-width: 0;
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) var(--space-6);
  color: var(--color-text-muted);
  text-align: center;

  p {
    margin-top: var(--space-4);
    font-size: var(--font-size-lg);
  }
}

@media (max-width: 900px) {
  .nav-page {
    flex-direction: column;
  }

  .sidebar-toggle {
    display: flex;
  }

  .nav-sidebar {
    position: static;
    width: 100%;
    max-height: none;

    &--collapsed {
      display: none;
    }
  }
}
</style>
