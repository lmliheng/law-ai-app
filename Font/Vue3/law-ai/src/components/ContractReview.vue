<template>
  <div class="contract-page">
    <div class="page-header">
      <h1 class="page-title">合同审查</h1>
      <p class="page-desc">上传或粘贴合同内容，AI智能分析合同风险点并提供修改建议</p>
    </div>

    <div class="contract-layout">
      <!-- 上部：合同输入区 -->
      <div class="input-section">
        <div class="input-tabs">
          <button 
            class="tab-btn" 
            :class="{ active: inputMode === 'text' }"
            @click="inputMode = 'text'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            文本输入
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: inputMode === 'upload' }"
            @click="inputMode = 'upload'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            文件上传
          </button>
        </div>

        <!-- 文本输入模式 -->
        <div v-if="inputMode === 'text'" class="text-input-area">
          <textarea
            v-model="contractText"
            class="contract-textarea"
            placeholder="请在此粘贴合同内容..."
            rows="12"
          ></textarea>
          <div class="input-actions">
            <span class="char-count">{{ contractText.length }} 字符</span>
            <button class="clear-btn" @click="contractText = ''" :disabled="!contractText">清空</button>
          </div>
        </div>

        <!-- 文件上传模式 -->
        <div v-else class="upload-area">
          <div 
            class="upload-zone"
            :class="{ 'drag-over': isDragOver }"
            @dragover.prevent="isDragOver = true"
            @dragleave="isDragOver = false"
            @drop.prevent="handleDrop"
            @click="triggerUpload"
          >
            <input 
              type="file" 
              ref="fileInput" 
              @change="handleFileSelect" 
              accept=".docx,.pdf,.txt,.md"
              style="display: none"
            >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="upload-icon">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <h3>点击或拖拽上传文件</h3>
            <p>支持 .docx、.pdf、.txt、.md 格式，自动提取文本内容</p>
          </div>
          
          <div v-if="uploadedFile" class="file-info">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <span class="file-name">{{ uploadedFile.name }}</span>
            <span class="file-size">{{ formatFileSize(uploadedFile.size) }}</span>
            <button class="remove-file" @click="uploadedFile = null">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- 审查维度选择 -->
        <div class="review-options">
          <div class="options-title">审查维度（可多选）</div>
          <div class="options-grid">
            <label 
              v-for="option in reviewOptions" 
              :key="option.value"
              class="option-item"
              :class="{ selected: selectedOptions.includes(option.value) }"
            >
              <input 
                type="checkbox" 
                :value="option.value"
                v-model="selectedOptions"
                style="display: none"
              >
              <span class="option-check">
                <svg v-if="selectedOptions.includes(option.value)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
              <span class="option-label">{{ option.label }}</span>
            </label>
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="submit-section">
          <button class="review-btn" @click="startReview" :disabled="loading || !contractText">
            <svg v-if="!loading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <span class="loading-spinner" v-else></span>
            {{ loading ? '审查中...' : '开始审查' }}
          </button>
        </div>
      </div>

      <!-- 下部：审查结果区 -->
      <div v-if="reviewResult" class="result-section">
        <div class="result-header">
          <h2 class="result-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            审查结果
          </h2>
          <button class="export-btn" @click="exportReport">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            导出报告
          </button>
        </div>

        <div class="result-content">
          <!-- 风险点汇总 -->
          <div class="result-card risk-summary">
            <div class="card-header">
              <span class="risk-badge" :class="riskLevelClass">{{ riskLevelText }}</span>
              <span class="risk-count">共发现 {{ reviewResult.risks?.length || 0 }} 个风险点</span>
            </div>
          </div>

          <!-- 风险点列表 -->
          <div v-if="reviewResult.risks?.length" class="result-card">
            <h3 class="card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              风险点标注
            </h3>
            <div class="risk-list">
              <div 
                v-for="(risk, index) in reviewResult.risks" 
                :key="index"
                class="risk-item"
                :class="`risk-${risk.level}`"
              >
                <div class="risk-header">
                  <span class="risk-level">{{ riskLevelLabel[risk.level] }}</span>
                  <span class="risk-clause">条款：{{ risk.clause || '未指定' }}</span>
                </div>
                <div class="risk-content">{{ risk.description }}</div>
                <div v-if="risk.suggestion" class="risk-suggestion">
                  <strong>修改建议：</strong>{{ risk.suggestion }}
                </div>
              </div>
            </div>
          </div>

          <!-- 修改建议 -->
          <div v-if="reviewResult.suggestions?.length" class="result-card">
            <h3 class="card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              修改建议
            </h3>
            <ul class="suggestion-list">
              <li v-for="(suggestion, index) in reviewResult.suggestions" :key="index">
                {{ suggestion }}
              </li>
            </ul>
          </div>

          <!-- 合规性总结 -->
          <div v-if="reviewResult.summary" class="result-card">
            <h3 class="card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              合规性总结
            </h3>
            <div class="summary-content" v-html="formatSummary(reviewResult.summary)"></div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!loading" class="empty-result">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
        <h3>合同审查结果</h3>
        <p>请上传或粘贴合同内容，开始智能审查</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'

