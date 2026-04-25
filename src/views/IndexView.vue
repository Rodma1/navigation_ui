<template>
  <div class="nav-page">
    <!-- 移动端侧边栏收起按钮 -->
    <button v-if="isMobile" class="sidebar-toggle" @click="sidebarOpen = !sidebarOpen">
      <el-icon :size="16"><component :is="sidebarOpen ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
      {{ sidebarOpen ? '收起分类' : '展开分类导航' }}
    </button>

    <aside class="nav-sidebar" :class="{ 'nav-sidebar--collapsed': isMobile && !sidebarOpen }">
      <div class="sidebar-inner">
        <div class="sidebar-title-row">
          <h3 class="sidebar-title">分类导航</h3>
          <el-button v-if="isLoggedIn" size="small" text @click="openCategoryDialog(null)">
            <el-icon><FolderAdd /></el-icon>
          </el-button>
        </div>
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
      <!-- 顶部操作栏 -->
      <div v-if="isLoggedIn" class="content-toolbar">
        <el-button type="primary" size="small" @click="openSiteDialog(null)">
          <el-icon><Plus /></el-icon> 新增网站
        </el-button>
        <el-button size="small" @click="openCategoryDialog(null)">
          <el-icon><FolderAdd /></el-icon> 新增分类
        </el-button>
      </div>

      <div v-if="filteredCategories.length === 0 && searchQuery" class="empty-tip">
        <el-icon :size="48" color="var(--color-text-muted)"><Search /></el-icon>
        <p>没有找到匹配「{{ searchQuery }}」的网站</p>
      </div>
      <CategoryContent
        v-for="category in filteredCategories"
        :key="category.id"
        :category="category"
        :show-actions="isLoggedIn"
        @add-site="openSiteDialog"
        @add-category="openCategoryDialog"
        @edit-site="openSiteDialog"
        @delete-site="handleDeleteSite"
      />
    </main>

    <!-- 网站弹窗 -->
    <SiteDialog
      v-model="siteDialogVisible"
      :edit-data="siteDialogData"
      @success="fetchCategories"
    />

    <!-- 分类弹窗 -->
    <CategoryDialog
      v-model="categoryDialogVisible"
      :parent-id="categoryDialogParentId"
      @success="fetchCategories"
    />
  </div>
</template>

<script>
import CategoryContent from '@/components/website/CategoryContent.vue'
import SiteDialog from '@/components/website/SiteDialog.vue'
import CategoryDialog from '@/components/website/CategoryDialog.vue'
import { deleteSite } from '@/api/navigate'

export default {
  components: { CategoryContent, SiteDialog, CategoryDialog },
  data() {
    return {
      sidebarOpen: false,
      isMobile: false,
      categories: [],
      defaultProps: {
        children: 'children',
        label: 'name',
      },
      // 网站弹窗
      siteDialogVisible: false,
      siteDialogData: null,
      // 分类弹窗
      categoryDialogVisible: false,
      categoryDialogParentId: null,
      // 登录状态
      isLoggedIn: false,
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
    this.checkLoginStatus()
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    checkLoginStatus() {
      this.isLoggedIn = !!localStorage.getItem('Authorization')
    },
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
        if (this.isMobile) {
          this.sidebarOpen = false
        }
      }
    },
    openSiteDialog(siteOrCategory) {
      if (siteOrCategory && siteOrCategory.url) {
        // 编辑网站
        this.siteDialogData = { ...siteOrCategory }
      } else if (siteOrCategory && siteOrCategory.id) {
        // 从分类新增，预填 categoryId
        this.siteDialogData = { categoryId: siteOrCategory.id }
      } else {
        // 全局新增
        this.siteDialogData = null
      }
      this.siteDialogVisible = true
    },
    openCategoryDialog(category) {
      this.categoryDialogParentId = category ? category.id : null
      this.categoryDialogVisible = true
    },
    handleDeleteSite(site) {
      this.$confirm(`确定删除网站「${site.name}」？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        try {
          const res = await deleteSite([site.id])
          if (res.data.code === 200) {
            this.$message.success('删除成功')
            this.fetchCategories()
          } else {
            this.$message.error(res.data.message || '删除失败')
          }
        } catch (e) {
          console.error('删除失败', e)
          this.$message.error('删除失败')
        }
      }).catch(() => {})
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

.sidebar-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border-light);
}

.sidebar-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
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

.content-toolbar {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
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
