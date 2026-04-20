<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Navbar from '@/components/Navbar.vue'

const isMobileOrTablet = ref(false)

const checkDevice = () => {
  const width = window.innerWidth
  isMobileOrTablet.value = width < 1024
}

onMounted(() => {
  checkDevice()
  window.addEventListener('resize', checkDevice)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkDevice)
})
</script>

<template>
  <div id="app">
    <!-- PC端访问 -->
    <template v-if="!isMobileOrTablet">
      <Navbar />
      <router-view />
    </template>

    <!-- 手机/平板访问提示 -->
    <div v-else class="device-block">
      <div class="block-content">
        <div class="block-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
        </div>
        <h1>请使用PC端访问</h1>
        <p>本应用仅支持电脑端访问</p>
        <p>请使用电脑浏览器打开此页面</p>
        <div class="min-width-hint">
          最低屏幕宽度要求：1024px
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#app {
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  min-height: 100dvh;
  background: #f5f7fa;
  overflow-x: hidden;
  overflow-y: hidden;
}

.device-block {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1e3a5f 0%, #0f1f3d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.block-content {
  text-align: center;
  padding: 40px;
  max-width: 400px;
}

.block-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  margin-bottom: 32px;
  color: #fff;
}

.block-content h1 {
  font-size: 28px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 16px 0;
}

.block-content p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 8px 0;
  line-height: 1.6;
}

.min-width-hint {
  margin-top: 32px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  display: inline-block;
}
</style>
