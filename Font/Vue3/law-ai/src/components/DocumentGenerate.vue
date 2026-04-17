<template>
  <div class="document-page">
    <div class="page-header">
      <h1 class="page-title">法律文书生成</h1>
      <p class="page-desc">选择文书类型，填写相关信息，AI智能生成完整法律文书</p>
    </div>

    <div class="document-layout">
      <!-- 左侧：文书类型选择 -->
      <aside class="template-sidebar">
        <div class="sidebar-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          文书类型
        </div>
        <div class="template-list">
          <div 
            v-for="category in documentCategories" 
            :key="category.name"
            class="template-category"
          >
            <div class="category-name">{{ category.name }}</div>
            <div class="category-items">
              <div 
                v-for="doc in category.items" 
                :key="doc.type"
                class="template-item"
                :class="{ active: selectedType === doc.type }"
                @click="selectTemplate(doc)"
              >
                <span class="doc-icon" v-html="doc.icon"></span>
                <span class="doc-name">{{ doc.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 右侧：表单和结果 -->
      <main class="document-main">
        <!-- 未选择模板时 -->
        <div v-if="!selectedType" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          <h3>请选择要生成的文书类型</h3>
          <p>从左侧列表选择您需要的法律文书类型</p>
        </div>

        <!-- 已选择模板 -->
        <div v-else class="document-form">
          <div class="form-header">
            <h2 class="form-title">{{ currentDoc?.name }}</h2>
            <div class="form-header-actions">
              <button class="upload-file-btn" @click="triggerFileUpload" title="从文件导入内容">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                导入文件
              </button>
              <button class="change-btn" @click="resetSelection">重新选择</button>
            </div>
          </div>

          <!-- 动态表单 -->
          <div class="form-content">
            <div class="form-section" v-for="section in currentDoc?.sections" :key="section.title">
              <div class="section-header">
                <h3 class="section-title">{{ section.title }}</h3>
              </div>
              <div class="form-fields">
                <div 
                  v-for="field in section.fields" 
                  :key="field.name"
                  class="form-field"
                  :class="{ full: field.type === 'textarea' }"
                >
                  <label class="field-label">
                    {{ field.label }}
                    <span v-if="field.required" class="required">*</span>
                  </label>
                  <textarea 
                    v-if="field.type === 'textarea'"
                    v-model="formData[field.name]"
                    class="field-input textarea"
                    :placeholder="field.placeholder"
                    rows="3"
                  ></textarea>
                  <input 
                    v-else
                    v-model="formData[field.name]"
                    class="field-input"
                    :placeholder="field.placeholder"
                    type="text"
                  >
                </div>
              </div>
            </div>
            
            <!-- 隐藏的文件输入 -->
            <input 
              type="file" 
              ref="uploadFileInput" 
              @change="handleFileSelect"
              accept=".docx,.pdf,.txt,.md"
              style="display: none"
            >
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <button class="generate-btn" @click="generateDocument" :disabled="loading">
              <svg v-if="!loading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span class="loading-spinner" v-else></span>
              {{ loading ? '生成中...' : 'AI生成文书' }}
            </button>
          </div>

          <!-- 生成结果 -->
          <div v-if="generatedContent" class="result-section">
            <div class="result-header">
              <h3 class="result-title">生成结果</h3>
              <div class="result-actions">
                <button class="result-btn" @click="copyContent">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  复制
                </button>
                <button class="result-btn" @click="downloadDocx">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  下载DOCX
                </button>
                <button class="result-btn" @click="downloadTxt">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  下载TXT
                </button>
              </div>
            </div>
            <div class="result-content">
              <template v-for="(block, index) in contractBlocks" :key="`${block.type}-${index}`">
                <h3 v-if="block.type === 'title'" class="contract-title">{{ block.content }}</h3>
                <p v-else-if="block.type === 'clause'" class="contract-clause">{{ block.content }}</p>
                <p v-else-if="block.type === 'paragraph'" class="contract-paragraph">{{ block.content }}</p>
                <div v-else class="contract-spacing"></div>
              </template>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import axios from 'axios'
import { Document, Packer, Paragraph, HeadingLevel, AlignmentType } from 'docx'

const selectedType = ref(null)
const currentDoc = ref(null)
const loading = ref(false)
const generatedContent = ref('')
const formData = reactive({})

// 文件上传相关
const showFileUpload = ref(false)
const uploadFileInput = ref(null)
const uploadedFileContent = ref('')
const contractPlainText = ref('')

const api = axios.create({
  baseURL: '',
  timeout: 60000
})

// 触发文件选择
const triggerFileUpload = () => {
  uploadFileInput.value?.click()
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
  uploadedFileContent.value = '正在读取文件内容...'
  
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
    const filled = fillFormFromImportedText(content)
    if (filled > 0) {
      alert(`文件内容已导入并自动填充（已填充 ${filled} 项）`)
    } else {
      alert('文件内容已读取，但未能匹配到可自动填充的字段；已将全文填入主要文本域（如有）')
    }
  } catch (error) {
    console.error('文件读取失败:', error)
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

const contractBlocks = computed(() => formatContractText(contractPlainText.value))

const formatContractText = (text) => {
  if (!text) return []

  const rows = text.replace(/\r\n/g, '\n').split('\n')
  const blocks = []

  rows.forEach((row, index) => {
    const line = row.trim()
    if (!line) {
      if (index !== rows.length - 1) {
        blocks.push({ type: 'blank', content: '' })
      }
      return
    }

    if (isMainTitle(line, index)) {
      blocks.push({ type: 'title', content: line })
      return
    }

    if (isClauseLine(line)) {
      blocks.push({ type: 'clause', content: line })
      return
    }

    blocks.push({ type: 'paragraph', content: line })
  })

  return blocks
}

const isMainTitle = (line, lineIndex) => {
  if (lineIndex > 2) return false
  if (line.length > 28) return false
  return /合同|协议|申请书|起诉状|答辩状|委托书/.test(line)
}

const isClauseLine = (line) => {
  return (
    /^第[一二三四五六七八九十百零\d]+[章节条款]/.test(line) ||
    /^(\d+(\.\d+)*)([、.．)]\s*|\s+)/.test(line) ||
    /^[（(]\d+[)）]/.test(line)
  )
}

// 文书模板配置
const documentCategories = [
  {
    name: '劳动纠纷',
    items: [
      { type: 'labor_dispute', name: '劳动仲裁申请书', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>' },
      { type: 'labor_contract', name: '劳动合同', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>' },
      { type: 'labor_compensation', name: '经济补偿金申请书', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>' }
    ]
  },
  {
    name: '民事诉讼',
    items: [
      { type: 'civil_complaint', name: '民事起诉状', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path></svg>' },
      { type: 'civil_defense', name: '民事答辩状', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path></svg>' },
      { type: 'civil_proxy', name: '授权委托书', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>' }
    ]
  },
  {
    name: '合同类',
    items: [
      { type: 'purchase_contract', name: '买卖合同', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>' },
      { type: 'lease_contract', name: '租赁合同', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>' },
      { type: 'loan_contract', name: '借款合同', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>' }
    ]
  }
]

// 文书模板详情
const documentTemplates = {
  labor_dispute: {
    name: '劳动仲裁申请书',
    sections: [
      {
        title: '申请人信息',
        fields: [
          { name: 'applicant_name', label: '姓名', placeholder: '输入申请人姓名', required: true },
          { name: 'applicant_phone', label: '联系电话', placeholder: '输入联系电话', required: true },
          { name: 'applicant_address', label: '地址', placeholder: '输入详细地址' }
        ]
      },
      {
        title: '被申请人信息',
        fields: [
          { name: 'respondent_name', label: '公司名称', placeholder: '输入被申请人公司名称', required: true },
          { name: 'respondent_address', label: '注册地址', placeholder: '输入公司注册地址' }
        ]
      },
      {
        title: '仲裁请求',
        fields: [
          { name: 'claims', label: '仲裁请求事项', placeholder: '请详细描述您的仲裁请求', type: 'textarea', required: true }
        ]
      },
      {
        title: '事实与理由',
        fields: [
          { name: 'facts', label: '事实经过', placeholder: '请详细描述劳动纠纷的事实经过', type: 'textarea', required: true },
          { name: 'reason', label: '理由', placeholder: '说明申请仲裁的法律依据', type: 'textarea', required: true }
        ]
      }
    ]
  },
  // ===== 新增：劳动合同 =====
  labor_contract: {
    name: '劳动合同',
    sections: [
      {
        title: '合同双方信息',
        fields: [
          { name: 'party_a_name', label: '用人单位名称（甲方）', placeholder: '输入用人单位名称', required: true },
          { name: 'party_a_address', label: '甲方住所/地址', placeholder: '输入甲方住所/地址' },
          { name: 'party_a_legal', label: '法定代表人/负责人', placeholder: '输入法定代表人/负责人' },
          { name: 'party_b_name', label: '劳动者姓名（乙方）', placeholder: '输入劳动者姓名', required: true },
          { name: 'party_b_id', label: '身份证号', placeholder: '输入乙方身份证号', required: true },
          { name: 'party_b_phone', label: '联系电话', placeholder: '输入乙方联系电话', required: true }
        ]
      },
      {
        title: '合同期限与试用期',
        fields: [
          { name: 'contract_term', label: '合同期限', placeholder: '如：固定期限/无固定期限/以完成一定工作任务为期限', required: true },
          { name: 'start_date', label: '开始日期', placeholder: '如：2026-04-17', required: true },
          { name: 'end_date', label: '结束日期', placeholder: '如：2027-04-16（无固定期限可填“无”）', required: true },
          { name: 'probation', label: '试用期', placeholder: '如：1个月（无试用期填“无”）', required: true }
        ]
      },
      {
        title: '岗位、工作地点与工作时间',
        fields: [
          { name: 'position', label: '工作岗位', placeholder: '输入岗位名称', required: true },
          { name: 'workplace', label: '工作地点', placeholder: '输入工作地点', required: true },
          { name: 'work_hours', label: '工作时间制度', placeholder: '标准工时/综合计算/不定时', required: true },
          { name: 'job_duties', label: '工作内容/职责', placeholder: '简要描述岗位职责', type: 'textarea', required: true }
        ]
      },
      {
        title: '薪酬福利与社会保险',
        fields: [
          { name: 'salary', label: '薪酬标准', placeholder: '如：月薪12000元（税前/税后）', required: true },
          { name: 'salary_day', label: '发薪日', placeholder: '如：每月10日', required: true },
          { name: 'bonus', label: '奖金/绩效', placeholder: '如：按公司制度执行' },
          { name: 'insurance', label: '社会保险与公积金', placeholder: '五险一金缴纳约定', type: 'textarea', required: true }
        ]
      },
      {
        title: '其他约定（可选）',
        fields: [
          { name: 'confidentiality', label: '保密/竞业限制', placeholder: '如：是否约定、期限、补偿标准', type: 'textarea' },
          { name: 'termination', label: '解除与终止', placeholder: '解除条件、通知期限、补偿等', type: 'textarea' }
        ]
      }
    ]
  },

  // ===== 新增：经济补偿金申请书 =====
  labor_compensation: {
    name: '经济补偿金申请书',
    sections: [
      {
        title: '申请人信息',
        fields: [
          { name: 'applicant_name', label: '姓名', placeholder: '输入申请人姓名', required: true },
          { name: 'applicant_id', label: '身份证号', placeholder: '输入身份证号', required: true },
          { name: 'applicant_phone', label: '联系电话', placeholder: '输入联系电话', required: true },
          { name: 'applicant_address', label: '地址', placeholder: '输入详细地址' }
        ]
      },
      {
        title: '被申请人信息',
        fields: [
          { name: 'respondent_name', label: '公司名称', placeholder: '输入被申请人公司名称', required: true },
          { name: 'respondent_address', label: '注册地址', placeholder: '输入公司注册地址' },
          { name: 'respondent_legal', label: '法定代表人/负责人', placeholder: '输入法定代表人/负责人' }
        ]
      },
      {
        title: '请求事项',
        fields: [
          { name: 'claims', label: '经济补偿请求', placeholder: '如：请求支付经济补偿金、赔偿金等（可分条列出）', type: 'textarea', required: true },
          { name: 'amount', label: '请求金额', placeholder: '如：人民币XX元', required: true }
        ]
      },
      {
        title: '事实与理由',
        fields: [
          { name: 'employment_period', label: '工作起止时间', placeholder: '如：2020-01-01 至 2026-04-01', required: true },
          { name: 'position', label: '岗位/工种', placeholder: '输入岗位信息' },
          { name: 'salary', label: '工资标准', placeholder: '如：月薪XX元', required: true },
          { name: 'facts', label: '事实经过', placeholder: '描述劳动关系、解除/终止过程、证据线索等', type: 'textarea', required: true },
          { name: 'legal_basis', label: '法律依据', placeholder: '列明适用条款（如劳动合同法相关规定）', type: 'textarea', required: true }
        ]
      }
    ]
  },
  civil_complaint: {
    name: '民事起诉状',
    sections: [
      {
        title: '当事人信息',
        fields: [
          { name: 'plaintiff_name', label: '原告姓名', placeholder: '输入原告姓名', required: true },
          { name: 'plaintiff_id', label: '身份证号', placeholder: '输入原告身份证号', required: true },
          { name: 'defendant_name', label: '被告姓名', placeholder: '输入被告姓名', required: true },
          { name: 'defendant_id', label: '被告身份证号', placeholder: '输入被告身份证号', required: true }
        ]
      },
      {
        title: '诉讼请求',
        fields: [
          { name: 'claims', label: '诉讼请求', placeholder: '请详细列出诉讼请求', type: 'textarea', required: true }
        ]
      },
      {
        title: '事实与理由',
        fields: [
          { name: 'facts', label: '事实经过', placeholder: '请详细描述案件事实', type: 'textarea', required: true },
          { name: 'legal_basis', label: '法律依据', placeholder: '请列明适用的法律条款', type: 'textarea', required: true }
        ]
      }
    ]
  },
  // ===== 新增：民事答辩状 =====
  civil_defense: {
    name: '民事答辩状',
    sections: [
      {
        title: '当事人信息',
        fields: [
          { name: 'defendant_name', label: '答辩人（被告）姓名/名称', placeholder: '输入答辩人姓名/名称', required: true },
          { name: 'defendant_id', label: '身份证号/统一社会信用代码', placeholder: '输入证件号码', required: true },
          { name: 'defendant_address', label: '住所/地址', placeholder: '输入住所/地址' },
          { name: 'plaintiff_name', label: '原告姓名/名称', placeholder: '输入原告姓名/名称', required: true }
        ]
      },
      {
        title: '答辩请求',
        fields: [
          { name: 'claims', label: '答辩请求', placeholder: '如：请求驳回原告诉讼请求/部分请求等', type: 'textarea', required: true }
        ]
      },
      {
        title: '事实与理由',
        fields: [
          { name: 'facts', label: '事实陈述', placeholder: '围绕争议焦点陈述事实与证据', type: 'textarea', required: true },
          { name: 'reasons', label: '答辩理由', placeholder: '阐述法律依据、抗辩事由', type: 'textarea', required: true },
          { name: 'evidence', label: '证据目录（可选）', placeholder: '列明证据名称、来源、证明目的', type: 'textarea' }
        ]
      }
    ]
  },
  civil_proxy: {
    name: '授权委托书',
    sections: [
      {
        title: '委托人信息',
        fields: [
          { name: 'client_name', label: '委托人姓名', placeholder: '输入委托人姓名', required: true },
          { name: 'client_id', label: '委托人身份证号', placeholder: '输入身份证号', required: true }
        ]
      },
      {
        title: '受托人信息',
        fields: [
          { name: 'agent_name', label: '受托人姓名', placeholder: '输入受托人姓名', required: true },
          { name: 'agent_phone', label: '受托人联系电话', placeholder: '输入联系电话', required: true }
        ]
      },
      {
        title: '委托事项',
        fields: [
          { name: 'matters', label: '委托事项', placeholder: '请明确授权委托的具体事项', type: 'textarea', required: true },
          { name: 'scope', label: '代理权限', placeholder: '一般代理/特别授权', required: true }
        ]
      }
    ]
  }
  ,
  // ===== 新增：买卖合同 =====
  purchase_contract: {
    name: '买卖合同',
    sections: [
      {
        title: '合同双方信息',
        fields: [
          { name: 'buyer_name', label: '买方（甲方）名称/姓名', placeholder: '输入买方名称/姓名', required: true },
          { name: 'buyer_id', label: '甲方证件号/统一社会信用代码', placeholder: '输入证件号码', required: true },
          { name: 'buyer_address', label: '甲方地址', placeholder: '输入甲方地址' },
          { name: 'seller_name', label: '卖方（乙方）名称/姓名', placeholder: '输入卖方名称/姓名', required: true },
          { name: 'seller_id', label: '乙方证件号/统一社会信用代码', placeholder: '输入证件号码', required: true },
          { name: 'seller_address', label: '乙方地址', placeholder: '输入乙方地址' }
        ]
      },
      {
        title: '标的物与交付',
        fields: [
          { name: 'subject_matter', label: '标的物名称/规格', placeholder: '如：设备/货物名称、型号规格等', type: 'textarea', required: true },
          { name: 'quantity', label: '数量', placeholder: '如：10台/100件', required: true },
          { name: 'quality', label: '质量标准/验收', placeholder: '质量标准、验收方式、期限', type: 'textarea', required: true },
          { name: 'delivery', label: '交付方式与地点', placeholder: '交付地点、运输方式、风险转移', type: 'textarea', required: true }
        ]
      },
      {
        title: '价款与支付',
        fields: [
          { name: 'price', label: '总价款', placeholder: '如：人民币XX元', required: true },
          { name: 'payment_method', label: '支付方式', placeholder: '转账/现金/分期等', required: true },
          { name: 'payment_schedule', label: '支付节点', placeholder: '如：签约付XX%，交付验收后付XX%', type: 'textarea', required: true },
          { name: 'invoice', label: '发票/税费', placeholder: '是否开票、税费承担', type: 'textarea' }
        ]
      },
      {
        title: '违约责任与争议解决',
        fields: [
          { name: 'breach', label: '违约责任', placeholder: '逾期交付/逾期付款/质量问题等责任', type: 'textarea', required: true },
          { name: 'dispute', label: '争议解决', placeholder: '管辖法院/仲裁机构、适用法律', type: 'textarea', required: true }
        ]
      }
    ]
  },

  // ===== 新增：租赁合同 =====
  lease_contract: {
    name: '租赁合同',
    sections: [
      {
        title: '合同双方信息',
        fields: [
          { name: 'lessor_name', label: '出租方（甲方）名称/姓名', placeholder: '输入出租方名称/姓名', required: true },
          { name: 'lessor_id', label: '甲方证件号/统一社会信用代码', placeholder: '输入证件号码', required: true },
          { name: 'lessee_name', label: '承租方（乙方）名称/姓名', placeholder: '输入承租方名称/姓名', required: true },
          { name: 'lessee_id', label: '乙方证件号/统一社会信用代码', placeholder: '输入证件号码', required: true }
        ]
      },
      {
        title: '租赁标的与期限',
        fields: [
          { name: 'lease_object', label: '租赁物/房屋信息', placeholder: '地址、面积、用途/设备信息等', type: 'textarea', required: true },
          { name: 'lease_term', label: '租赁期限', placeholder: '如：2026-05-01 至 2027-04-30', required: true },
          { name: 'handover', label: '交付与返还', placeholder: '交付时间、返还条件、设施清单等', type: 'textarea', required: true }
        ]
      },
      {
        title: '租金与押金',
        fields: [
          { name: 'rent', label: '租金标准', placeholder: '如：每月XX元', required: true },
          { name: 'deposit', label: '押金', placeholder: '如：押金XX元', required: true },
          { name: 'pay_cycle', label: '支付周期与方式', placeholder: '按月/季/年支付，转账等', type: 'textarea', required: true }
        ]
      },
      {
        title: '使用、维修与费用承担',
        fields: [
          { name: 'use_rules', label: '使用约定', placeholder: '用途限制、转租、装修等', type: 'textarea', required: true },
          { name: 'maintenance', label: '维修责任', placeholder: '维修范围、通知与处理时限', type: 'textarea', required: true },
          { name: 'fees', label: '费用承担', placeholder: '水电物业网费等承担方式', type: 'textarea' }
        ]
      },
      {
        title: '违约责任与争议解决',
        fields: [
          { name: 'breach', label: '违约责任', placeholder: '逾期付款、擅自转租、提前解约等', type: 'textarea', required: true },
          { name: 'dispute', label: '争议解决', placeholder: '管辖法院/仲裁机构、适用法律', type: 'textarea', required: true }
        ]
      }
    ]
  },

  // ===== 新增：借款合同 =====
  loan_contract: {
    name: '借款合同',
    sections: [
      {
        title: '合同双方信息',
        fields: [
          { name: 'lender_name', label: '出借人（甲方）姓名/名称', placeholder: '输入出借人姓名/名称', required: true },
          { name: 'lender_id', label: '甲方证件号/统一社会信用代码', placeholder: '输入证件号码', required: true },
          { name: 'borrower_name', label: '借款人（乙方）姓名/名称', placeholder: '输入借款人姓名/名称', required: true },
          { name: 'borrower_id', label: '乙方证件号/统一社会信用代码', placeholder: '输入证件号码', required: true }
        ]
      },
      {
        title: '借款金额与用途',
        fields: [
          { name: 'amount', label: '借款金额', placeholder: '如：人民币XX元', required: true },
          { name: 'purpose', label: '借款用途', placeholder: '如：经营周转/消费等', required: true },
          { name: 'disbursement', label: '出借方式', placeholder: '转账账户、支付时间等', type: 'textarea', required: true }
        ]
      },
      {
        title: '期限、利息与还款',
        fields: [
          { name: 'term', label: '借款期限', placeholder: '如：2026-05-01 至 2026-11-01', required: true },
          { name: 'interest', label: '利息/利率', placeholder: '如：年利率X%（无息填“无”）', required: true },
          { name: 'repayment', label: '还款方式与计划', placeholder: '一次性/分期，具体节点', type: 'textarea', required: true }
        ]
      },
      {
        title: '担保（可选）与违约责任',
        fields: [
          { name: 'guarantee', label: '担保条款（可选）', placeholder: '保证人/抵押/质押等', type: 'textarea' },
          { name: 'breach', label: '违约责任', placeholder: '逾期还款、提前到期、违约金等', type: 'textarea', required: true },
          { name: 'dispute', label: '争议解决', placeholder: '管辖法院/仲裁机构、适用法律', type: 'textarea', required: true }
        ]
      }
    ]
  }
}

const getTemplateRequiredMissing = () => {
  const tpl = currentDoc.value
  if (!tpl?.sections?.length) return []
  const missing = []

  tpl.sections.forEach((section) => {
    section.fields?.forEach((field) => {
      if (!field.required) return
      const v = formData[field.name]
      if (v === undefined || v === null || String(v).trim() === '') {
        missing.push(field.label)
      }
    })
  })

  return missing
}

const initFormDataFromTemplate = () => {
  const tpl = currentDoc.value
  if (!tpl?.sections?.length) return
  tpl.sections.forEach((section) => {
    section.fields?.forEach((field) => {
      if (formData[field.name] === undefined) {
        formData[field.name] = ''
      }
    })
  })
}

const normalizeImportedText = (text) => {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .trim()
}

const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getAllFields = () => {
  const tpl = currentDoc.value
  if (!tpl?.sections?.length) return []
  const fields = []
  tpl.sections.forEach((section) => {
    section.fields?.forEach((f) => fields.push(f))
  })
  return fields
}

const fillFormFromImportedText = (rawText) => {
  if (!currentDoc.value) return 0
  const text = normalizeImportedText(rawText)
  if (!text) return 0

  const fields = getAllFields()
  if (!fields.length) return 0

  let filledCount = 0
  const matched = new Set()

  // 1) 规则：按 “字段标签/字段名：值” 匹配，支持中文冒号/英文冒号
  fields.forEach((field) => {
    const label = field.label || ''
    const name = field.name || ''
    const candidates = [label, name].filter(Boolean)

    for (const key of candidates) {
      const keyEsc = escapeRegExp(key)
      const re = new RegExp(`(?:^|\\n)\\s*${keyEsc}\\s*[：:]\\s*([^\\n]+)`, 'i')
      const m = text.match(re)
      if (m && m[1]) {
        const v = m[1].trim()
        if (v) {
          formData[field.name] = v
          if (!matched.has(field.name)) {
            matched.add(field.name)
            filledCount += 1
          }
        }
        break
      }
    }
  })

  // 2) 常见语义兜底：把全文填入“主要文本域”（请求/事实/理由/委托事项等）
  if (filledCount === 0) {
    const preferNames = [
      'claims',
      'facts',
      'reason',
      'legal_basis',
      'matters',
      'job_duties',
      'subject_matter',
      'quality',
      'delivery',
      'payment_schedule',
      'lease_object',
      'handover',
      'use_rules',
      'maintenance',
      'disbursement',
      'repayment',
      'breach',
      'dispute'
    ]

    const fieldByName = new Map(fields.map((f) => [f.name, f]))
    const target =
      preferNames.find((n) => fieldByName.has(n) && (fieldByName.get(n).type === 'textarea' || true)) ||
      fields.find((f) => f.type === 'textarea')?.name ||
      null

    if (target) {
      formData[target] = text
    }
  }

  return filledCount
}

const resetSelection = () => {
  selectedType.value = null
  currentDoc.value = null
  generatedContent.value = ''
  contractPlainText.value = ''
  uploadedFileContent.value = ''
  Object.keys(formData).forEach((key) => delete formData[key])
  if (uploadFileInput.value) uploadFileInput.value.value = ''
}

// 选择模板
const selectTemplate = (doc) => {
  selectedType.value = doc.type
  currentDoc.value = documentTemplates[doc.type] || null
  generatedContent.value = ''
  contractPlainText.value = ''
  // 重置表单数据
  Object.keys(formData).forEach(key => delete formData[key])
  if (!currentDoc.value) {
    alert('该文书模板暂未配置，请选择其他类型')
    selectedType.value = null
    return
  }
  initFormDataFromTemplate()
}

// 生成文书
const generateDocument = async () => {
  if (!currentDoc.value) return

  const missing = getTemplateRequiredMissing()
  if (missing.length) {
    alert(`请先填写必填项：${missing.slice(0, 6).join('、')}${missing.length > 6 ? '...' : ''}`)
    return
  }

  loading.value = true
  
  try {
    const plainInput = Object.entries(formData)
      .map(([key, value]) => `${key}: ${value ?? ''}`)
      .join('\n')

    const response = await api.post('/api/yuanqi/chat', {
      message: `请根据以下信息生成一份${currentDoc.value.name}（输出要求：标题居中、分段清晰、条款编号规范、内容完整可直接作为正式文书使用）：\n${plainInput}`,
      history: []
    })

    const answerText = String(response.data?.answer || '').trim()
    contractPlainText.value = answerText
    generatedContent.value = answerText
  } catch (error) {
    console.error('生成失败:', error)
    alert('生成失败，请重试')
  } finally {
    loading.value = false
  }
}

// 复制内容
const copyContent = () => {
  const text = contractPlainText.value
  navigator.clipboard.writeText(text).then(() => {
    alert('已复制到剪贴板')
  })
}

const buildFileName = (ext) => {
  const date = new Date().toISOString().slice(0, 10)
  return `${currentDoc.value?.name || '合同文书'}_${date}.${ext}`
}

const triggerDownload = (blob, fileName) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

const downloadTxt = () => {
  const blob = new Blob([contractPlainText.value], { type: 'text/plain;charset=utf-8' })
  triggerDownload(blob, buildFileName('txt'))
}

const downloadDocx = async () => {
  if (!contractBlocks.value.length) {
    alert('暂无可导出的内容')
    return
  }

  const paragraphs = contractBlocks.value.map((block) => {
    if (block.type === 'title') {
      return new Paragraph({
        text: block.content,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER
      })
    }

    if (block.type === 'clause') {
      return new Paragraph({
        text: block.content,
        spacing: { before: 160, after: 80 }
      })
    }

    if (block.type === 'blank') {
      return new Paragraph({ text: '' })
    }

    return new Paragraph({
      text: block.content,
      spacing: { before: 80, after: 80 }
    })
  })

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs
      }
    ]
  })

  const blob = await Packer.toBlob(doc)
  triggerDownload(blob, buildFileName('docx'))
}
</script>

<style scoped>
.document-page {
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

.document-layout {
  width: 100%;
  display: flex;
  gap: 24px;
  box-sizing: border-box;
}

/* 左侧模板选择 */
.template-sidebar {
  width: 280px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 84px;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.template-category {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-name {
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.template-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: #333333;
  font-size: 14px;
  transition: all 0.2s;
}

.template-item:hover {
  background: #f3f4f6;
}

.template-item.active {
  background: #e0e7ff;
  color: #4f46e5;
}

.doc-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.template-item.active .doc-icon {
  color: #4f46e5;
}

/* 右侧表单 */
.document-main {
  flex: 1;
  min-height: 600px;
}

.empty-state {
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

.empty-state h3 {
  font-size: 18px;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #9ca3af;
  margin: 0;
}

.document-form {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-sizing: border-box;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.form-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.change-btn {
  padding: 8px 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  color: #4b5563;
  font-size: 14px;
  cursor: pointer;
}

.change-btn:hover {
  background: #e5e7eb;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 1px dashed #e5e7eb;
}

.section-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.upload-file-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  color: #0284c7;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-file-btn:hover {
  background: #e0f2fe;
}

.form-fields {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field.full {
  grid-column: 1 / -1;
}

.field-label {
  font-size: 13px;
  color: #4b5563;
  font-weight: 500;
}

.required {
  color: #ef4444;
}

.field-input {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
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

.form-actions {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
}

.generate-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.generate-btn:disabled {
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
  margin-top: 32px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.result-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.result-actions {
  display: flex;
  gap: 8px;
}

.result-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #4b5563;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.result-btn:hover {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}

.result-content {
  padding: 24px;
  font-size: 14px;
  line-height: 1.8;
  color: #333333;
  max-height: 500px;
  overflow-y: auto;
  word-break: break-word;
}

.contract-title {
  margin: 0 0 16px 0;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.contract-clause {
  margin: 16px 0 8px 0;
  font-weight: 600;
  color: #111827;
}

.contract-paragraph {
  margin: 8px 0;
  text-indent: 2em;
}

.contract-spacing {
  height: 8px;
}

/* 平板端适配 */
@media (max-width: 1024px) {
  .document-page {
    padding: 16px;
  }

  .document-layout {
    gap: 16px;
  }

  .template-sidebar {
    width: 240px;
    padding: 16px;
  }

  .document-form {
    padding: 20px;
  }

  .form-fields {
    grid-template-columns: 1fr;
  }

  .form-field.full {
    grid-column: 1;
  }
}

/* 移动端适配 */
@media (max-width: 767px) {
  .document-page {
    padding: 12px;
  }

  .page-header {
    margin-bottom: 16px;
  }

  .page-title {
    font-size: 20px;
  }

  .document-layout {
    flex-direction: column;
  }

  .template-sidebar {
    width: 100%;
    position: static;
    padding: 16px;
  }

  .template-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .template-category {
    gap: 6px;
  }

  .category-name {
    font-size: 12px;
    grid-column: 1 / -1;
  }

  .category-items {
    grid-column: 1 / -1;
  }

  .template-item {
    padding: 10px;
    font-size: 13px;
  }

  .doc-icon {
    display: none;
  }

  .doc-name {
    text-align: center;
  }

  .document-main {
    min-height: auto;
  }

  .empty-state {
    padding: 48px 20px;
  }

  .empty-icon {
    width: 48px;
    height: 48px;
  }

  .empty-state h3 {
    font-size: 16px;
  }

  .document-form {
    padding: 16px;
    border-radius: 12px;
    max-height: none;
    overflow-y: visible;
  }

  .form-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .form-title {
    font-size: 18px;
  }

  .change-btn {
    width: 100%;
    text-align: center;
  }

  .form-section {
    gap: 8px;
  }

  .section-title {
    font-size: 14px;
  }

  .form-actions {
    margin-top: 16px;
    padding-top: 16px;
  }

  .generate-btn {
    width: 100%;
    padding: 14px 20px;
    font-size: 15px;
  }

  .result-section {
    margin-top: 24px;
    border-radius: 12px;
  }

  .result-header {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }

  .result-title {
    font-size: 15px;
  }

  .result-actions {
    width: 100%;
    flex-direction: column;
  }

  .result-btn {
    width: 100%;
    justify-content: center;
  }

  .result-content {
    padding: 16px;
    max-height: 400px;
    font-size: 13px;
  }
}
</style>
