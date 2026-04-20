<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import axios from 'axios'
import MarkdownIt from 'markdown-it'
import { useChatStore } from '@/stores/chat'
const chatStore = useChatStore()

const md = new MarkdownIt()
const messages = ref([])
const inputMsg = ref('')
const loading = ref(false)
const isThinking = ref(false)
const errorMessage = ref('')
const msgRef = ref(null)
const textareaRef = ref(null)
const conversationHistory = ref([])
// const sidebarCollapsed = ref(false)
const chatHistory = ref([])
const currentChatIndex = ref(0)
const showClearDialog = ref(false)

// 切换侧边栏
const toggleSidebar = () => {
  chatStore.ChangeCollapsed(!chatStore.sidebarCollapsed)
}

// API配置
const API_CONFIG = reactive({
  appkey: 'YRsdNKlaJJU5YibO0OGbYzKWwaklOKSn',
  appid: '2035707181828373248',
  apiUrl: 'https://yuanqi.tencent.com/openapi/v1/agent/chat/completions',
  stream: true
})

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (msgRef.value) {
      msgRef.value.scrollTop = msgRef.value.scrollHeight
    }
  })
}

// 文件上传相关
const fileInput = ref(null)
const uploadedFileName = ref('')
const uploadedFileContent = ref('')

// 触发文件选择
const triggerFileUpload = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = async (e) => {
  const file = e.target.files[0]
  if (file) {
    await extractFileContent(file)
  }
}

// 提取文件内容
const extractFileContent = async (file) => {
  const fileName = file.name.toLowerCase()
  uploadedFileName.value = file.name
  
  try {
    let content = ''
    
    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      content = await readTextFile(file)
    } else if (fileName.endsWith('.pdf')) {
      content = await extractPdfText(file)
    } else if (fileName.endsWith('.docx')) {
      content = await extractDocxText(file)
    } else {
      throw new Error('不支持的文件格式')
    }
    
    uploadedFileContent.value = content
    inputMsg.value = `【文件内容】${file.name}：\n${content.slice(0, 2000)}${content.length > 2000 ? '...(内容过长已截断)' : ''}`
    alert('文件内容已提取，请编辑后发送')
  } catch (error) {
    console.error('文件读取失败:', error)
    uploadedFileName.value = ''
    uploadedFileContent.value = ''
    alert(error.message || '文件读取失败')
  }
}

// 读取文本文件
const readTextFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file, 'utf-8')
  })
}

// 提取PDF文本
const extractPdfText = async (file) => {
  if (!window.pdfjsLib) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js')
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
  }
  
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map(item => item.str).join(' ')
    fullText += pageText + '\n'
  }
  
  if (!fullText.trim()) {
    throw new Error('PDF文件中未提取到文字内容，可能是扫描件')
  }
  
  return fullText
}

// 提取DOCX文本
const extractDocxText = async (file) => {
  if (!window.mammoth) {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js')
  }
  
  const arrayBuffer = await file.arrayBuffer()
  const result = await window.mammoth.extractRawText({ arrayBuffer })
  
  if (!result.value.trim()) {
    throw new Error('DOCX文件中未提取到文字内容')
  }
  
  return result.value
}

// 动态加载脚本
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = () => reject(new Error('脚本加载失败'))
    document.head.appendChild(script)
  })
}

// 初始化欢迎语
const initWelcome = () => {
  messages.value = [{
    role: 'assistant',
    content: md.render('👋 您好！我是您的AI法律助手，有任何法律问题都可以向我咨询~\n\n我可以帮您：\n- 解答劳动纠纷、合同问题等法律咨询\n- 分析案件风险和诉讼策略\n- 提供法律文书撰写建议')
  }]
}

// 示例案例数据
const sampleCases = [
  {
    title: '案例一：单方面降薪',
    content: '公司单方面邮件通知全员降薪20%并取消绩效'
  },
  {
    title: '案例二：外卖骑手封号',
    content: '全职外卖骑手被平台以违规为由封号收入断绝'
  },
  {
    title: '案例三：劳动法类案检索',
    content: '请检索劳动法领域的类案'
  }
]

