<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

const route = useRoute()
const menuOpen = ref(false)

const currentRoute = computed(() => route.path)

const navItems = [
  {
    name: '智能问答',
    path: '/chat',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'
  },
  {
    name: '文书生成',
    path: '/document',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'
  },
  {
    name: '合同审查',
    path: '/contract',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>'
  },
  {
    name: '类案检索',
    path: '/case',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>'
  },
  {
    name: '案件分析',
    path: '/evaluate',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'
  }
]


// 切换侧边栏
const toggleSidebar = () => {
  chatStore.ChangeCollapsed(!chatStore.sidebarCollapsed)
}

</script>

<template>
  <nav class="navbar">
    <div class="navbar-content">

        
      <!-- Logo区域 -->
      <div class="navbar-logo">
       
        <svg class="icon" :class="{isShow:!chatStore.sidebarCollapsed}" style='width: 18px ;height: 18px;cursor: pointer;' @:click="toggleSidebar" t="1776350314826"  viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5510" width="200" height="200"><path d="M444.330667 128l85.333333 85.333333H896a42.666667 42.666667 0 0 1 42.666667 42.666667v597.333333a42.666667 42.666667 0 0 1-42.666667 42.666667H128a42.666667 42.666667 0 0 1-42.666667-42.666667V170.666667a42.666667 42.666667 0 0 1 42.666667-42.666667h316.330667z m-35.328 85.333333H170.666667v597.333334h682.666666V298.666667h-358.997333l-85.333333-85.333334zM554.666667 384v170.666667h128v85.333333h-213.333334V384h85.333334z" fill="#e6e6e6" p-id="5511"></path></svg>
        <div class="logo-wrapper">
          <img 
            src="/img/logo.png" 
            alt="劳动法律AI助手" 
            class="logo-image"
          >
        </div>
        <span class="logo-text">劳动法律AI助手</span>
      </div>

      <!-- 汉堡菜单按钮（移动端） -->
      <button class="menu-toggle" @click="menuOpen = !menuOpen" :class="{ active: menuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- 导航菜单 -->
      <div class="nav-menu" :class="{ open: menuOpen }">

        <router-link 
          v-for="item in navItems" 
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: currentRoute === item.path }"
          @click="menuOpen = false"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-text">{{ item.name }}</span>
        </router-link>


        <div class="mobile-version" v-if="menuOpen">
          <span class="version-tag">v1.0</span>
        </div>
      </div>

      <!-- 右侧区域（PC端） -->
      <div class="navbar-right">
        <span class="version-tag">v1.0</span>
      </div>
    </div>
    
    <!-- 遮罩层 -->
    <div v-if="menuOpen" class="menu-overlay" @click="menuOpen = false"></div>
  </nav>
</template>



<style scoped>

.isShow {
  display: none;
}
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.navbar-content {
  width: 100%;
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1001;
}

.logo-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.logo-wrapper:hover {
  opacity: 0.85;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 汉堡菜单按钮 */
.menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 28px;
  height: 20px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
}

.menu-toggle span {
  display: block;
  width: 100%;
  height: 2px;
  background: #fff;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.menu-toggle.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.menu-toggle.active span:nth-child(2) {
  opacity: 0;
}

.menu-toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

.nav-menu {
  display: flex;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.version-tag {
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.mobile-version {
  display: none;
}

/* 遮罩层 */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* 平板端适配 */
@media (max-width: 1024px) {
  .navbar-content {
    padding: 0 16px;
  }

  .logo-text {
    font-size: 16px;
  }

  .nav-item {
    padding: 10px 14px;
    font-size: 13px;
  }

  .nav-icon {
    display: none;
  }
}

/* 移动端适配 */
@media (max-width: 767px) {
  .navbar {
    height: 56px;
  }

  .navbar-content {
    padding: 0 16px;
  }

  .navbar-logo {
    flex: 1;
    min-width: 0;
  }

  .logo-wrapper {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
  }

  .logo-text {
    font-size: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .menu-toggle {
    display: flex;
    flex-shrink: 0;
    margin-left: 12px;
  }

  .nav-menu {
    position: fixed;
    top: 0;
    right: -85%;
    width: 85%;
    height: 100vh;
    background: linear-gradient(180deg, #1e3a5f 0%, #2d5a87 100%);
    flex-direction: column;
    gap: 8px;
    padding: 70px 20px 20px;
    transition: right 0.3s ease;
    z-index: 1000;
    overflow-y: auto;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.2);
  }

  .nav-menu.open {
    right: 0;
  }

  .nav-item {
    padding: 14px 16px;
    font-size: 15px;
    border-radius: 8px;
  }

  .nav-icon {
    display: flex;
  }

  .navbar-right {
    display: none;
  }

  .mobile-version {
    display: block;
    margin-top: auto;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .menu-overlay {
    width: 100vw;
    height: 100vh;
  }
}
</style>
