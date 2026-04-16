<script setup>
import Navbar from '@/components/Navbar.vue'
</script>

<template>
  <div id="app">
    <Navbar />
    <router-view />
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
</style>