// 随机使用对话案例
const useRandomCase = () => {
  const randomIndex = Math.floor(Math.random() * sampleCases.length)
  const selectedCase = sampleCases[randomIndex]
  inputMsg.value = selectedCase.content
}

// 从localStorage加载历史记录
const loadHistoryFromStorage = () => {
  try {
    const saved = localStorage.getItem('legal-ai-chat-history')
    if (saved) {
      chatHistory.value = JSON.parse(saved)
    }
  } catch (e) {
    console.error('加载历史记录失败:', e)
    chatHistory.value = []
  }
}

// 保存历史记录到localStorage
const saveHistoryToStorage = () => {
  try {
    localStorage.setItem('legal-ai-chat-history', JSON.stringify(chatHistory.value))
  } catch (e) {
    console.error('保存历史记录失败:', e)
  }
}

// 新建对话
const newChat = () => {
  // 保存当前对话到历史（如果有内容且不是欢迎语）
  const hasUserMessage = messages.value.some(m => m.role === 'user')
  if (hasUserMessage) {
    const lastUserMsg = messages.value.filter(m => m.role === 'user').pop()
    const title = lastUserMsg ? lastUserMsg.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').slice(0, 20).trim() || '新对话' : '新对话'
    
    // 如果当前是历史对话，更新历史记录
    if (currentChatIndex.value >= 0 && chatHistory.value[currentChatIndex.value]) {
      chatHistory.value[currentChatIndex.value] = {
        title,
        messages: [...messages.value]
      }
      saveHistoryToStorage()
    } else {
      // 新对话，添加到历史
      chatHistory.value.unshift({
        title,
        messages: [...messages.value]
      })
      saveHistoryToStorage()
    }
  }
  
  messages.value = []
  currentChatIndex.value = -1
  initWelcome()
  scrollToBottom()
}

// 加载历史对话
const loadChat = (index) => {
  if (index < 0 || index >= chatHistory.value.length) {
    console.error('无效的历史记录索引:', index)
    return
  }
  
  // 保存当前对话到历史
  if (currentChatIndex.value >= 0 && currentChatIndex.value < chatHistory.value.length) {
    const hasUserMessage = messages.value.some(m => m.role === 'user')
    if (hasUserMessage) {
      const lastUserMsg = messages.value.filter(m => m.role === 'user').pop()
      const title = lastUserMsg ? lastUserMsg.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').slice(0, 20).trim() || '新对话' : '新对话'
      chatHistory.value[currentChatIndex.value] = {
        title,
        messages: [...messages.value]
      }
    }
  }
  
  currentChatIndex.value = index
  messages.value = [...chatHistory.value[index].messages]
  saveHistoryToStorage()
  scrollToBottom()
}

// 清空对话
const clearChat = () => {
  showClearDialog.value = true
}

const confirmClearChat = () => {
  showClearDialog.value = false
  const welcomeMsg = [{
    role: 'assistant',
    content: md.render('👋 您好！我是您的AI法律助手，有任何法律问题都可以向我咨询~\n\n我可以帮您：\n- 解答劳动纠纷、合同问题等法律咨询\n- 分析案件风险和诉讼策略\n- 提供法律文书撰写建议')
  }]
  messages.value = welcomeMsg
  nextTick(() => {
    if (msgRef.value) {
      msgRef.value.scrollTop = msgRef.value.scrollHeight
    }
  })
}

const cancelClearChat = () => {
  showClearDialog.value = false
}

