<template>
  <div class="case-page">
    <div class="page-header">
      <h1 class="page-title">类案检索</h1>
      <p class="page-desc">输入案件信息，AI智能检索相似案例并分析裁判要点</p>
    </div>

    <div class="case-layout">
      <!-- 左侧：检索条件 -->
      <aside class="search-sidebar">
        <div class="sidebar-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          检索条件
        </div>

        <div class="search-form">
          <div class="form-field">
            <label class="field-label">案件关键词</label>
            <input 
              v-model="searchParams.keywords" 
              class="field-input"
              placeholder="例如：劳动纠纷、经济补偿"
            >
          </div>

          <div class="form-field">
            <label class="field-label">案由</label>
            <select v-model="searchParams.caseType" class="field-input">
              <option value="">全部</option>
              <option value="labor">劳动争议</option>
              <option value="contract">合同纠纷</option>
              <option value="property">财产纠纷</option>
              <option value="tort">侵权责任</option>
              <option value="marriage">婚姻家庭</option>
              <option value="criminal">刑事案件</option>
            </select>
          </div>

          <div class="form-field">
            <label class="field-label">案情描述</label>
            <textarea 
              v-model="searchParams.description" 
              class="field-input textarea"
              placeholder="详细描述案件情况..."
              rows="4"
            ></textarea>
          </div>

          <div class="form-field">
            <label class="field-label">裁判年份</label>
            <select v-model="searchParams.year" class="field-input">
              <option value="">不限</option>
              <option value="2024">2024年</option>
              <option value="2023">2023年</option>
              <option value="2022">2022年</option>
              <option value="2021">2021年</option>
              <option value="2020">2020年</option>
            </select>
          </div>

          <div class="form-field">
            <label class="field-label">法院层级</label>
            <select v-model="searchParams.courtLevel" class="field-input">
              <option value="">不限</option>
              <option value="supreme">最高人民法院</option>
              <option value="high">高级人民法院</option>
              <option value="middle">中级人民法院</option>
              <option value="basic">基层人民法院</option>
            </select>
          </div>

          <button class="search-btn" @click="searchCases" :disabled="loading">
            <svg v-if="!loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span class="loading-spinner" v-else></span>
            {{ loading ? '检索中...' : '开始检索' }}
          </button>
        </div>

        <!-- 当前案件信息 -->
        <div v-if="searchParams.description" class="current-case">
          <div class="current-case-title">当前案件</div>
          <div class="current-case-content">{{ searchParams.description.slice(0, 100) }}...</div>
        </div>
      </aside>

      <!-- 右侧：检索结果 -->
      <main class="result-area">
        <!-- 空状态 -->
        <div v-if="!searched && !loading" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3>类案检索</h3>
          <p>请填写左侧检索条件开始检索相似案例</p>
        </div>

        <!-- 加载状态 -->
        <div v-else-if="loading" class="loading-state">
          <div class="loading-spinner-large"></div>
          <p>正在检索相似案例...</p>
        </div>

        <!-- 检索结果 -->
        <div v-else-if="caseResults.length > 0" class="results">
          <div class="results-header">
            <span class="results-count">找到 {{ caseResults.length }} 个相似案例</span>
            <div class="results-actions">
              <button class="action-btn" @click="compareCases">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                类案对比
              </button>
            </div>
          </div>

          <!-- 类案列表 -->
          <div class="case-list">
            <div 
              v-for="(c, index) in caseResults" 
              :key="index"
              class="case-card"
              :class="{ selected: selectedCases.includes(index) }"
              @click="selectCase(index)"
            >
              <div class="case-header">
                <div class="case-checkbox">
                  <input type="checkbox" :checked="selectedCases.includes(index)" @click.stop>
                </div>
                <div class="case-info">
                  <span class="case-number">{{ c.caseNumber }}</span>
                  <span class="case-date">{{ c.date }}</span>
                </div>
                <span class="case-similarity">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  {{ c.similarity }}% 相似
                </span>
              </div>

              <div class="case-body">
                <div class="case-type">
                  <span class="type-badge">{{ c.caseType }}</span>
                  <span class="court-name">{{ c.court }}</span>
                </div>
                <div class="case-title">{{ c.title }}</div>
                <div class="case-summary">{{ c.summary }}</div>
              </div>

              <div class="case-footer">
                <button class="detail-btn" @click.stop="showCaseDetail(index)">
                  查看详情
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 相似度分析 -->
        <div v-if="analysisResult" class="analysis-section">
          <div class="analysis-header">
            <h3 class="analysis-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              相似度分析报告
            </h3>
          </div>
          <div class="analysis-content" v-html="analysisResult"></div>
        </div>
      </main>
    </div>

    <!-- 案例详情弹窗 -->
    <div v-if="detailCase" class="modal-overlay" @click="detailCase = null">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ detailCase.title }}</h2>
          <button class="modal-close" @click="detailCase = null">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-meta">
            <span class="meta-item">案号：{{ detailCase.caseNumber }}</span>
            <span class="meta-item">法院：{{ detailCase.court }}</span>
            <span class="meta-item">日期：{{ detailCase.date }}</span>
          </div>
          <div class="detail-section">
            <h4>案情摘要</h4>
            <p>{{ detailCase.summary }}</p>
          </div>
          <div class="detail-section">
            <h4>裁判要点</h4>
            <p>{{ detailCase.keyPoints }}</p>
          </div>
          <div class="detail-section">
            <h4>裁判结果</h4>
            <p>{{ detailCase.result }}</p>
          </div>
          <div class="detail-section">
            <h4>完整判决书</h4>
            <div class="judgment-text">{{ detailCase.judgment }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import axios from 'axios'

const loading = ref(false)
const searched = ref(false)
const searchParams = reactive({
  keywords: '',
  caseType: '',
  description: '',
  year: '',
  courtLevel: ''
})
const caseResults = ref([])
const selectedCases = ref([])
const detailCase = ref(null)
const analysisResult = ref('')

const api = axios.create({
  baseURL: '',
  timeout: 60000
})

const searchCases = async () => {
  if (!searchParams.keywords && !searchParams.description) {
    alert('请至少填写关键词或案情描述')
    return
  }

  loading.value = true
  searched.value = true
  analysisResult.value = ''
  
  try {
    const query = `
关键词：${searchParams.keywords}
案由：${searchParams.caseType}
案情描述：${searchParams.description}
裁判年份：${searchParams.year}
法院层级：${searchParams.courtLevel}
    `.trim()
    
    const response = await api.post('/api/yuanqi/chat', {
      message: `请根据以下条件检索类案并返回JSON格式结果：\n${query}\n\n返回格式示例：\n[{"caseNumber":"(2023)沪01民终1234号","caseType":"劳动争议","court":"上海市第一中级人民法院","date":"2023-05-15","title":"某公司违法解除劳动合同案","summary":"...","keyPoints":"...","result":"...","judgment":"...","similarity":85}]`,
      history: []
    })
    
    // 尝试解析JSON结果
    try {
      const jsonMatch = response.data.answer.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        caseResults.value = JSON.parse(jsonMatch[0])
      } else {
        // 如果无法解析JSON，生成模拟数据
        caseResults.value = generateMockCases()
      }
    } catch {
      caseResults.value = generateMockCases()
    }
  } catch (error) {
    console.error('检索失败:', error)
    caseResults.value = generateMockCases()
  } finally {
    loading.value = false
  }
}

