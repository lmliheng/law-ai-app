<template>
  <div class="case-page">
    <div class="page-header">
      <h1 class="page-title">类案检索</h1>
      <p class="page-desc">输入案件关键词，智能检索相似案例并分析裁判要点</p>
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
            <label class="field-label">关键词（多个用逗号分隔）</label>
            <input
              v-model="keywordInput"
              class="field-input"
              placeholder="例如：劳动纠纷,经济补偿,加班费"
            >
          </div>

          <div class="form-field">
            <label class="field-label">案件起始年份</label>
            <input
              v-model="searchParams.caseYearStart"
              type="date"
              class="field-input"
            >
          </div>

          <div class="form-field">
            <label class="field-label">案件结束年份</label>
            <input
              v-model="searchParams.caseYearEnd"
              type="date"
              class="field-input"
            >
          </div>

          <div class="form-field">
            <label class="field-label">每页显示数量</label>
            <select v-model="searchParams.pageSize" class="field-input">
              <option :value="3">3条</option>
              <option :value="5">5条</option>
              <option :value="10">10条</option>
              <option :value="20">20条</option>
            </select>
          </div>

          <div class="form-field">
            <label class="field-label">排序方式</label>
            <select v-model="searchParams.sortOrder" class="field-input">
              <option value="desc">相关性降序</option>
              <option value="asc">相关性升序</option>
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

        <!-- 分页信息 -->
        <div v-if="totalResults > 0" class="pagination-info">
          <div class="info-title">检索结果</div>
          <div class="info-content">
            共找到 <strong>{{ totalResults }}</strong> 条相似案例
          </div>
          <div class="info-content" v-if="totalPages > 1">
            第 {{ searchParams.pageNo }} / {{ totalPages }} 页
          </div>
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
            <span class="results-count">找到 {{ totalResults }} 个相似案例</span>
            <div class="results-actions">
              <button class="action-btn" @click="prevPage" :disabled="searchParams.pageNo <= 1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                上一页
              </button>
              <button class="action-btn" @click="nextPage" :disabled="searchParams.pageNo >= totalPages">
                下一页
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>

          <!-- 案例列表（可滚动） -->
          <div class="case-list-wrapper">
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
                    <span class="case-number">{{ c.caseNumber || '暂无案号' }}</span>
                    <span class="court-name">{{ c.court || '暂无法院信息' }}</span>
                  </div>
                  <span class="case-date">{{ c.judgementDate || '' }}</span>
                </div>

                <div class="case-body">
                  <div class="case-type">
                    <span class="type-badge">{{ c.caseType || '' }}</span>
                    <span class="type-badge cause" v-if="c.cause">{{ c.cause }}</span>
                  </div>
                  <div class="case-title" v-html="c.title || '暂无案件标题'"></div>
                  <div class="case-summary" v-html="c.content || '暂无案件内容'"></div>
                </div>

                <div class="case-footer">
                  <button class="detail-btn" @click.stop="showCaseDetail(c)">
                    查看详情
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页控件 -->
          <div class="pagination-controls" v-if="totalPages > 1">
            <button class="page-btn" @click="goToPage(1)" :disabled="searchParams.pageNo <= 1">首页</button>
            <button class="page-btn" @click="prevPage" :disabled="searchParams.pageNo <= 1">上一页</button>
            <span class="page-info">{{ searchParams.pageNo }} / {{ totalPages }}</span>
            <button class="page-btn" @click="nextPage" :disabled="searchParams.pageNo >= totalPages">下一页</button>
            <button class="page-btn" @click="goToPage(totalPages)" :disabled="searchParams.pageNo >= totalPages">尾页</button>
          </div>
        </div>

        <!-- 无结果状态 -->
        <div v-else-if="searched && !loading" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="8" x2="14" y2="14"></line>
            <line x1="14" y1="8" x2="8" y2="14"></line>
          </svg>
          <h3>未找到相似案例</h3>
          <p>请尝试调整关键词或时间范围</p>
        </div>
      </main>
    </div>

    <!-- 案例详情弹窗 -->
    <div v-if="detailCase" class="modal-overlay" @click="detailCase = null">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 v-html="detailCase.title || '案件详情'"></h2>
          <button class="modal-close" @click="detailCase = null">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-meta">
            <span class="meta-item">案号：{{ detailCase.caseNumber || '暂无' }}</span>
            <span class="meta-item">法院：{{ detailCase.court || '暂无' }}</span>
            <span class="meta-item">判决日期：{{ detailCase.judgementDate || '暂无' }}</span>
          </div>
          <div class="detail-section" v-if="detailCase.caseType">
            <h4>案件类型</h4>
            <p>{{ detailCase.caseType }}</p>
          </div>
          <div class="detail-section" v-if="detailCase.cause">
            <h4>案由</h4>
            <p>{{ detailCase.cause }}</p>
          </div>
          <div class="detail-section" v-if="detailCase.levelOfTrial">
            <h4>审理级别</h4>
            <p>{{ detailCase.levelOfTrial }}</p>
          </div>
          <div class="detail-section" v-if="detailCase.judgementType">
            <h4>裁判类型</h4>
            <p>{{ detailCase.judgementType }}</p>
          </div>
          <div class="detail-section" v-if="detailCase.publishTypeName">
            <h4>发布类型</h4>
            <p>{{ detailCase.publishTypeName }}</p>
          </div>
          <div class="detail-section" v-if="detailCase.content">
            <h4>案件内容</h4>
            <div class="case-content" v-html="detailCase.content"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 检索反馈对话框 -->
    <div v-if="showFeedback" class="modal-overlay" @click="showFeedback = false">
      <div class="modal-content feedback-modal" @click.stop>
        <div class="modal-header">
          <h2>检索结果</h2>
          <button class="modal-close" @click="showFeedback = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="feedback-icon" :class="feedbackType">
            <svg v-if="feedbackType === 'success'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <svg v-else-if="feedbackType === 'error'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <svg v-else width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <p class="feedback-message">{{ feedbackMessage }}</p>
          <div v-if="totalResults > 0" class="feedback-count">
            共找到 <strong>{{ totalResults }}</strong> 条相似案例
          </div>
        </div>
        <div class="modal-footer">
          <button class="dialog-btn primary" @click="showFeedback = false">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import axios from 'axios'

