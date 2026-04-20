import { createRouter, createWebHistory } from 'vue-router'

import Chat from '../components/Chat.vue'
import DocumentGenerate from '../components/DocumentGenerate.vue'
import ContractReview from '../components/ContractReview.vue'
import CaseSearch from '../components/CaseSearch.vue'
import LawsuitEvaluate from '../components/LawsuitEvaluate.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/chat'
    },
    {
      path: '/chat',
      name: 'Chat',
      component: Chat,
      meta: { title: '智能问答' }
    },
    {
      path: '/document',
      name: 'DocumentGenerate',
      component: DocumentGenerate,
      meta: { title: '文书生成' }
    },
    {
      path: '/contract',
      name: 'ContractReview',
      component: ContractReview,
      meta: { title: '合同审查' }
    },
    {
      path: '/case',
      name: 'CaseSearch',
      component: CaseSearch,
      meta: { title: '类案检索' }
    },
    {
      path: '/evaluate',
      name: 'CaseAnalysis',
      component: LawsuitEvaluate,
      meta: { title: '案件分析' }
    }
  ],
})


// 路由切换时更新页面标题
router.beforeEach((to, from) => {
  document.title = `${to.meta.title || 'AI法律助手'} - AI法律助手`
})

export default router