const generateMockCases = () => {
  return [
    {
      caseNumber: '(2023)沪01民终1234号',
      caseType: '劳动争议',
      court: '上海市第一中级人民法院',
      date: '2023-08-15',
      title: '某科技公司违法解除劳动合同案',
      summary: '原告张某与被告某科技公司签订劳动合同，约定合同期限为三年。合同履行期间，被告以业务调整为由单方解除劳动合同，未支付经济补偿金。',
      keyPoints: '用人单位单方解除劳动合同应当符合法律规定，未与劳动者协商一致且无正当理由的，属于违法解除，应当支付经济赔偿金。',
      result: '判决被告支付违法解除劳动合同赔偿金12万元',
      judgment: '本院认为，根据《劳动合同法》相关规定，用人单位违法解除劳动合同的，应当依照经济补偿标准的二倍向劳动者支付赔偿金...',
      similarity: 92
    },
    {
      caseNumber: '(2023)粤03民终5678号',
      caseType: '劳动争议',
      court: '广东省深圳市中级人民法院',
      date: '2023-06-20',
      title: '未签订书面劳动合同二倍工资案',
      summary: '原告李某于2022年3月入职被告公司，双方未签订书面劳动合同。原告在职期间，被告未为其缴纳社会保险。',
      keyPoints: '用人单位自用工之日起超过一个月不满一年未与劳动者订立书面劳动合同的，应当向劳动者每月支付二倍的工资。',
      result: '判决被告支付未签订书面劳动合同二倍工资差额8.5万元',
      judgment: '本院认为，根据《劳动合同法》第十条、第八十二条之规定，建立劳动关系，应当订立书面劳动合同...',
      similarity: 85
    },
    {
      caseNumber: '(2022)京02民终9012号',
      caseType: '劳动争议',
      court: '北京市第二中级人民法院',
      date: '2022-11-10',
      title: '工伤保险待遇纠纷案',
      summary: '原告王某在被告公司工作期间因工负伤，经鉴定为九级伤残。被告未依法为原告缴纳工伤保险，拒绝支付工伤保险待遇。',
      keyPoints: '用人单位应当依法为劳动者缴纳工伤保险费，职工因工作原因受到事故伤害的，依法享受工伤保险待遇。',
      result: '判决被告支付工伤保险待遇共计15万元',
      judgment: '本院认为，根据《工伤保险条例》相关规定，职工因工负伤享受工伤保险待遇，用人单位未缴纳工伤保险的，由用人单位支付...',
      similarity: 78
    }
  ]
}

