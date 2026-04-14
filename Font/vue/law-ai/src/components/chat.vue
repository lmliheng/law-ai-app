<template>
  <div class="app-container">
    <div class="neumorphic-container">
      <!-- 头部保持不变 -->
      <header class="neumorphic-header">
        <div class="logo-section">
          <div class="logo neumorphic-logo">元</div>
          <div class="header-text">
            <h1>Law By AI</h1>
            <p>基于元器 API 构建 · 支持 Markdown</p>
          </div>
        </div>
        <div class="status-badge neumorphic-status">
          <div class="status-dot"></div>
          <span>在线</span>
        </div>
      </header>

      <!-- 聊天区域 -->
      <main class="chat-container neumorphic-chat" ref="chatContainer">
        <div 
          v-for="(msg, index) in messages" 
          :key="index"
          :class="['message', `${msg.role}-message`]"
        >
          <div :class="['avatar', `${msg.role}-avatar`, 'neumorphic-avatar']">
            {{ msg.role === 'user' ? '我' : '元' }}
          </div>
          <div 
            :class="['message-content', 'neumorphic-message', 'markdown-body']"
            :style="msg.role === 'user' ? userMessageStyle : assistantMessageStyle"
            v-html="renderMarkdown(msg.content)"
          ></div>
        </div>

        <!-- 思考状态 -->
        <div v-if="isThinking" class="thinking neumorphic-thinking">
          <div class="avatar assistant-avatar neumorphic-avatar">元</div>
          <div class="thinking-dots">
            <div class="thinking-dot" v-for="i in 3" :key="i"></div>
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="errorMessage" class="error neumorphic-error">
          {{ errorMessage }}
        </div>
      </main>

      <!-- 输入区域 -->
      <footer class="input-area">
        <div class="input-wrapper neumorphic-input-wrapper">
          <textarea
            v-model="userInput"
            @input="autoResize"
            @keydown.enter.prevent="handleSend"
            placeholder="支持 Markdown 格式，如 **加粗**、*斜体*、`代码`"
            rows="1"
            ref="textareaRef"
          ></textarea>
          <button 
            @click="handleSend"
            :disabled="!userInput.trim() || isLoading"
            class="send-button neumorphic-button"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>

        <div class="input-hints">
          <div 
            v-for="(hint, index) in hints" 
            :key="index"
            @click="setExample(hint)"
            class="hint-item neumorphic-hint"
          >
            {{ hint }}
          </div>
        </div>
        
      
      </footer>

      <!-- 配置信息 -->
      <div class="config-panel neumorphic-config">
        <div class="config-info">
          <span class="config-label">状态：</span>
          <span class="config-value neumorphic-value">{{ apiStatus }}</span>
          <span class="config-label">智能体ID：</span>
          <span class="config-value neumorphic-value">{{ assistantId }}</span>
          <span class="config-label">流式响应：</span>
          <span class="config-value neumorphic-value">{{ streamEnabled ? '已启用' : '未启用' }}</span>
          <span class="config-label">Markdown：</span>
          <span class="config-value neumorphic-value">已启用</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

// API配置
const API_CONFIG = reactive({
  appkey: 'YRsdNKlaJJU5YibO0OGbYzKWwaklOKSn',
  appid: '2035707181828373248',
  apiUrl: 'https://yuanqi.tencent.com/openapi/v1/agent/chat/completions',
  stream: true
})

// 响应式数据
const userInput = ref('')
const messages = ref([])
const conversationHistory = ref([])
const isLoading = ref(false)
const isThinking = ref(false)
const errorMessage = ref('')
const apiStatus = ref('就绪')
const chatContainer = ref(null)
const textareaRef = ref(null)

// 计算属性
const assistantId = computed(() => API_CONFIG.appid)
const streamEnabled = computed(() => API_CONFIG.stream)

// 拟态风格样式
const userMessageStyle = {
  background: '#006EFF',
  color: 'white',
  borderRadius: '18px 18px 4px 18px'
}

const assistantMessageStyle = {
  background: '#F0F0F3',
  color: '#333',
  borderRadius: '18px 18px 18px 4px'
}