const API_URL = 'https://openapi.delilegal.com/api/qa/v3/search/queryListCase'
const APP_ID = 'QthdBErlyaYvyXul'
const SECRET = 'EC5D455E6BD348CE8E18BE05926D2EBE'

const loading = ref(false)
const searched = ref(false)
const showFeedback = ref(false)
const feedbackMessage = ref('')
const feedbackType = ref('info')
const keywordInput = ref('')
const searchParams = reactive({
  pageNo: 1,
  pageSize: 3,
  sortField: 'correlation',
  sortOrder: 'desc',
  caseYearStart: '2012-01-01',
  caseYearEnd: new Date().toISOString().slice(0, 10),
  keywordArr: []
})

const caseResults = ref([])
const selectedCases = ref([])
const detailCase = ref(null)
const totalResults = ref(0)
const totalPages = computed(() => Math.ceil(totalResults.value / searchParams.pageSize) || 1)

const api = axios.create({
  baseURL: '',
  timeout: 60000
})

const searchCases = async () => {
  if (!keywordInput.value.trim()) {
    feedbackMessage.value = '请至少输入一个关键词'
    feedbackType.value = 'warning'
    showFeedback.value = true
    return
  }

  searchParams.keywordArr = keywordInput.value.split(',').map(k => k.trim()).filter(k => k)
  if (searchParams.keywordArr.length === 0) {
    feedbackMessage.value = '请至少输入一个有效的关键词'
    feedbackType.value = 'warning'
    showFeedback.value = true
    return
  }

  searchParams.pageNo = 1
  searched.value = true
  selectedCases.value = []

  loading.value = true

  try {
    const requestData = {
      pageNo: searchParams.pageNo,
      pageSize: searchParams.pageSize,
      sortField: searchParams.sortField,
      sortOrder: searchParams.sortOrder,
      condition: {
        keywordArr: searchParams.keywordArr
      }
    }

    if (searchParams.caseYearStart) {
      requestData.condition.caseYearStart = searchParams.caseYearStart
    }
    if (searchParams.caseYearEnd) {
      requestData.condition.caseYearEnd = searchParams.caseYearEnd
    }

    const response = await api.post(API_URL, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'appid': APP_ID,
        'secret': SECRET
      }
    })

    console.log('===== 类案检索 API 返回 =====')
    console.log('response:', response)

    if (response.data && response.data.body && response.data.body.data) {
      caseResults.value = response.data.body.data || []
      totalResults.value = response.data.body.totalCount || caseResults.value.length
      totalPages.value = response.data.body.totalPage || 1
    } else if (response.data && response.data.body && Array.isArray(response.data.body)) {
      caseResults.value = response.data.body
      totalResults.value = response.data.body.length
    } else if (Array.isArray(response.data)) {
      caseResults.value = response.data
      totalResults.value = response.data.length
    } else {
      caseResults.value = []
      totalResults.value = 0
    }

    if (caseResults.value.length > 0) {
      feedbackMessage.value = '检索成功！'
      feedbackType.value = 'success'
    } else {
      feedbackMessage.value = '未找到相似案例，请尝试调整关键词或时间范围'
      feedbackType.value = 'warning'
    }
    showFeedback.value = true
  } catch (error) {
    console.error('检索失败:', error)
    caseResults.value = []
    totalResults.value = 0
    feedbackMessage.value = '检索失败，请检查网络连接或稍后重试'
    feedbackType.value = 'error'
    showFeedback.value = true
  } finally {
    loading.value = false
  }
}