// 导出对话记录
const exportChat = () => {
  const content = messages.value.map(msg => {
    const role = msg.role === 'user' ? '【用户】' : '【AI助手】'
    const text = msg.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
    return `${role}\n${text}\n`
  }).join('\n')
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `法律咨询_${new Date().toLocaleDateString()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// 验证消息格式
const validateMessages = (msgs) => {
  if (msgs.length === 0) return { valid: true }
  
  if (msgs[0].role !== 'user') {
    return { 
      valid: false, 
      reason: `第一条消息的角色必须是'user'，当前是'${msgs[0].role}'` 
    }
  }
  
  for (let i = 1; i < msgs.length; i++) {
    if (msgs[i].role === msgs[i-1].role) {
      return { 
        valid: false, 
        reason: `第${i}条消息（角色：${msgs[i].role}）与第${i-1}条消息角色相同，违反交替规则` 
      }
    }
  }
  
  return { valid: true }
}

// 发送消息
const sendMessage = async () => {
  const content = inputMsg.value.trim()
  if (!content || loading.value) return
  
  errorMessage.value = ''
  // 加载中
  loading.value = true
  isThinking.value = true
  
  messages.value.push({ role: 'user', content: md.render(content) })
  // 滚动到底部
  scrollToBottom()
  
  const currentUserMessage = {
    role: 'user',
    content: [{ type: 'text', text: content }]
  }
  const messagesForAPI = [...conversationHistory.value, currentUserMessage]
  const validation = validateMessages(messagesForAPI)
  if (!validation.valid) {
    errorMessage.value = `消息格式验证失败: ${validation.reason}`
    resetState()
    return
  }
  
  inputMsg.value = ''
  
  try {
    const requestBody = {
      assistant_id: API_CONFIG.appid,
      user_id: `user_${Date.now()}`,
      stream: API_CONFIG.stream,
      messages: messagesForAPI
    }
    
    const response = await fetch(API_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.appkey}`
      },
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    isThinking.value = false
    
    if (API_CONFIG.stream) {
      await handleStreamResponse(response, currentUserMessage)
    } else {
      await handleNonStreamResponse(response, currentUserMessage)
    }
  } catch (error) {
    errorMessage.value = `请求失败: ${error.message}`
    console.error('API调用错误:', error)
  } finally {
    resetState()
  }
}

// 处理流式响应
const handleStreamResponse = async (response, currentUserMessage) => {
  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let assistantMessage = ''
  let messageAdded = false
  
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      
      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) continue
        
        const dataStr = line.substring(6)
        if (dataStr === '[DONE]') break
        
        try {
          const data = JSON.parse(dataStr)
          const choice = data.choices?.[0]
          
          if (choice?.delta?.content) {
            if (!messageAdded) {
              messages.value.push({ role: 'assistant', content: '' })
              messageAdded = true
            }
            
            assistantMessage += choice.delta.content
            const lastIndex = messages.value.length - 1
            messages.value[lastIndex].content = md.render(assistantMessage)
            scrollToBottom()
          }
          
          if (choice?.finish_reason === 'stop') break
        } catch (e) {
          console.warn('解析流数据失败:', e)
        }
      }
    }
    
    if (assistantMessage.trim()) {
      conversationHistory.value.push(currentUserMessage)
      conversationHistory.value.push({
        role: 'assistant',
        content: [{ type: 'text', text: assistantMessage }]
      })
    }
  } finally {
    reader.releaseLock()
  }
}

// 处理非流式响应
const handleNonStreamResponse = async (response, currentUserMessage) => {
  const data = await response.json()
  const assistantMessage = data.choices?.[0]?.message?.content
  
  if (assistantMessage) {
    messages.value.push({ role: 'assistant', content: md.render(assistantMessage) })
    conversationHistory.value.push(currentUserMessage)
    conversationHistory.value.push({
      role: 'assistant',
      content: [{ type: 'text', text: assistantMessage }]
    })
    scrollToBottom()
  } else {
    throw new Error('API返回格式异常')
  }
}

// 重置状态
const resetState = () => {
  loading.value = false
  isThinking.value = false
  
  // AI 回复完成后，自动保存到历史
  const hasUserMessage = messages.value.some(m => m.role === 'user')
  if (hasUserMessage) {
    const lastUserMsg = messages.value.filter(m => m.role === 'user').pop()
    const title = lastUserMsg ? lastUserMsg.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').slice(0, 20).trim() || '新对话' : '新对话'
    
    if (currentChatIndex.value >= 0 && chatHistory.value[currentChatIndex.value]) {
      chatHistory.value[currentChatIndex.value] = {
        title,
        messages: [...messages.value]
      }
    } else {
      chatHistory.value.unshift({
        title,
        messages: [...messages.value]
      })
      currentChatIndex.value = 0
    }
    saveHistoryToStorage()
  }
  
  if (textareaRef.value) {
    textareaRef.value.focus()
  }
}