// Markdown 工具栏配置
const markdownTools = [
  { name: 'bold', icon: '<strong>B</strong>', prefix: '**', suffix: '**', title: '加粗' },
  { name: 'italic', icon: '<em>I</em>', prefix: '*', suffix: '*', title: '斜体' },
  { name: 'code', icon: '&lt;/&gt;', prefix: '`', suffix: '`', title: '行内代码' },
  { name: 'link', icon: '🔗', prefix: '[', suffix: '](url)', title: '链接' },
  { name: 'list', icon: '•', prefix: '- ', suffix: '', title: '无序列表' },
  { name: 'quote', icon: '❝', prefix: '> ', suffix: '', title: '引用' },
  { name: 'heading', icon: 'H1', prefix: '## ', suffix: '', title: '标题' }
]

// 提示词
const hints = [
  '说一说劳动法',
  '老板拖欠工资',
  '中通通讯 王鹏劳务合同纠纷案 的类案'
]

// 初始化欢迎消息
onMounted(() => {
  messages.value.push({
    role: 'assistant',
    content: `您好！我是基于腾讯元器平台的智能助手，可以为您解答各种法律问题。有什么我可以帮您的吗？`
  })
})

// 配置 marked
marked.setOptions({
  gfm: true,
  breaks: true,
  highlight: function(code, lang) {
    // 这里可以添加代码高亮
    return code
  }
})

// 渲染 Markdown
const renderMarkdown = (content) => {
  if (!content) return ''
  const rawHtml = marked(content)
  return DOMPurify.sanitize(rawHtml)
}

// 插入 Markdown 语法
const insertMarkdown = (prefix, suffix) => {
  const textarea = textareaRef.value
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = userInput.value.substring(start, end)
  const beforeText = userInput.value.substring(0, start)
  const afterText = userInput.value.substring(end)
  
  if (selectedText) {
    userInput.value = beforeText + prefix + selectedText + suffix + afterText
    // 设置光标位置
    nextTick(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      )
    })
  } else {
    userInput.value = beforeText + prefix + suffix + afterText
    // 设置光标位置在中间
    nextTick(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length
      )
    })
  }
  
  autoResize()
}

// 自动调整输入框高度
const autoResize = () => {
  const textarea = textareaRef.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px'
  }
}

// 设置示例问题
const setExample = (text) => {
  userInput.value = text
  nextTick(() => {
    autoResize()
    textareaRef.value?.focus()
  })
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

// 验证消息格式
const validateMessages = (messages) => {
  if (messages.length === 0) return { valid: true }
  
  if (messages[0].role !== 'user') {
    return { 
      valid: false, 
      reason: `第一条消息的角色必须是'user'，当前是'${messages[0].role}'` 
    }
  }
  
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].role === messages[i-1].role) {
      return { 
        valid: false, 
        reason: `第${i}条消息（角色：${messages[i].role}）与第${i-1}条消息角色相同，违反交替规则` 
      }
    }
  }
  
  return { valid: true }
}

