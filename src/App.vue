<template>
  <div id="app" class="app-shell">
    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition || 'page-fade'" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
    <BackToTop />
  </div>
</template>

<script>
import BackToTop from '@/components/BackToTop.vue'

export default {
  name: 'App',
  components: { BackToTop },
}
</script>

<style lang="scss">
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-body);
  transition: background-color var(--transition-base);
}
</style>
