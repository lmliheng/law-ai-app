<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import axios from 'axios'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()
const messages = ref([])
const inputMsg = ref('')
const loading = ref(false)
const isThinking = ref(false)
const errorMessage = ref('')
const msgRef = ref(null)
const textareaRef = ref(null)
const conversationHistory = ref([])
const chatHistory = ref([])
const currentChatIndex = ref(0)
const showClearDialog = ref(false)

const API_CONFIG = reactive({
  appkey: 'YRsdNKlaJJU5YibO0OGbYzKWwaklOKSn',
  appid: '2035707181828373248',
  apiUrl: 'https://yuanqi.tencent.com/openapi/v1/agent/chat/completions',
  stream: true
})

const scrollToBottom = () => {
  nextTick(() => {
    if (msgRef.value) {
      msgRef.value.scrollTop = msgRef.value.scrollHeight
    }
  })
}

const initWelcome = () => {
  messages.value = [{
    role: 'assistant',
    content: md.render('👋 您好！我是您的AI法律助手，有任何法律问题都可以向我咨询~\n\n我可以帮您：\n- 解答劳动纠纷、合同问题等法律咨询\n- 分析案件风险和诉讼策略\n- 提供法律文书撰写建议')
  }]
}

const loadHistoryFromStorage = () => {
  try {
    const saved = localStorage.getItem('law-ai-mobile-history')
    if (saved) {
      chatHistory.value = JSON.parse(saved)
    }
  } catch (e) {
    console.error('加载历史记录失败:', e)
    chatHistory.value = []
  }
}

const saveHistoryToStorage = () => {
  try {
    localStorage.setItem('law-ai-mobile-history', JSON.stringify(chatHistory.value))
  } catch (e) {
    console.error('保存历史记录失败:', e)
  }
}