// 发送消息
const handleSend = async () => {
  const message = userInput.value.trim()
  if (!message || isLoading.value) return
  
  errorMessage.value = ''
  isLoading.value = true
  isThinking.value = true
  apiStatus.value = '请求中...'
  
  messages.value.push({ role: 'user', content: message })
  scrollToBottom()
  
  const currentUserMessage = {
    role: 'user',
    content: [{ type: 'text', text: message }]
  }
  
  const messagesForAPI = [...conversationHistory.value, currentUserMessage]
  
  const validation = validateMessages(messagesForAPI)
  if (!validation.valid) {
    errorMessage.value = `消息格式验证失败: ${validation.reason}`
    resetState()
    return
  }
  
  userInput.value = ''
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
  
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
    
    apiStatus.value = '就绪'
  } catch (error) {
    errorMessage.value = `请求失败: ${error.message}`
    apiStatus.value = '错误'
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
            messages.value[lastIndex].content = assistantMessage
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
    messages.value.push({ role: 'assistant', content: assistantMessage })
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
  isLoading.value = false
  isThinking.value = false
  if (textareaRef.value) {
    textareaRef.value.focus()
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #006EFF;
  --primary-light: #E6F2FF;
  --bg-main: #F0F0F3;
  --shadow-light: #FFFFFF;
  --shadow-dark: #D1D9E6;
  --text-primary: #333;
  --text-secondary: #666;
  --radius: 16px;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: var(--bg-main);
  min-height: 100vh;
  padding: 20px;
  color: var(--text-primary);
}

/* 拟态风格基础样式 */
.neumorphic-container {
  max-width: 900px;
  margin: 0 auto;
  background: var(--bg-main);
  border-radius: 24px;
  box-shadow: 
    12px 12px 24px var(--shadow-dark),
    -12px -12px 24px var(--shadow-light);
  overflow: hidden;
  height: 90vh;
  display: flex;
  flex-direction: column;
}

/* 头部 */
.neumorphic-header {
  background: var(--bg-main);
  padding: 20px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 
    inset 0 -2px 4px rgba(209, 217, 230, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.8);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.neumorphic-logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--bg-main);
  box-shadow: 
    4px 4px 8px var(--shadow-dark),
    -4px -4px 8px var(--shadow-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 22px;
  color: var(--primary);
}

.header-text h1 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.header-text p {
  font-size: 13px;
  color: var(--text-secondary);
}

.neumorphic-status {
  padding: 8px 16px;
  border-radius: 20px;
  background: #F6FFED;
  border: 1px solid #B7EB8F;
  font-size: 12px;
  color: #52C41A;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #52C41A;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 聊天区域 */
.neumorphic-chat {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  background: var(--bg-main);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 85%;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.neumorphic-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: 500;
  background: var(--bg-main);
}

.user-avatar {
  box-shadow: 
    3px 3px 6px var(--shadow-dark),
    -3px -3px 6px var(--shadow-light);
  color: white;
  background: var(--primary);
}

.assistant-avatar {
  box-shadow: 
    3px 3px 6px var(--shadow-dark),
    -3px -3px 6px var(--shadow-light);
  color: white;
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.neumorphic-message {
  padding: 16px 20px;
  line-height: 1.6;
  font-size: 14px;
  box-shadow: 
    4px 4px 8px var(--shadow-dark),
    -4px -4px 8px var(--shadow-light);
}

/* Markdown 样式 */
.markdown-body {
  font-size: 14px;
  line-height: 1.6;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4 {
  margin: 1em 0 0.5em;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body h1 { font-size: 1.5em; }
.markdown-body h2 { font-size: 1.3em; }
.markdown-body h3 { font-size: 1.1em; }

.markdown-body p {
  margin: 0.5em 0;
}

.markdown-body ul,
.markdown-body ol {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.markdown-body li {
  margin: 0.25em 0;
}

.markdown-body blockquote {
  margin: 0.5em 0;
  padding: 0.5em 1em;
  border-left: 4px solid var(--primary);
  background: rgba(0, 110, 255, 0.05);
  border-radius: 0 8px 8px 0;
}

.markdown-body code {
  font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  background: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
}

.markdown-body pre {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0.5em 0;
}

.markdown-body pre code {
  background: transparent;
  padding: 0;
  color: inherit;
}

.markdown-body a {
  color: var(--primary);
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}

.markdown-body table {
  border-collapse: collapse;
  margin: 0.5em 0;
  width: 100%;
}

.markdown-body th,
.markdown-body td {
  border: 1px solid var(--shadow-dark);
  padding: 0.5em;
  text-align: left;
}

.markdown-body th {
  background: rgba(0, 110, 255, 0.1);
}

/* 输入区域 */
.input-area {
  padding: 20px 32px;
  background: var(--bg-main);
  box-shadow: 
    inset 0 2px 4px rgba(209, 217, 230, 0.3),
    inset 0 -2px 4px rgba(255, 255, 255, 0.8);
}

.neumorphic-input-wrapper {
  display: flex;
  gap: 12px;
  background: var(--bg-main);
  border-radius: 24px;
  padding: 8px 8px 8px 20px;
  box-shadow: 
    inset 4px 4px 8px var(--shadow-dark),
    inset -4px -4px 8px var(--shadow-light);
}

.neumorphic-input-wrapper textarea {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  line-height: 20px;
  outline: none;
  resize: none;
  min-height: 20px;
  max-height: 100px;
  padding: 4px 0;
  font-family: inherit;
  color: var(--text-primary);
}

.neumorphic-input-wrapper textarea::placeholder {
  color: #999;
}

.neumorphic-button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: var(--primary);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    4px 4px 8px var(--shadow-dark),
    -2px -2px 4px rgba(255, 255, 255, 0.5);
}

.neumorphic-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 
    6px 6px 12px var(--shadow-dark),
    -3px -3px 6px rgba(255, 255, 255, 0.5);
}

.neumorphic-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.neumorphic-button svg {
  width: 20px;
  height: 20px;
}

/* Markdown 工具栏 */
.markdown-toolbar {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding: 8px;
  background: var(--bg-main);
  border-radius: 12px;
  box-shadow: 
    inset 2px 2px 4px var(--shadow-dark),
    inset -2px -2px 4px var(--shadow-light);
}

.neumorphic-tool-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: var(--bg-main);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--text-secondary);
  box-shadow: 
    2px 2px 4px var(--shadow-dark),
    -2px -2px 4px var(--shadow-light);
  transition: all 0.2s;
}

.neumorphic-tool-btn:hover {
  color: var(--primary);
  box-shadow: 
    inset 2px 2px 4px var(--shadow-dark),
    inset -2px -2px 4px var(--shadow-light);
}

/* 提示词 */
.input-hints {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.neumorphic-hint {
  padding: 8px 14px;
  border-radius: 16px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  background: var(--bg-main);
  box-shadow: 
    3px 3px 6px var(--shadow-dark),
    -3px -3px 6px var(--shadow-light);
  transition: all 0.2s;
}

.neumorphic-hint:hover {
  color: var(--primary);
  box-shadow: 
    inset 2px 2px 4px var(--shadow-dark),
    inset -2px -2px 4px var(--shadow-light);
}

/* 思考状态 */
.neumorphic-thinking {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: var(--bg-main);
  border-radius: 18px 18px 18px 4px;
  align-self: flex-start;
  box-shadow: 
    4px 4px 8px var(--shadow-dark),
    -4px -4px 8px var(--shadow-light);
}

.thinking-dots {
  display: flex;
  gap: 6px;
}

.thinking-dot {
  width: 8px;
  height: 8px;
  background: var(--primary);
  border-radius: 50%;
  opacity: 0.6;
}

.thinking-dot:nth-child(1) { animation: bounce 1.4s infinite; }
.thinking-dot:nth-child(2) { animation: bounce 1.4s infinite 0.2s; }
.thinking-dot:nth-child(3) { animation: bounce 1.4s infinite 0.4s; }

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
  30% { transform: translateY(-6px); opacity: 1; }
}

/* 配置面板 */
.neumorphic-config {
  background: var(--bg-main);
  padding: 16px 32px;
  box-shadow: 
    inset 0 2px 4px rgba(209, 217, 230, 0.3),
    inset 0 -2px 4px rgba(255, 255, 255, 0.8);
}

.config-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.config-label {
  font-weight: 500;
}

.neumorphic-value {
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--bg-main);
  font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  font-size: 11px;
  box-shadow: 
    inset 2px 2px 4px var(--shadow-dark),
    inset -2px -2px 4px var(--shadow-light);
}

/* 错误提示 */
.neumorphic-error {
  background: #FFF2F0;
  border: 1px solid #FFCCC7;
  border-radius: var(--radius);
  padding: 12px 16px;
  color: #FF4D4F;
  font-size: 13px;
  margin-bottom: 12px;
  box-shadow: 
    4px 4px 8px rgba(255, 77, 79, 0.1);
}

/* 滚动条 */
.neumorphic-chat::-webkit-scrollbar {
  width: 6px;
}

.neumorphic-chat::-webkit-scrollbar-track {
  background: transparent;
}

.neumorphic-chat::-webkit-scrollbar-thumb {
  background: #C1C1C1;
  border-radius: 3px;
}

.neumorphic-chat::-webkit-scrollbar-thumb:hover {
  background: #A8A8A8;
}

/* 响应式 */
@media (max-width: 768px) {
  .neumorphic-container {
    height: 100vh;
    border-radius: 0;
    margin: -20px;
  }
  
  .neumorphic-header,
  .neumorphic-chat,
  .input-area,
  .neumorphic-config {
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .message {
    max-width: 90%;
  }
  
  .markdown-toolbar {
    flex-wrap: wrap;
  }
}
</style>
