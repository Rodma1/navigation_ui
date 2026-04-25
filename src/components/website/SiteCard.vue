<template>
  <div class="site-card-wrapper">
    <el-tooltip :content="site.url" placement="bottom" :show-after="800">
      <a :href="site.url" target="_blank" class="site-card" rel="noopener" :aria-label="'访问 ' + site.name">
        <div class="site-card-glow"></div>
        <div class="site-card-icon">
          <ImagePreview v-if="site.image" :src="site.image" width="40" height="40" />
          <img v-else :src="faviconUrl" class="site-favicon" @error="onFaviconError" />
        </div>
        <div class="site-card-content">
          <span class="site-card-name">{{ site.name }}</span>
          <span class="site-card-desc">{{ site.description }}</span>
        </div>
        <el-icon class="site-card-arrow"><ArrowRight /></el-icon>
      </a>
    </el-tooltip>
    <!-- 管理操作（登录后显示） -->
    <div v-if="showActions" class="site-card-actions">
      <el-button :icon="Edit" circle size="small" class="action-btn" @click.stop="$emit('edit', site)" />
      <el-button :icon="Delete" circle size="small" type="danger" class="action-btn" @click.stop="$emit('delete', site)" />
    </div>
  </div>
</template>

<script>
import ImagePreview from '@/components/ImagePreview/index.vue'
import { Edit, Delete } from '@element-plus/icons-vue'

export default {
  props: {
    site: Object,
    showActions: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    ImagePreview,
  },
  emits: ['edit', 'delete'],
  data() {
    return {
      faviconFailed: false,
      Edit,
      Delete,
    }
  },
  computed: {
    faviconUrl() {
      if (this.faviconFailed) return '/logo.png'
      try {
        const url = new URL(this.site.url)
        return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`
      } catch {
        return '/logo.png'
      }
    },
  },
  methods: {
    onFaviconError() {
      this.faviconFailed = true
    },
  },
}
</script>

<style lang="scss" scoped>
.site-card-wrapper {
  position: relative;
}

.site-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text-primary);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--color-primary);
    opacity: 0;
    transition: opacity var(--transition-fast);
  }

  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: var(--shadow-hover);
    border-color: var(--color-primary);

    &::before {
      opacity: 1;
    }

    .site-card-glow {
      opacity: 1;
    }

    .site-card-arrow {
      opacity: 1;
      transform: translateX(0);
    }

    ~ .site-card-actions {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(-1px) scale(1);
  }
}

.site-card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(79, 110, 247, 0.06) 0%, transparent 60%);
  opacity: 0;
  transition: opacity var(--transition-base);
  pointer-events: none;

  :root[data-theme="dark"] & {
    background: radial-gradient(circle at center, rgba(123, 147, 250, 0.08) 0%, transparent 60%);
  }
}

.site-card-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-body);

  :deep(.el-image) {
    border-radius: var(--radius-sm);
    box-shadow: none;
  }
}

.site-favicon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  object-fit: contain;
}

.site-card-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
  min-width: 0;
  flex: 1;
}

.site-card-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.site-card-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.site-card-arrow {
  flex-shrink: 0;
  color: var(--color-text-muted);
  opacity: 0;
  transform: translateX(-8px);
  transition: all var(--transition-base);
}

.site-card-actions {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity var(--transition-fast);
  z-index: 2;

  .site-card-wrapper:hover & {
    opacity: 1;
  }
}

.action-btn {
  width: 28px !important;
  height: 28px !important;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.85) !important;
  border: 1px solid var(--color-border-light) !important;

  :root[data-theme="dark"] & {
    background: rgba(30, 41, 59, 0.85) !important;
  }
}

@media (max-width: 480px) {
  .site-card {
    padding: var(--space-3) var(--space-4);
  }

  .site-card-icon {
    width: 32px;
    height: 32px;
  }

  .site-favicon {
    width: 20px;
    height: 20px;
  }

  .site-card-name {
    font-size: var(--font-size-xs);
  }

  .site-card-desc {
    font-size: 11px;
  }

  .site-card-arrow {
    display: none;
  }

  .site-card-actions {
    opacity: 1;
  }
}
</style>
