<template>
  <div class="chat-container">
    <div class="message-box">
      <div class="message-content" ref="messageContent">
        {{ inputText }}
      </div>
    </div>
    
    <div class="input-area">
      <div class="input-toolbar">
        <button class="tool-btn">
          <span>📋</span> 深度思考
        </button>
        <button class="tool-btn auto-search">
          <span>🌐</span> 自动搜索
          <span class="arrow">▼</span>
        </button>
        <button class="tool-btn">
          <span>🛠️</span> 工具
          <span class="arrow">▼</span>
        </button>
      </div>
      
      <div class="input-wrapper">
        <textarea
          v-model="inputText"
          class="auto-resize-textarea"
          placeholder="请输入您的内容..."
          @input="adjustTextareaHeight"
          ref="textareaRef"
        ></textarea>
        <button class="send-btn" @click="handleSend">
          <span>▲</span>
        </button>
      </div>
    </div>
    
    <div class="footer-note">
      内容由AI生成，仅供参考
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const inputText = ref('')
const textareaRef = ref(null)
const messageContent = ref(null)

// 自动调整文本框高度
const adjustTextareaHeight = () => {
  const textarea = textareaRef.value
  if (textarea) {
    // 重置高度为auto，以便正确计算scrollHeight
    textarea.style.height = 'auto'
    // 设置新高度，限制最大高度
    const maxHeight = 120 // 最大高度120px
    const newHeight = Math.min(textarea.scrollHeight, maxHeight)
    textarea.style.height = newHeight + 'px'
    
    // 同时调整上方消息框的高度
    adjustMessageBoxHeight()
  }
}

// 调整上方消息框高度
const adjustMessageBoxHeight = () => {
  const content = messageContent.value
  if (content) {
    // 计算消息框的新高度，确保不超出容器范围
    const containerHeight = 300 // 容器最大高度
    const toolbarHeight = 50   // 工具栏高度
    const inputHeight = textareaRef.value?.offsetHeight || 40
    const footerHeight = 30     // 底部提示高度
    const padding = 20          // 额外内边距
    
    const availableHeight = containerHeight - toolbarHeight - inputHeight - footerHeight - padding
    const minHeight = 100       // 最小高度
    
    const newHeight = Math.max(minHeight, Math.min(availableHeight, content.scrollHeight + 20))
    content.style.minHeight = newHeight + 'px'
  }
}

// 发送按钮处理
const handleSend = () => {
  if (inputText.value.trim()) {
    console.log('发送内容:', inputText.value)
    // 这里可以添加发送逻辑
    // inputText.value = '' // 清空输入框
    // 重置高度
    nextTick(() => {
      adjustTextareaHeight()
    })
  }
}

// 初始化时调整高度
nextTick(() => {
  adjustTextareaHeight()
})
</script>

<style scoped>
.chat-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-box {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  overflow: hidden;
}

.message-content {
  font-family: 'Microsoft YaHei', sans-serif;
  line-height: 1.6;
  color: #333;
  word-wrap: break-word;
  transition: min-height 0.2s ease;
  white-space: pre-wrap;
}

.input-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  font-size:12px;
  color:#495057;
  transition:all 0.2s ease;
}

.tool-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.auto-search {
  color: #28a745;
  border-color: #c3e6cb;
}

.arrow {
  font-size: 10px;
  margin-left: 2px;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 8px;
  transition: border-color 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.auto-resize-textarea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  padding: 4px;
  min-height: 20px;
  max-height: 120px;
  overflow-y: auto;
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #007bff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: white;
  font-size: 14px;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

.send-btn:hover {
  background: #0056b3;
}

.footer-note {
  text-align: center;
  font-size: 11px;
  color: #6c757d;
  margin-top: 8px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .chat-container {
    padding: 16px;
    margin: 10px;
  }
  
  .input-toolbar {
    gap: 4px;
  }
  
  .tool-btn {
    padding: 4px 8px;
    font-size: 11px;
  }
}
</style>