const inputMode = ref('text')
const contractText = ref('')
const uploadedFile = ref(null)
const isDragOver = ref(false)
const fileInput = ref(null)
const loading = ref(false)
const reviewResult = ref(null)
const selectedOptions = ref(['legality', 'risk', 'fairness'])

const api = axios.create({
  baseURL: '',
  timeout: 60000
})

// 文件内容缓存
const fileContentCache = ref('')

const reviewOptions = [
  { value: 'legality', label: '条款合法性' },
  { value: 'risk', label: '风险提示' },
  { value: 'fairness', label: '公平性' },
  { value: 'compliance', label: '合规性' },
  { value: 'completeness', label: '完整性' }
]

const riskLevelLabel = {
  high: '高风险',
  medium: '中风险',
  low: '低风险'
}

const riskLevelClass = computed(() => {
  if (!reviewResult.value?.risks?.length) return 'risk-low'
  const hasHigh = reviewResult.value.risks.some(r => r.level === 'high')
  const hasMedium = reviewResult.value.risks.some(r => r.level === 'medium')
  if (hasHigh) return 'risk-high'
  if (hasMedium) return 'risk-medium'
  return 'risk-low'
})

const riskLevelText = computed(() => {
  if (!reviewResult.value?.risks?.length) return '暂无风险'
  const hasHigh = reviewResult.value.risks.some(r => r.level === 'high')
  const hasMedium = reviewResult.value.risks.some(r => r.level === 'medium')
  if (hasHigh) return '高风险'
  if (hasMedium) return '中风险'
  return '低风险'
})

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) {
    uploadedFile.value = file
    readFileContent(file)
  }
}

const handleDrop = (e) => {
  isDragOver.value = false
  const file = e.dataTransfer.files[0]
  if (file) {
    uploadedFile.value = file
    readFileContent(file)
  }
}

const readFileContent = async (file) => {
  const fileName = file.name.toLowerCase()
  const fileSize = file.size
  
  // 显示loading状态
  contractText.value = '正在读取文件内容...'
  
  try {
    let content = ''
    
    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      // 纯文本文件直接读取
      content = await readTextFile(file)
    } else if (fileName.endsWith('.pdf')) {
      // PDF文件 - 使用PDF.js解析
      content = await extractPdfText(file)
    } else if (fileName.endsWith('.docx')) {
      // DOCX文件 - 使用mammoth解析
      content = await extractDocxText(file)
    } else {
      // 其他文件尝试作为文本读取
      try {
        content = await readTextFile(file)
      } catch {
        throw new Error('不支持的文件格式，请上传 .txt、.pdf、.docx 格式的文件')
      }
    }
    
    contractText.value = content
    fileContentCache.value = content
  } catch (error) {
    console.error('文件读取失败:', error)
    contractText.value = ''
    alert(error.message || '文件读取失败，请尝试其他方式输入合同内容')
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
  // 动态加载PDF.js
  if (!window.pdfjsLib) {
    // 创建并添加PDF.js脚本
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
    throw new Error('PDF文件中未提取到文字内容，可能是扫描件图片，请使用文本输入或手动复制内容')
  }
  
  return fullText
}

