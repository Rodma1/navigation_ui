<template>
  <transition name="backtop-fade">
    <button v-show="isVisible" class="back-to-top" @click="scrollToTop" aria-label="回到顶部">
      <el-icon :size="20"><Top /></el-icon>
    </button>
  </transition>
</template>

<script>
export default {
  name: 'BackToTop',
  data() {
    return {
      isVisible: false,
      timer: null,
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll, { passive: true })
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    handleScroll() {
      if (this.timer) return
      this.timer = setTimeout(() => {
        this.isVisible = window.scrollY > 400
        this.timer = null
      }, 100)
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
  },
}
</script>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: var(--space-8);
  right: var(--space-8);
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-base);
  z-index: 99;
}

.back-to-top:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.backtop-fade-enter-active,
.backtop-fade-leave-active {
  transition: opacity var(--transition-base), transform var(--transition-base);
}

.backtop-fade-enter-from,
.backtop-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