const prevPage = () => {
  if (searchParams.pageNo > 1) {
    searchParams.pageNo--
    performSearch()
  }
}

const nextPage = () => {
  if (searchParams.pageNo < totalPages.value) {
    searchParams.pageNo++
    performSearch()
  }
}

const goToPage = (page) => {
  searchParams.pageNo = page
  performSearch()
}

const performSearch = async () => {
  loading.value = true
  selectedCases.value = []

  try {
    const requestData = {
      pageNo: searchParams.pageNo,
      pageSize: searchParams.pageSize,
      sortField: searchParams.sortField,
      sortOrder: searchParams.sortOrder,
      condition: {
        keywordArr: searchParams.keywordArr
      }
    }

    if (searchParams.caseYearStart) {
      requestData.condition.caseYearStart = searchParams.caseYearStart
    }
    if (searchParams.caseYearEnd) {
      requestData.condition.caseYearEnd = searchParams.caseYearEnd
    }

    const response = await api.post(API_URL, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'appid': APP_ID,
        'secret': SECRET
      }
    })

    if (response.data && response.data.body && response.data.body.data) {
      caseResults.value = response.data.body.data || []
      totalResults.value = response.data.body.totalCount || caseResults.value.length
      totalPages.value = response.data.body.totalPage || 1
    } else if (response.data && response.data.body && Array.isArray(response.data.body)) {
      caseResults.value = response.data.body
      totalResults.value = response.data.body.length
    } else if (Array.isArray(response.data)) {
      caseResults.value = response.data
      totalResults.value = response.data.length
    } else {
      caseResults.value = []
      totalResults.value = 0
    }
  } catch (error) {
    console.error('检索失败:', error)
    caseResults.value = []
    totalResults.value = 0
  } finally {
    loading.value = false
  }
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

const showCaseDetail = (caseItem) => {
  detailCase.value = caseItem
}
</script>

<style scoped>
.case-page {
  min-height: calc(100vh - 60px);
  margin-top: 60px;
  background: #f5f7fa;
  padding: 24px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}

.page-header {
  width: 100%;
  margin-bottom: 24px;
  flex-shrink: 0;
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
  flex: 1;
  min-height: 0;
}

/* 左侧检索栏 */
.search-sidebar {
  width: 320px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  flex-shrink: 0;
  overflow-y: auto;
  max-height: calc(100vh - 140px);
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

.pagination-info {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.info-title {
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 8px;
}

.info-content {
  font-size: 13px;
  color: #374151;
  line-height: 1.6;
}

.info-content strong {
  color: #3b82f6;
}

/* 右侧结果区 */
.result-area {
  flex: 1;
  min-height: 600px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  flex: 1;
  min-height: 400px;
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
.results {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
  flex-shrink: 0;
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

.action-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.case-list-wrapper {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 8px;
  box-sizing: border-box;
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

.court-name {
  font-size: 13px;
  color: #9ca3af;
}

.case-date {
  font-size: 13px;
  color: #6b7280;
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

.type-badge.cause {
  background: #fef3c7;
  color: #d97706;
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

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  flex-shrink: 0;
}

.page-btn {
  padding: 8px 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  min-height: 36px;
}

.page-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #4b5563;
  padding: 0 12px;
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
  max-width: 900px;
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
  white-space: pre-wrap;
}

.case-content {
  font-size: 14px;
  color: #374151;
  line-height: 1.8;
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
  word-break: break-word;
}

.case-content :deep(em),
.case-title :deep(em),
.case-summary :deep(em) {
  color: #dc2626 !important;
  font-style: normal !important;
  font-weight: 700 !important;
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

/* 反馈对话框样式 */
.feedback-modal {
  max-width: 400px;
}

.feedback-modal .modal-body {
  text-align: center;
  padding: 32px 24px;
}

.feedback-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 20px;
}

.feedback-icon.success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
}

.feedback-icon.error {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
}

.feedback-icon.warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

.feedback-icon.info {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
}

.feedback-message {
  font-size: 16px;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.feedback-count {
  font-size: 14px;
  color: #4b5563;
  background: #f3f4f6;
  padding: 12px 20px;
  border-radius: 8px;
  display: inline-block;
}

.feedback-count strong {
  color: #3b82f6;
  font-size: 18px;
}

.modal-footer {
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