// 初始化
onMounted(() => {
  loadHistoryFromStorage()
  initWelcome()
  scrollToBottom()
})
</script>

<template>
  <div class="chat-page">
    <!-- 清空对话确认对话框 -->
    <div v-if="showClearDialog" class="dialog-overlay" @click="cancelClearChat">
      <div class="dialog-content" @click.stop>
        <div class="dialog-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ff4d4f" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 class="dialog-title">清空对话</h3>
        <p class="dialog-message">确定要清空当前对话吗？此操作不可恢复。</p>
        <div class="dialog-actions">
          <button class="dialog-btn cancel" @click="cancelClearChat">取消</button>
          <button class="dialog-btn confirm" @click="confirmClearChat">确定清空</button>
        </div>
      </div>
    </div>

    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: chatStore.sidebarCollapsed }">
      <div class="sidebar-header">
        <button class="new-chat-btn" @click="newChat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span class="btn-text">新建对话</span>
        </button>
        <button class="collapse-btn" @click="toggleSidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline v-if="chatStore.sidebarCollapsed" points="9 18 15 12 9 6"></polyline>
            <polyline v-else points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>

      <div class="chat-history">
        <div class="history-title">历史记录</div>
        <div class="history-list">
          <div 
            v-for="(chat, index) in chatHistory" 
            :key="index"
            class="history-item"
            :class="{ active: currentChatIndex === index }"
            @click="loadChat(index)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span class="history-text">{{ chat.title || '新对话' }}</span>
          </div>
        </div>
      </div>

      <div class="sidebar-footer">
        <button class="action-btn" @click="exportChat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span class="btn-text">导出记录</span>
        </button>
        <button class="action-btn danger" @click="clearChat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          <span class="btn-text">清空对话</span>
        </button>
      </div>
    </aside>



    <!-- 遮罩层 -->
    <div v-if="!chatStore.sidebarCollapsed" class="sidebar-overlay" @click="toggleSidebar"></div>

    <!-- 移动端菜单按钮 -->
    <button class="mobile-menu-btn" @click="toggleSidebar">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>


    <!-- 主聊天区域 -->
    <main class="chat-main">
      <div class="chat-container">
        <!-- 消息列表 -->
        <div class="chat-messages" ref="msgRef">
          <div 
            v-for="(msg, idx) in messages" 
            :key="idx" 
            class="message-wrapper"
            :class="msg.role"
          >
            <div class="avatar">
              <svg v-if="msg.role === 'user'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>

              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
              
            </div>
            <!-- 气泡框 -->
            <div class="message-bubble">
              <div class="message-role">{{ msg.role === 'user' ? '' : 'AI法律助手' }}</div>

              <div class="message-content" v-html="msg.content"></div>
            </div>

          </div>
          <!-- 思考中的提示 -->
          <div v-if="isThinking" class="message-wrapper assistant">
            <div class="avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div class="message-bubble loading-bubble">
              <span class="loading-dots">
                <span></span><span></span><span></span>
              </span>
              AI正在思考中...
            </div>
          </div>

          <!-- 错误提示 -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">

          <div class="my_input_container">



<!-- 模仿的腾讯元宝输入框 -->
          <div class="input-container-box">
            <textarea
              ref="textareaRef"
              v-model="inputMsg"
              class="input-box"
              placeholder="输入您的法律问题，例如：劳动合同纠纷如何维权？"
              @keydown.enter.exact.prevent="sendMessage"
              :disabled="loading"
              rows="1"
            ></textarea>
          </div>

         <div class="send-container-box">
            <input
              type="file"
              ref="fileInput"
              @change="handleFileSelect"
              accept=".docx,.pdf,.txt,.md"
              style="display: none"
            >

            <button class="attach-btn" @click="triggerFileUpload" title="上传文件" :disabled="loading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </button>

            <button class="send-btn" @click="sendMessage" :disabled="loading || !inputMsg.trim()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>

            <button class="sample-case-btn" @click="useRandomCase">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              随机案例
            </button>
          </div>
            
          </div>
          <div class="input-hint">按 Enter 发送，Shift + Enter 换行 · 支持上传 .docx/.pdf/.txt 文件</div>
        </div>



      </div>
    </main>
  </div>
