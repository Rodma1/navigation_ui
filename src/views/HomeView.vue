<template>
  <div class="home-page">
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-orb hero-orb--1"></div>
        <div class="hero-orb hero-orb--2"></div>
        <div class="hero-orb hero-orb--3"></div>
      </div>
      <div class="hero-content">
        <div class="hero-time">{{ currentTime }}</div>
        <img src="@/assets/logo.png" class="hero-logo" />
        <h1 class="hero-title">神的孩子都在歌唱</h1>
        <p id="typewriter" class="hero-tagline"></p>
      </div>
      <div class="hero-scroll-hint">
        <el-icon :size="24"><ArrowDown /></el-icon>
      </div>
    </section>

    <section class="quick-access">
      <h2 class="section-title">快速访问</h2>
      <div class="quick-grid">
        <router-link v-for="item in quickLinks" :key="item.path" :to="item.path" class="quick-card">
          <el-icon :size="28"><component :is="item.icon" /></el-icon>
          <span class="quick-card-label">{{ item.title }}</span>
          <span class="quick-card-desc">{{ item.desc }}</span>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script>
import TypeWriter from '@/utils/TypeWriter'
import DateUtils from '@/utils/DateUtils'

export default {
  name: 'HomeView',
  data() {
    return {
      currentTime: DateUtils.getCurrentTime(),
      quickLinks: [
        { path: '/menu', title: '网站导航', desc: '收集的优质网站', icon: 'Compass' },
        { path: '/about', title: '关于我', desc: '了解更多', icon: 'User' },
        { path: '/article', title: '我的文章', desc: '技术分享', icon: 'Document' },
        { path: '/task/plan', title: '任务计划', desc: '待办管理', icon: 'List' },
      ],
    }
  },
  methods: {
    startTypeWriter() {
      const element = document.getElementById('typewriter')
      if (!element) return
      const typeWriter = new TypeWriter(element, '人生苦短，先用python，再用java', 80)
      typeWriter.start(() => {
        setTimeout(() => {
          this.startTypeWriter()
        }, 2000)
      })
    },
    updateTime() {
      this.currentTime = DateUtils.getCurrentTime()
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.startTypeWriter()
    })
    this._timer = setInterval(this.updateTime, 1000)
  },
  beforeUnmount() {
    if (this._timer) {
      clearInterval(this._timer)
    }
  },
}
</script>

<style lang="scss" scoped>
.home-page {
  margin: calc(-1 * var(--space-6));
}

.hero {
  position: relative;
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  opacity: 0.08;
  z-index: 0;
  overflow: hidden;

  :root[data-theme="dark"] & {
    opacity: 0.12;
  }
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  animation: orbFloat 20s ease-in-out infinite;

  &--1 {
    width: 400px;
    height: 400px;
    background: rgba(79, 110, 247, 0.3);
    top: 10%;
    left: 15%;
    animation-delay: 0s;
  }

  &--2 {
    width: 300px;
    height: 300px;
    background: rgba(124, 58, 237, 0.25);
    top: 50%;
    right: 10%;
    animation-delay: -7s;
    animation-duration: 25s;
  }

  &--3 {
    width: 250px;
    height: 250px;
    background: rgba(240, 147, 251, 0.2);
    bottom: 10%;
    left: 40%;
    animation-delay: -14s;
    animation-duration: 22s;
  }

  :root[data-theme="dark"] & {
    opacity: 0.4;

    &--1 { background: rgba(123, 147, 250, 0.25); }
    &--2 { background: rgba(139, 92, 246, 0.2); }
    &--3 { background: rgba(240, 147, 251, 0.15); }
  }
}

@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -40px) scale(1.1); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(15px, 30px) scale(1.05); }
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  animation: heroFadeIn 0.8s ease-out;
}

@keyframes heroFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-time {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
  font-variant-numeric: tabular-nums;
}

.hero-logo {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  margin-bottom: var(--space-8);
  transition: transform var(--transition-spring);

  &:hover {
    transform: scale(1.08) rotate(-3deg);
  }
}

.hero-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  background: linear-gradient(135deg, var(--color-primary), #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--space-4);
}

.hero-tagline {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  min-height: 28px;
  font-family: 'Courier New', Courier, monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.hero-scroll-hint {
  position: absolute;
  bottom: var(--space-8);
  color: var(--color-text-muted);
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.quick-access {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-16) var(--space-6);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  text-align: center;
  margin-bottom: var(--space-8);
  color: var(--color-text-primary);
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-6);
}

.quick-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-8) var(--space-6);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--color-text-primary);
  transition: all var(--transition-base);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-hover);
    border-color: var(--color-primary);
  }
}

.quick-card-label {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.quick-card-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

@media (max-width: 600px) {
  .hero {
    min-height: calc(100vh - 64px);
    padding: var(--space-8) var(--space-4);
  }

  .hero-time {
    font-size: var(--font-size-lg);
  }

  .hero-logo {
    width: 80px;
    height: 80px;
  }

  .hero-title {
    font-size: var(--font-size-xl);
  }

  .hero-tagline {
    font-size: var(--font-size-base);
  }

  .quick-access {
    padding: var(--space-8) var(--space-4);
  }

  .quick-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }

  .quick-card {
    padding: var(--space-5) var(--space-4);
  }

  .quick-card-label {
    font-size: var(--font-size-base);
  }

  .quick-card-desc {
    font-size: var(--font-size-xs);
  }
}
</style>
