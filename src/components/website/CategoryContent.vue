<template>
  <div v-observe class="category-section" :class="'category-level-' + level" :id="'category-' + category.id">
    <div class="category-header" :class="{ 'category-header--sub': level >= 2, 'category-header--deep': level >= 3 }">
      <div v-if="level <= 2" class="category-indicator"></div>
      <span v-if="level >= 3" class="category-dot"></span>
      <h2 class="category-name" :class="{ 'category-name--sub': level >= 3 }">{{ category.name }}</h2>
      <span class="category-count">{{ (category.sites && category.sites.length) || 0 }} 个网站</span>
      <div v-if="showActions" class="category-actions">
        <el-button size="small" text @click="$emit('add-site', category)">
          <el-icon><Plus /></el-icon> 新增网站
        </el-button>
        <el-button size="small" text @click="$emit('add-category', category)">
          <el-icon><FolderAdd /></el-icon> 新增子分类
        </el-button>
      </div>
    </div>

    <div class="category-grid">
      <SiteCard
        v-for="site in category.sites"
        :key="site.id"
        :site="site"
        :show-actions="showActions"
        @edit="$emit('edit-site', $event)"
        @delete="$emit('delete-site', $event)"
      />
    </div>

    <div v-if="category.children && category.children.length" class="category-children" :class="{ 'category-children--deep': level >= 2 }">
      <CategoryContent
        v-for="child in category.children"
        :key="child.id"
        :category="child"
        :level="level + 1"
        :show-actions="showActions"
        @add-site="$emit('add-site', $event)"
        @add-category="$emit('add-category', $event)"
        @edit-site="$emit('edit-site', $event)"
        @delete-site="$emit('delete-site', $event)"
      />
    </div>
  </div>
</template>

<script>
import SiteCard from '@/components/website/SiteCard.vue'

export default {
  name: 'CategoryContent',
  props: {
    category: Object,
    level: {
      type: Number,
      default: 1,
    },
    showActions: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    SiteCard,
    CategoryContent: this,
  },
  emits: ['add-site', 'add-category', 'edit-site', 'delete-site'],
}
</script>

<style lang="scss" scoped>
.category-section {
  margin-bottom: var(--space-10);
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);

  &.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
}

.category-level-3,
.category-level-4,
.category-level-5 {
  background: var(--color-primary-bg);
  border-radius: var(--radius-md);
  padding: var(--space-4) var(--space-5);
  margin-bottom: var(--space-6);
}

.category-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border-light);
  flex-wrap: wrap;

  &--sub {
    margin-bottom: var(--space-4);
    padding-bottom: var(--space-2);
  }

  &--deep {
    border-bottom: 1px dashed var(--color-border);
  }
}

.category-indicator {
  width: 4px;
  height: 24px;
  border-radius: var(--radius-full);
  background: linear-gradient(180deg, var(--color-primary), #7c3aed);
  flex-shrink: 0;
}

.category-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  flex-shrink: 0;
  opacity: 0.6;
}

.category-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;

  &--sub {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
  }
}

.category-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  background: var(--color-primary-bg);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.category-actions {
  display: flex;
  gap: var(--space-1);
  margin-left: auto;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-4);
}

.category-children {
  margin-left: var(--space-6);
  padding-left: var(--space-4);
  border-left: 2px solid var(--color-border-light);
}

.category-children--deep {
  margin-left: 0;
  padding-left: 0;
  border-left: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

@media (max-width: 480px) {
  .category-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .category-children {
    margin-left: var(--space-3);
    padding-left: var(--space-3);
  }

  .category-level-3,
  .category-level-4,
  .category-level-5 {
    padding: var(--space-3);
  }

  .category-name {
    font-size: var(--font-size-base);
  }

  .category-name--sub {
    font-size: var(--font-size-sm);
  }

  .category-actions {
    width: 100%;
    margin-left: 0;
    margin-top: var(--space-2);
  }
}
</style>