const newChat = () => {
  const hasUserMessage = messages.value.some(m => m.role === 'user')
  if (hasUserMessage) {
    const lastUserMsg = messages.value.filter(m => m.role === 'user').pop()
    const title = lastUserMsg ? lastUserMsg.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').slice(0, 15).trim() || '新对话' : '新对话'
    
    if (currentChatIndex.value >= 0 && chatHistory.value[currentChatIndex.value]) {
      chatHistory.value[currentChatIndex.value] = {
        title,
        messages: [...messages.value]
      }
      saveHistoryToStorage()
    } else {
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

const clearChat = () => {
  showClearDialog.value = true
}

const confirmClearChat = () => {
  showClearDialog.value = false
  messages.value = [{
    role: 'assistant',
    content: md.render('👋 您好！我是您的AI法律助手，有任何法律问题都可以向我咨询~\n\n我可以帮您：\n- 解答劳动纠纷、合同问题等法律咨询\n- 分析案件风险和诉讼策略\n- 提供法律文书撰写建议')
  }]
  nextTick(() => {
    if (msgRef.value) {
      msgRef.value.scrollTop = msgRef.value.scrollHeight
    }
  })
}

const cancelClearChat = () => {
  showClearDialog.value = false
}

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

const validateMessages = (msgs) => {
  if (msgs.length === 0) return { valid: true }
  
  if (msgs[0].role !== 'user') {
    return { valid: false, reason: `第一条消息的角色必须是'user'，当前是'${msgs[0].role}'` }
  }
  
  for (let i = 1; i < msgs.length; i++) {
    if (msgs[i].role === msgs[i-1].role) {
      return { valid: false, reason: `第${i}条消息（角色：${msgs[i].role}）与第${i-1}条消息角色相同，违反交替规则` }
    }
  }
  
  return { valid: true }
}

const resetState = () => {
  loading.value = false
  isThinking.value = false
  
  const hasUserMessage = messages.value.some(m => m.role === 'user')
  if (hasUserMessage) {
    const lastUserMsg = messages.value.filter(m => m.role === 'user').pop()
    const title = lastUserMsg ? lastUserMsg.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').slice(0, 15).trim() || '新对话' : '新对话'
    
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

const sendMessage = async () => {
  const content = inputMsg.value.trim()
  if (!content || loading.value) return
  
  errorMessage.value = ''
  loading.value = true
  isThinking.value = true
  
  messages.value.push({ role: 'user', content: md.render(content) })
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

const showHistoryPanel = ref(false)

const toggleHistoryPanel = () => {
  showHistoryPanel.value = !showHistoryPanel.value
}

const loadChat = (index) => {
  if (index < 0 || index >= chatHistory.value.length) return
  
  if (currentChatIndex.value >= 0 && currentChatIndex.value < chatHistory.value.length) {
    const hasUserMessage = messages.value.some(m => m.role === 'user')
    if (hasUserMessage) {
      const lastUserMsg = messages.value.filter(m => m.role === 'user').pop()
      const title = lastUserMsg ? lastUserMsg.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').slice(0, 15).trim() || '新对话' : '新对话'
      chatHistory.value[currentChatIndex.value] = {
        title,
        messages: [...messages.value]
      }
    }
  }
  
  currentChatIndex.value = index
  messages.value = [...chatHistory.value[index].messages]
  saveHistoryToStorage()
  showHistoryPanel.value = false
  scrollToBottom()
}

onMounted(() => {
  loadHistoryFromStorage()
  initWelcome()
  scrollToBottom()
})
</script>

<template>
  <div class="chat-page">
    <!-- 对话框 -->
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

    <!-- 顶部导航 -->
    <header class="chat-header">
      <button class="header-btn" @click="toggleHistoryPanel">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <h1 class="header-title">AI法律助手</h1>
      <button class="header-btn" @click="newChat">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </header>

    <!-- 历史记录侧边栏 -->
    <div class="history-sidebar" :class="{ show: showHistoryPanel }">
      <div class="history-header">
        <h2>历史记录</h2>
        <button class="close-history" @click="showHistoryPanel = false">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="history-list">
        <div 
          v-for="(chat, index) in chatHistory" 
          :key="index"
          class="history-item"
          :class="{ active: currentChatIndex === index }"
          @click="loadChat(index)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>{{ chat.title || '新对话' }}</span>
        </div>
      </div>
    </div>

    <!-- 遮罩层 -->
    <div v-if="showHistoryPanel" class="history-overlay" @click="showHistoryPanel = false"></div>

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
      <textarea
        ref="textareaRef"
        v-model="inputMsg"
        class="input-box"
        placeholder="输入您的法律问题..."
        @keydown.enter.exact.prevent="sendMessage"
        :disabled="loading"
        rows="1"
      ></textarea>
      <button class="send-btn" @click="sendMessage" :disabled="loading || !inputMsg.trim()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>

    <!-- 底部操作栏 -->
    <div class="action-bar">
      <button class="action-btn" @click="exportChat">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span>导出</span>
      </button>
      <button class="action-btn danger" @click="clearChat">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        <span>清空</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  background: linear-gradient(180deg, #e6f0ff 0%, #f0f5ff 100%);
  position: relative;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
  z-index: 100;
}

.header-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border-radius: 8px;
  transition: background 0.2s;
}

.header-btn:active {
  background: rgba(255, 255, 255, 0.2);
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 20px;
}

.message-wrapper {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.message-wrapper.user {
  flex-direction: row-reverse;
}

.message-wrapper .avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-wrapper.assistant .avatar {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  color: white;
}

.message-wrapper.user .avatar {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  color: white;
}

.message-bubble {
  max-width: 75%;
  padding: 12px 14px;
  border-radius: 16px;
  word-break: break-word;
}

.message-wrapper.assistant .message-bubble {
  background: white;
  border: 1px solid #e8f4ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.message-wrapper.user .message-bubble {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  color: white;
}

.message-role {
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 4px;
  opacity: 0.7;
}

.message-wrapper.user .message-role {
  display: none;
}

.message-content {
  font-size: 15px;
  line-height: 1.6;
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
  gap: 10px;
  color: #666;
  background: white;
  border: 1px solid #e8f4ff;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  border-radius: 50%;
  animation: pulse 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes pulse {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.error-message {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 8px;
  padding: 12px;
  color: #ff4d4f;
  font-size: 13px;
  margin-bottom: 12px;
}

.input-area {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 12px 16px;
  background: white;
  border-top: 1px solid #e8f4ff;
}

.input-box {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d9e8ff;
  border-radius: 24px;
  font-size: 15px;
  resize: none;
  outline: none;
  background: #f5f9ff;
  max-height: 100px;
}

.input-box:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.input-box:disabled {
  background: #f5f5f5;
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
  transition: all 0.2s;
}

.send-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.send-btn:disabled {
  background: #d9e8ff;
  box-shadow: none;
}

.action-bar {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 10px 16px;
  background: white;
  border-top: 1px solid #e8f4ff;
}

.action-bar .action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  background: #f5f9ff;
  transition: all 0.2s;
}

.action-bar .action-btn:active {
  background: #e8f4ff;
}

.action-bar .action-btn.danger {
  color: #ff4d4f;
  background: #fff2f0;
}

.action-bar .action-btn.danger:active {
  background: #ffccc7;
}

.history-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100%;
  background: white;
  z-index: 200;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.history-sidebar.show {
  transform: translateX(0);
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e8f4ff;
}

.history-header h2 {
  font-size: 17px;
  color: #1f1f1f;
}

.close-history {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  border-radius: 8px;
}

.close-history:active {
  background: #f5f5f5;
}

.history-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 150;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  margin-bottom: 6px;
  color: #666;
  font-size: 14px;
  transition: all 0.2s;
}

.history-item:active {
  background: #f5f9ff;
}

.history-item.active {
  background: linear-gradient(135deg, #e6f0ff 0%, #d6ebff 100%);
  color: #1890ff;
}

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
}

.dialog-content {
  background: white;
  border-radius: 16px;
  padding: 28px;
  width: 85%;
  max-width: 340px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.dialog-icon {
  margin-bottom: 14px;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f1f1f;
  margin: 0 0 10px;
}

.dialog-message {
  font-size: 14px;
  color: #666;
  margin: 0 0 24px;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.dialog-btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.dialog-btn.cancel {
  background: #f5f5f5;
  color: #666;
}

.dialog-btn.cancel:active {
  background: #e8e8e8;
}

.dialog-btn.confirm {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  color: white;
}

.dialog-btn.confirm:active {
  opacity: 0.9;
}
</style>
