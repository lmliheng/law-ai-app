import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', () => {
    // 侧边栏是否折叠
    const sidebarCollapsed = ref(false)
    const ChangeCollapsed = (val) => {
        sidebarCollapsed.value = val
    }



    return { sidebarCollapsed, ChangeCollapsed }
})