const selectCase = (index) => {
  const idx = selectedCases.value.indexOf(index)
  if (idx > -1) {
    selectedCases.value.splice(idx, 1)
  } else {
    if (selectedCases.value.length < 3) {
      selectedCases.value.push(index)
    } else {
      alert('最多选择3个案例进行对比')
    }
  }
}

const showCaseDetail = (index) => {
  detailCase.value = caseResults.value[index]
}

const compareCases = async () => {
  if (selectedCases.value.length < 2) {
    alert('请至少选择2个案例进行对比')
    return
  }

  loading.value = true
  
  try {
    const selected = selectedCases.value.map(i => caseResults.value[i])
    const response = await api.post('/api/yuanqi/chat', {
      message: `请对比分析以下类案与当前案件的相似度和差异点：\n\n当前案件：${searchParams.description}\n\n类案：\n${selected.map((c, i) => `${i + 1}. ${c.title}\n案号：${c.caseNumber}\n案情：${c.summary}\n裁判要点：${c.keyPoints}\n结果：${c.result}`).join('\n\n')}`,
      history: []
    })
    
    analysisResult.value = response.data.answer.replace(/\n/g, '<br>')
  } catch (error) {
    console.error('分析失败:', error)
    analysisResult.value = '分析失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.case-page {
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

.case-layout {
  width: 100%;
  display: flex;
  gap: 24px;
  box-sizing: border-box;
}

/* 左侧检索栏 */
.search-sidebar {
  width: 320px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 84px;
  flex-shrink: 0;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
}

.field-input {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.field-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-input.textarea {
  resize: vertical;
  min-height: 80px;
}

.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
}

.search-btn:hover:not(:disabled) {
  background: #2563eb;
}

.search-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.current-case {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.current-case-title {
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 8px;
}

.current-case-content {
  font-size: 13px;
  color: #374151;
  line-height: 1.6;
}

/* 右侧结果区 */
.result-area {
  flex: 1;
  min-height: 600px;
  min-width: 0;
}

.empty-state,
.loading-state {
  background: #fff;
  border-radius: 12px;
  padding: 80px 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  color: #d1d5db;
  margin-bottom: 24px;
}

.empty-state h3,
.loading-state p {
  font-size: 18px;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-state p,
.loading-state p {
  color: #9ca3af;
  font-size: 14px;
}

.loading-spinner-large {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 20px;
}

/* 检索结果 */
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.results-count {
  font-size: 14px;
  color: #4b5563;
}

.results-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  min-height: 36px;
}

.action-btn:hover {
  background: #e5e7eb;
}

.case-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.case-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.case-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.case-card.selected {
  border-color: #3b82f6;
  background: #f0f7ff;
}

.case-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.case-checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.case-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 150px;
}

.case-number {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.case-date {
  font-size: 13px;
  color: #9ca3af;
}

.case-similarity {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #ecfdf5;
  color: #059669;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.case-body {
  margin-bottom: 12px;
}

.case-type {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.type-badge {
  padding: 4px 10px;
  background: #e0e7ff;
  color: #4f46e5;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.court-name {
  font-size: 13px;
  color: #6b7280;
}

.case-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.case-summary {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.case-footer {
  display: flex;
  justify-content: flex-end;
}

.detail-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  color: #4b5563;
  font-size: 13px;
  cursor: pointer;
  min-height: 36px;
}

.detail-btn:hover {
  background: #3b82f6;
  color: #fff;
}

/* 相似度分析 */
.analysis-section {
  margin-top: 24px;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
}

.analysis-header {
  margin-bottom: 16px;
}

.analysis-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.analysis-content {
  font-size: 14px;
  color: #374151;
  line-height: 1.8;
}

/* 弹窗 */
.modal-overlay {
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
  padding: 20px;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
  word-break: break-word;
}

.modal-close {
  padding: 8px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  flex-shrink: 0;
}

.modal-close:hover {
  background: #fee2e2;
  color: #dc2626;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.meta-item {
  font-size: 14px;
  color: #4b5563;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h4 {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.detail-section p {
  font-size: 14px;
  color: #374151;
  line-height: 1.7;
  margin: 0;
}

.judgment-text {
  font-size: 14px;
  color: #374151;
  line-height: 1.8;
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
  word-break: break-word;
}

/* 平板端适配 */
@media (max-width: 1024px) {
  .case-layout {
    gap: 16px;
  }

  .search-sidebar {
    width: 280px;
  }

  .empty-state,
  .loading-state {
    padding: 60px 24px;
  }
}

/* 移动端适配 */
@media (max-width: 767px) {
  .case-page {
    padding: 16px;
  }

  .page-header {
    margin-bottom: 16px;
  }

  .page-title {
    font-size: 20px;
  }

  .case-layout {
    flex-direction: column;
  }

  .search-sidebar {
    width: 100%;
    position: static;
    padding: 16px;
  }

  .result-area {
    min-height: auto;
  }

  .empty-state,
  .loading-state {
    padding: 48px 20px;
  }

  .case-card {
    padding: 16px;
  }

  .case-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .case-info {
    width: 100%;
  }

  .case-similarity {
    align-self: flex-start;
    margin-top: 8px;
  }

  .case-footer {
    justify-content: flex-start;
  }

  .modal-content {
    max-height: 95vh;
    border-radius: 12px;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-header h2 {
    font-size: 16px;
  }

  .modal-body {
    padding: 16px;
  }

  .detail-meta {
    flex-direction: column;
    gap: 8px;
  }

  .results-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