</template>



<style scoped>


.my_input_container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin: 0 auto;
    width: 60%;
    height: 100px;
    background: #f0f0f1;
    border-radius: 20px;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.input-container-box {
  width: 80%;
  height: 100%;
  border-radius: 20px;
}
.send-container-box {
  width: 20%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: right;
  gap: 12px;
  margin-bottom: 12px;
}



.chat-page {

  display: flex;
  height: calc(100vh - 60px);
  height: calc(100dvh - 60px);
  margin-top: 60px;
  background: #f5f7fa;
  overflow: hidden;
  width: 100vw;
  max-width: 100vw;
}

/* 侧边栏 */
.sidebar {
  width: 260px;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  transition: transform 0.3s ease, width 0.3s ease;
  z-index: 100;
}

.sidebar.collapsed {
  transform: translateX(-100%);
  width: 0;
  border-right: none;
}

.sidebar-overlay {
  display: none;
}

.sidebar-header {
  padding: 16px;
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.new-chat-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  min-height: 44px;
}

.new-chat-btn:hover {
  background: #2563eb;
}

.collapse-btn {
  padding: 10px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  min-height: 44px;
  min-width: 44px;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  min-height: 0;
}

.history-title {
  font-size: 12px;
  color: #9ca3af;
  padding: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  font-size: 14px;
  transition: all 0.2s;
}

.history-item:hover {
  background: #f3f4f6;
  color: #374151;
}

.history-item.active {
  background: #e0e7ff;
  color: #4f46e5;
}

.history-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f9fafb;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
}

.action-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.action-btn.danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

/* 主聊天区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  width: 100%;
  height: 100%;
  
}

.chat-container {
  flex: 1;
  width: 100%;
  max-width: 100%;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  height: 100%;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  min-height: 0;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.message-wrapper {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.message-wrapper.user {
  flex-direction: row-reverse;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-wrapper.user .avatar {
  background: #3b82f6;
  color: #fff;
}

.message-wrapper.assistant .avatar {
  background: #10b981;
  color: #fff;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  background: #f0f4f8;
  word-break: break-word;
  overflow-wrap: break-word;
  color: #333333;
}

.message-wrapper.user .message-bubble {
  background: #eaebee;
  
}

.message-role {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  opacity: 0.8;
  color: #555555;
}

.message-wrapper.user .message-role {
  text-align: right;
  color: rgba(255, 255, 255, 0.9);
}

.message-content {
  line-height: 1.7;
  font-size: 14px;
  color: #333333;
}

.message-content :deep(p) {
  margin: 0 0 8px 0;
}

.message-content :deep(p:last-child) {
  margin-bottom: 0;
}

.loading-bubble {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #666666;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  border: 1px solid #e0e4e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.loading-dots {
  display: flex;
  gap: 5px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  animation: pulse 1.4s infinite ease-in-out both;
  box-shadow: 0 0 6px rgba(102, 126, 234, 0.4);
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes pulse {
  0%, 80%, 100% { 
    transform: scale(0.6); 
    opacity: 0.5;
  }
  40% { 
    transform: scale(1); 
    opacity: 1;
  }
}

/* 错误提示 */
.error-message {
  background: #FFF2F0;
  border: 1px solid #FFCCC7;
  border-radius: 8px;
  padding: 12px 16px;
  color: #FF4D4F;
  font-size: 13px;
  margin-bottom: 12px;
}

