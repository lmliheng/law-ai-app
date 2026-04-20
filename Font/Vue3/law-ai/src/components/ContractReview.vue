<template>
  <div class="contract-page">
    <div class="page-header">
      <h1 class="page-title">合同审查</h1>
      <p class="page-desc">由于接口数据类型限制，该功能需要string数据解析比较慢，请耐心等待..</p>
    </div>

    <div class="contract-layout">
      <!-- 左侧：合同输入区 -->
      <div class="input-section">
        <div class="input-header">
          <h2 class="section-title">合同输入</h2>
          <button class="sample-btn" @click="loadSampleCase">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            使用案例
          </button>
        </div>
        
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
            rows="10"
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
              accept=".txt"
              style="display: none"
            >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="upload-icon">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <h3>点击或拖拽上传文件</h3>
            <p>支持 .txt 格式</p>
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

      <!-- 右侧：审查结果区 -->
      <div class="result-section">
        <div v-if="reviewResult" class="result-inner">
          <div class="result-header">
            <h2 class="result-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              审查结果
            </h2>
          </div>

          <div class="result-content">
            <!-- 风险概览 -->
            <div class="result-card risk-summary">
              <div class="card-header">
                <span class="risk-badge" :class="riskLevelClass">{{ riskLevelText }}</span>
                <span class="risk-count">共发现 {{ reviewResult.riskClauses?.length || 0 }} 个风险点</span>
              </div>
              <div v-if="reviewResult.contractType" class="contract-type-info">
                <span>合同类型：{{ reviewResult.contractType }}</span>
              </div>
            </div>

            <!-- 风险条款列表 -->
            <div v-if="reviewResult.riskClauses?.length" class="result-card">
              <h3 class="card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                风险条款分析
              </h3>
              <div class="risk-list">
                <div 
                  v-for="(risk, index) in reviewResult.riskClauses" 
                  :key="index"
                  class="risk-item"
                  :class="`risk-${risk.riskLevel === '高' || risk.riskLevel === 'high' ? 'high' : (risk.riskLevel === '中' || risk.riskLevel === 'medium' ? 'medium' : 'low')}`"
                >
                  <div class="risk-header">
                    <span class="risk-level" :class="`level-${risk.riskLevel}`">{{ risk.riskLevel }}风险</span>
                  </div>
                  <div class="risk-clause-text">
                    <strong>条款内容：</strong>{{ risk.clause }}
                  </div>
                  <div class="risk-description">
                    <strong>风险分析：</strong>{{ risk.riskDescription }}
                  </div>
                  <div v-if="risk.suggestion" class="risk-suggestion">
                    <strong>修改建议：</strong>{{ risk.suggestion }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 关键缺失条款 -->
            <div v-if="reviewResult.keyOmissions?.length" class="result-card">
              <h3 class="card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                关键缺失条款
              </h3>
              <ul class="suggestion-list">
                <li v-for="(item, index) in reviewResult.keyOmissions" :key="index">
                  {{ item }}
                </li>
              </ul>
            </div>

            <!-- 谈判策略 -->
            <div v-if="reviewResult.negotiationStrategy" class="result-card strategy-card">
              <h3 class="card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                谈判策略建议
              </h3>
              <div class="strategy-content">{{ reviewResult.negotiationStrategy }}</div>
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

    <!-- 审查完成对话框 -->
    <div v-if="showDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>审查完成</h3>
          <button class="dialog-close" @click="closeDialog">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <div class="dialog-icon success">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <p class="dialog-message">合同审查已完成！</p>
          <p class="dialog-submessage">共发现 <strong>{{ reviewResult?.riskClauses?.length || 0 }}</strong> 个风险点</p>
          <div v-if="reviewResult?.contractType" class="dialog-info">
            合同类型：{{ reviewResult.contractType }}
          </div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn primary" @click="closeDialog">查看详情</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import axios from 'axios'

const inputMode = ref('text')
const contractText = ref('')
const uploadedFile = ref(null)
const isDragOver = ref(false)
const fileInput = ref(null)
const loading = ref(false)
const reviewResult = ref(null)
const showDialog = ref(false)

// 示例合同文本
const sampleContractText = `劳动合同

甲方（用人单位）：XX科技有限公司
乙方（劳动者）：张三

一、合同期限
本合同期限自2024年1月1日起至2026年12月31日止，其中试用期为6个月。

二、工作内容
乙方同意在甲方担任技术开发岗位工作。甲方可根据业务需要调整乙方的工作岗位及工作内容，乙方应予服从。

三、工作地点
乙方的工作地点为北京市。甲方可根据生产经营需要，随时调整乙方的工作地点，乙方应予服从。

四、工作时间
实行不定时工作制，乙方应随时配合甲方的生产安排。

五、劳动报酬
乙方的工资由基本工资和绩效工资组成，具体金额及发放办法按公司规章制度执行。

六、社会保险
甲方按公司政策决定是否缴纳社会保险。

七、休息休假
乙方享有法定节假日，但甲方可根据生产情况安排乙方在其他时间补休。

八、合同解除
甲方可随时解除合同，且不承担经济补偿责任。

九、违约责任
乙方若提前解除合同，应向甲方支付违约金人民币50000元。

十、争议解决
因履行本合同发生的争议，由甲方所在地人民法院管辖。

十一、其他
本合同最终解释权归甲方所有。`



// API配置
const API_CONFIG = reactive({
  appkey: 'XarOv8KKJKjdMtnygFflUK77YJPfup2s',
  appid: '2045158627388722368',
  apiUrl: 'https://yuanqi.tencent.com/openapi/v1/agent/chat/completions',
  stream: true
})



// 文件内容缓存
const fileContentCache = ref('')

const riskLevelLabel = {
  high: '高风险',
  medium: '中风险',
  low: '低风险'
}

const riskLevelClass = computed(() => {
  if (!reviewResult.value?.riskClauses?.length) return 'risk-low'
  const hasHigh = reviewResult.value.riskClauses.some(r => r.riskLevel === '高' || r.riskLevel === 'high')
  const hasMedium = reviewResult.value.riskClauses.some(r => r.riskLevel === '中' || r.riskLevel === 'medium')
  if (hasHigh) return 'risk-high'
  if (hasMedium) return 'risk-medium'
  return 'risk-low'
})

const riskLevelText = computed(() => {
  if (!reviewResult.value?.riskClauses?.length) return '暂无风险'
  const hasHigh = reviewResult.value.riskClauses.some(r => r.riskLevel === '高' || r.riskLevel === 'high')
  const hasMedium = reviewResult.value.riskClauses.some(r => r.riskLevel === '中' || r.riskLevel === 'medium')
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

// 加载示例合同
const loadSampleCase = () => {
  contractText.value = sampleContractText
  inputMode.value = 'text'
}

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false
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
    const response = await axios.post(API_CONFIG.apiUrl, {
      assistant_id: API_CONFIG.appid,
      user_id: "user_" + Date.now(),
      stream: false,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: contractText.value
            }
          ]
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_CONFIG.appkey
      }
    })
    
    const answerText = response.data.choices[0].message.content
    
    console.log('===== 合同审查 接口返回内容 =====')
    console.log('完整响应:', response)
    console.log('answerText类型:', typeof answerText)
    console.log('answerText长度:', answerText?.length)
    
    try {
      let parsedData = null
      
      try {
        parsedData = JSON.parse(answerText)
      } catch {
        const startIdx = answerText.indexOf('{')
        if (startIdx !== -1) {
          let braceCount = 0
          let endIdx = -1
          for (let i = startIdx; i < answerText.length; i++) {
            if (answerText[i] === '{') {
              braceCount++
            } else if (answerText[i] === '}') {
              braceCount--
              if (braceCount === 0) {
                endIdx = i
                break
              }
            }
          }
          
          if (endIdx !== -1) {
            const jsonStr = answerText.substring(startIdx, endIdx + 1)
            try {
              parsedData = JSON.parse(jsonStr)
            } catch (e) {
              console.log('===== JSON提取失败 =====')
              console.log('错误:', e.message)
            }
          } else {
            console.log('===== 未找到匹配的JSON闭合 =====')
          }
        }
      }
      
      console.log('===== 解析后的数据 =====')
      console.log('parsedData:', parsedData)
      
      if (parsedData) {
        if (parsedData.data) {
          reviewResult.value = parsedData.data
        } else {
          reviewResult.value = parsedData
        }
        console.log('===== reviewResult 已设置 =====')
        console.log('reviewResult:', reviewResult.value)
      } else {
        console.log('===== 未找到有效的JSON =====')
        reviewResult.value = null
      }
    } catch (parseError) {
      console.error('===== JSON解析失败 =====')
      console.error('解析错误:', parseError)
      reviewResult.value = null
    }
  } catch (error) {
    console.error('审查失败:', error)
    alert('审查失败，请重试')
  } finally {
    loading.value = false
    if (reviewResult.value) {
      showDialog.value = true
    }
  }
}
</script>