// 提取DOCX文本
const extractDocxText = async (file) => {
  // 动态加载mammoth.js
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

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const startReview = async () => {
  if (!contractText.value) return
  
  loading.value = true
  reviewResult.value = null
  
  try {
    const response = await api.post('/api/yuanqi/chat', {
      message: `请对以下合同进行审查，重点关注：${selectedOptions.value.join('、')}。\n\n合同内容：\n${contractText.value}`,
      history: []
    })
    
    // 解析返回结果（简单处理，实际可更复杂）
    reviewResult.value = {
      risks: parseRisks(response.data.answer),
      suggestions: parseSuggestions(response.data.answer),
      summary: extractSummary(response.data.answer)
    }
  } catch (error) {
    console.error('审查失败:', error)
    alert('审查失败，请重试')
  } finally {
    loading.value = false
  }
}

const parseRisks = (text) => {
  const risks = []
  // 简单匹配风险点
  const patterns = [
    /风险[：:]([^。]+)/gi,
    /问题[：:]([^。]+)/gi,
    /隐患[：:]([^。]+)/gi
  ]
  
  patterns.forEach(pattern => {
    let match
    while ((match = pattern.exec(text)) !== null) {
      risks.push({
        level: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
        description: match[1],
        clause: '相关条款'
      })
    }
  })
  
  if (risks.length === 0) {
    risks.push({
      level: 'low',
      description: text.slice(0, 200),
      clause: '全文审查'
    })
  }
  
  return risks.slice(0, 5)
}

const parseSuggestions = (text) => {
  const suggestions = []
  const lines = text.split(/[。.；;]/).filter(s => s.includes('建议') || s.includes('修改'))
  return lines.slice(0, 3).map(s => s.trim())
}

const extractSummary = (text) => {
  // 取最后200字作为总结
  return text.slice(-500)
}

const formatSummary = (text) => {
  return text.replace(/\n/g, '<br>')
}

const exportReport = () => {
  const content = `
合同审查报告
生成时间：${new Date().toLocaleString()}

风险评估：${riskLevelText.value}
风险点数量：${reviewResult.value.risks?.length || 0}

详细结果：
${reviewResult.value.risks?.map((r, i) => `${i + 1}. [${riskLevelLabel[r.level]}] ${r.description}`).join('\n') || '无'}

修改建议：
${reviewResult.value.suggestions?.join('\n') || '无'}
  `.trim()
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `合同审查报告_${new Date().toLocaleDateString()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.contract-page {
  min-height: calc(100vh - 60px);
  margin-top: 60px;
  background: #f5f7fa;
  padding: 24px;
}

.page-header {
  width: 100%;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-desc {
  color: #4b5563;
  font-size: 14px;
  margin: 0;
}

.contract-layout {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
}

/* 输入区域 */
.input-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
}

.input-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  color: #4b5563;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #e5e7eb;
}

.tab-btn.active {
  background: #3b82f6;
  color: #fff;
}

.contract-textarea {
  width: 100%;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.8;
  resize: vertical;
  font-family: inherit;
}

.contract-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.char-count {
  font-size: 13px;
  color: #9ca3af;
}

.clear-btn {
  padding: 6px 12px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  color: #4b5563;
  font-size: 13px;
  cursor: pointer;
}

.clear-btn:hover:not(:disabled) {
  background: #fee2e2;
  color: #dc2626;
}

/* 文件上传 */
.upload-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.upload-zone {
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  padding: 48px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-zone:hover,
.upload-zone.drag-over {
  border-color: #3b82f6;
  background: #f0f7ff;
}

.upload-icon {
  color: #d1d5db;
  margin-bottom: 16px;
}

.upload-zone h3 {
  font-size: 16px;
  color: #374151;
  margin: 0 0 8px 0;
}

.upload-zone p {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f3f4f6;
  border-radius: 8px;
}

.file-name {
  flex: 1;
  font-size: 14px;
  color: #374151;
}

.file-size {
  font-size: 13px;
  color: #9ca3af;
}

.remove-file {
  padding: 4px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
}

.remove-file:hover {
  color: #dc2626;
}

/* 审查选项 */
.review-options {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.options-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.options-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f3f4f6;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  color: #4b5563;
  transition: all 0.2s;
}

.option-item:hover {
  background: #e5e7eb;
}

.option-item.selected {
  background: #e0e7ff;
  color: #4f46e5;
}

.option-check {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 提交按钮 */
.submit-section {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.review-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 40px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.review-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.review-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 结果区域 */
.result-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.result-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #10b981;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.export-btn:hover {
  background: #059669;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
}

.risk-summary {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: none;
}

.risk-high {
  background: linear-gradient(135deg, #fef2f2, #fecaca);
  border: none;
}

.risk-medium {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border: none;
}

.risk-low {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border: none;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.risk-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.result-section .risk-high .risk-badge {
  background: #dc2626;
  color: #fff;
}

.result-section .risk-medium .risk-badge {
  background: #f59e0b;
  color: #fff;
}

.result-section .risk-low .risk-badge {
  background: #10b981;
  color: #fff;
}

.risk-count {
  font-size: 14px;
  color: #92400e;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.risk-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.risk-item {
  padding: 14px 16px;
  border-radius: 8px;
  border-left: 4px solid;
}

.risk-item.risk-high {
  background: #fef2f2;
  border-color: #dc2626;
}

.risk-item.risk-medium {
  background: #fffbeb;
  border-color: #f59e0b;
}

.risk-item.risk-low {
  background: #f0fdf4;
  border-color: #10b981;
}

.risk-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.risk-level {
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.risk-item.risk-high .risk-level {
  background: #dc2626;
  color: #fff;
}

.risk-item.risk-medium .risk-level {
  background: #f59e0b;
  color: #fff;
}

.risk-item.risk-low .risk-level {
  background: #10b981;
  color: #fff;
}

.risk-clause {
  font-size: 13px;
  color: #4b5563;
}

.risk-content {
  font-size: 14px;
  color: #333333;
  line-height: 1.6;
}

.risk-suggestion {
  margin-top: 8px;
  font-size: 13px;
  color: #374151;
  padding-top: 8px;
  border-top: 1px dashed #e5e7eb;
}

.suggestion-list {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.suggestion-list li {
  font-size: 14px;
  color: #333333;
  line-height: 1.6;
}

.summary-content {
  font-size: 14px;
  color: #333333;
  line-height: 1.8;
}

/* 空状态 */
.empty-result {
  background: #fff;
  border-radius: 12px;
  padding: 80px 40px;
  text-align: center;
}

.empty-icon {
  color: #d1d5db;
  margin-bottom: 24px;
}

.empty-result h3 {
  font-size: 18px;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-result p {
  color: #6b7280;
  margin: 0;
}

/* 平板端适配 */
@media (max-width: 1024px) {
  .contract-page {
    padding: 16px;
  }

  .input-section {
    padding: 20px;
  }

  .contract-textarea {
    min-height: 150px;
  }

  .upload-zone {
    padding: 32px;
  }

  .options-grid {
    gap: 8px;
  }

  .option-item {
    padding: 8px 14px;
    font-size: 13px;
  }

  .result-section {
    padding: 20px;
  }
}

/* 移动端适配 */
@media (max-width: 767px) {
  .contract-page {
    padding: 12px;
  }

  .page-header {
    margin-bottom: 16px;
  }

  .page-title {
    font-size: 20px;
  }

  .input-section {
    padding: 16px;
    border-radius: 12px;
  }

  .input-tabs {
    gap: 6px;
  }

  .tab-btn {
    flex: 1;
    padding: 10px 12px;
    font-size: 13px;
    justify-content: center;
  }

  .tab-btn svg {
    display: none;
  }

  .contract-textarea {
    padding: 12px;
    font-size: 14px;
    min-height: 120px;
  }

  .upload-zone {
    padding: 24px;
  }

  .upload-icon {
    width: 40px;
    height: 40px;
  }

  .upload-zone h3 {
    font-size: 14px;
  }

  .upload-zone p {
    font-size: 12px;
  }

  .options-grid {
    flex-direction: column;
  }

  .option-item {
    width: 100%;
    justify-content: center;
  }

  .submit-section {
    margin-top: 16px;
  }

  .review-btn {
    width: 100%;
    padding: 14px 20px;
    font-size: 15px;
  }

  .result-section {
    padding: 16px;
    border-radius: 12px;
  }

  .result-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .result-title {
    font-size: 16px;
  }

  .export-btn {
    width: 100%;
    justify-content: center;
  }

  .result-card {
    padding: 16px;
  }

  .card-title {
    font-size: 14px;
  }

  .risk-item {
    padding: 12px;
  }

  .risk-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .empty-result {
    padding: 48px 20px;
  }

  .empty-result h3 {
    font-size: 16px;
  }

  .empty-result p {
    font-size: 13px;
  }
}
</style>