/* 输入区域 */
.input-area {

  display: flex;
  height: 180px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  background: #fff;
  padding: 16px 0 0;
  margin-top: auto;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.attach-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.attach-btn:hover:not(:disabled) {
  background: #e5e7eb;
  color: #3b82f6;
}

.attach-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-box {
  background: #f0f0f1;
  flex: 1;
  border-radius: 20px;
  width: 100%;
  height: 100%;
  padding: 12px 16px;
  border: none;
  resize: none;
  font-size: 14px;
  line-height: 1.5;
  font-family: inherit;
  box-sizing: border-box;
  color: #333333;
}

.input-box::placeholder {
  color: #9ca3af;
}
.input-box:focus {
  outline: none;
}



.send-btn {
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 20px;
  background: #5e94ec;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 30px;
  min-height: 44px;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: #2563eb;
}

.send-btn:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.sample-case-btn {
  margin-right: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #10b981;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
  white-space: nowrap;
}

.sample-case-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

.sample-case-btn svg {
  flex-shrink: 0;
}

.input-hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 8px;
  text-align: center;
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  position: fixed;
  bottom: 24px;
  left: 24px;
  width: 56px;
  height: 56px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  cursor: pointer;
  z-index: 99;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.mobile-menu-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
}

.mobile-menu-btn:active {
  transform: scale(0.95);
}

/* 平板端适配 */
@media (max-width: 1024px) {
  .sidebar {
    width: 220px;
  }

  .sidebar.collapsed {
    transform: translateX(-100%);
    width: 0;
  }

  .chat-container {
    padding: 12px 16px 16px;
  }

  .message-bubble {
    max-width: 80%;
  }
}

/* 移动端适配 */
@media (max-width: 767px) {
  .chat-page {
    height: 100vh;
    height: calc(100dvh);
    margin-top: 0;
    width: 100vw;
    max-width: 100vw;
    position: relative;
  }

  .chat-main {
    height: 100%;
    width: 100%;
  }

  .chat-container {
    height: 100%;
    padding: 12px 12px;
    padding-bottom: calc(90px + env(safe-area-inset-bottom));
    width: 100%;
    max-width: 100%;
  }

  .chat-messages {
    flex: 1;
    padding: 12px;
    border-radius: 12px;
    min-height: 0;
    margin: 0;
    width: 100%;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    margin-top: 0;
    z-index: 200;
    transform: translateX(-100%);
    box-shadow: none;
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0);
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  }

  .sidebar.collapsed {
    transform: translateX(-100%);
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 150;
    width: 100vw;
    height: 100vh;
  }

  .message-bubble {
    max-width: 85%;
    padding: 10px 14px;
    font-size: 14px;
  }

  .avatar {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  .message-content {
    font-size: 14px;
    line-height: 1.6;
  }

  .input-area {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px;
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
    background: #fff;
    z-index: 100;
    border-top: 1px solid #e5e7eb;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    width: 100%;
  }

  .input-wrapper {
    gap: 8px;
    width: 100%;
  }

  .input-box {
    flex: 1;
    min-height: 44px;
    padding: 10px 12px;
    font-size: 16px;
  }

  .send-btn {
    padding: 10px 16px;
    min-width: 70px;
    flex-shrink: 0;
  }

  .input-hint {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
    bottom: 100px;
    left: 16px;
    z-index: 99;
  }

  .btn-text {
    display: inline;
  }

  .sidebar-header,
  .sidebar-footer {
    padding: 12px;
  }

  .collapse-btn {
    min-width: 40px;
    min-height: 40px;
  }

  .new-chat-btn {
    min-height: 40px;
  }
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dialog-content {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  width: 90%;
  max-width: 380px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.dialog-icon {
  margin-bottom: 16px;
}

.dialog-icon svg {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.dialog-title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: 600;
  color: #333333;
}

.dialog-message {
  margin: 0 0 28px;
  font-size: 14px;
  color: #666666;
  line-height: 1.6;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.dialog-btn {
  padding: 10px 28px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.dialog-btn.cancel {
  background: #f5f5f5;
  color: #666666;
}

.dialog-btn.cancel:hover {
  background: #e8e8e8;
  transform: translateY(-1px);
}

.dialog-btn.confirm {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  color: #ffffff;
}

.dialog-btn.confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.4);
}

.dialog-btn.confirm:active {
  transform: translateY(0);
}
</style>