<style scoped>
.contract-page {
  min-height: calc(100vh - 60px);
  margin-top: 60px;
  background: #f5f7fa;
  padding: 24px;
  overflow: hidden;
  box-sizing: border-box;
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
  gap: 24px;
  box-sizing: border-box;
  height: calc(100vh - 140px);
  overflow: hidden;
  max-width: 100%;
}

/* 输入区域 */
.input-section {
  width: 45%;
  min-width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.sample-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #10b981;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.sample-btn:hover {
  background: #059669;
  transform: translateY(-1px);
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
  width: 90%;
  flex: 1;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.8;
  resize: none;
  font-family: inherit;
  min-height: 200px;
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

/* 结果区域 */
.result-section {
  width: 55%;
  min-width: 0;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
  box-sizing: border-box;
  flex: 1;
}

.result-inner {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.contract-type-info {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e5e7eb;
  font-size: 14px;
  color: #4b5563;
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

.risk-clause-text {
  font-size: 14px;
  color: #333333;
  line-height: 1.6;
  background: #f9fafb;
  padding: 10px 12px;
  border-radius: 6px;
  margin-bottom: 10px;
}

.risk-description {
  font-size: 14px;
  color: #333333;
  line-height: 1.6;
  margin-top: 10px;
}

.level-high {
  background: #ef4444;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.level-medium {
  background: #f59e0b;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.level-low {
  background: #10b981;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.strategy-card {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #bfdbfe;
}

.strategy-content {
  font-size: 14px;
  color: #1e40af;
  line-height: 1.8;
  white-space: pre-wrap;
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
  white-space: pre-wrap;
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

  .contract-layout {
    flex-direction: column;
    height: auto;
  }

  .input-section {
    width: 100%;
    padding: 16px;
    border-radius: 12px;
  }

  .result-section {
    width: 100%;
    padding: 16px;
    border-radius: 12px;
    max-height: 500px;
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

  .submit-section {
    margin-top: 16px;
  }

  .review-btn {
    width: 100%;
    padding: 14px 20px;
    font-size: 15px;
  }

  .result-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .result-title {
    font-size: 16px;
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
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dialog-content {
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.dialog-close {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.dialog-close:hover {
  color: #6b7280;
}

.dialog-body {
  padding: 32px 24px;
  text-align: center;
}

.dialog-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 20px;
}

.dialog-icon.success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
}

.dialog-message {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.dialog-submessage {
  font-size: 15px;
  color: #6b7280;
  margin: 0 0 16px 0;
}

.dialog-submessage strong {
  color: #dc2626;
  font-weight: 600;
}

.dialog-info {
  display: inline-block;
  background: #f3f4f6;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  color: #4b5563;
}

.dialog-footer {
  padding: 16px 24px 24px;
  display: flex;
  justify-content: center;
}

.dialog-btn {
  padding: 12px 32px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.dialog-btn.primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
}

.dialog-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}
</style>
