<script setup>
import { ref, reactive } from 'vue'
import axios from 'axios'

const currentStep = ref(0)
const loading = ref(false)
const analysisResult = ref(null)

const formData = reactive({
  caseType: '',
  caseCategory: '',
  plaintiff: '',
  defendant: '',
  disputeFocus: '',
  caseDescription: '',
  evidence: [],
  evidenceNote: '',
  coreClaims: '',
  expectedResult: '',
  additionalInfo: ''
})

const steps = [
  { title: '案件信息' },
  { title: '事实与证据' },
  { title: '用户诉求' },
  { title: '分析结果' }
]

const api = axios.create({
  baseURL: '',
  timeout: 60000
})

const addEvidence = () => {
  formData.evidence.push({
    name: '',
    type: '原件',
    effect: ''
  })
}

const removeEvidence = (index) => {
  formData.evidence.splice(index, 1)
}

const nextStep = () => {
  if (currentStep.value === 0 && !formData.disputeFocus) {
    alert('请填写争议焦点')
    return
  }
  if (currentStep.value === 1 && !formData.caseDescription) {
    alert('请填写案情描述')
    return
  }
  if (currentStep.value === 2 && !formData.coreClaims) {
    alert('请填写核心诉求')
    return
  }
  currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const submitAnalysis = async () => {
  if (!formData.coreClaims) {
    alert('请填写核心诉求')
    return
  }

  loading.value = true
  
  try {
    const query = `
案件类型：${formData.caseType} / ${formData.caseCategory}
原告/申请人：${formData.plaintiff || '未填写'}
被告/被申请人：${formData.defendant || '未填写'}
争议焦点：${formData.disputeFocus}
案情描述：${formData.caseDescription}
证据清单：${formData.evidence.map(e => `${e.name}(${e.type},${e.effect})`).join('; ') || '无'}
证据效力说明：${formData.evidenceNote || '无'}
核心诉求：${formData.coreClaims}
期望结果：${formData.expectedResult || '未填写'}
补充说明：${formData.additionalInfo || '无'}
    `.trim()
    
    const response = await api.post('/api/yuanqi/chat', {
      message: `请对以下案件进行全面分析，返回JSON格式结果：

${query}

请从以下六个维度生成完整的案件分析报告（必须严格JSON格式）：
1. legalRelationship: 案件核心法律关系梳理（法律关系定性、主体分析、权利义务关系）
2. evidenceAnalysis: 现有证据的优势与不足分析
3. riskPrediction: 潜在法律风险与争议点预判
4. strategy: 最优维权/应对策略建议
5. solutionComparison: 不同解决方案（协商/调解/诉讼）的利弊对比
6. complexity: 案件复杂度评估（简单/中等/复杂）
7. cost: 预估处理成本
8. duration: 预估处理周期

返回格式（必须严格JSON格式）：
{
  "legalRelationship": "分析内容...",
  "evidenceAnalysis": "分析内容...",
  "riskPrediction": "分析内容...",
  "strategy": "分析内容...",
  "solutionComparison": "分析内容...",
  "complexity": "简单/中等/复杂",
  "cost": "预估成本",
  "duration": "预估周期"
}`,
      history: []
    })
    
    // 尝试解析JSON
    try {
      const jsonMatch = response.data.answer.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisResult.value = JSON.parse(jsonMatch[0])
      } else {
        analysisResult.value = generateMockResult()
      }
    } catch {
      analysisResult.value = generateMockResult()
    }
    
    currentStep.value = 3
  } catch (error) {
    console.error('分析失败:', error)
    analysisResult.value = generateMockResult()
    currentStep.value = 3
  } finally {
    loading.value = false
  }
}

const generateMockResult = () => {
  return {
    complexity: '中等',
    cost: '约1-3万元（含诉讼费、律师费等）',
    duration: '一审约6个月，二审约3个月',
    legalRelationship: `根据您提供的案件信息，初步法律关系梳理如下：<br><br>
1. <strong>法律关系定性</strong>：本案涉及${formData.caseType || '相关'}法律关系，需要进一步明确具体的权利义务内容。<br><br>
2. <strong>主体分析</strong>：
   - 原告/申请人：${formData.plaintiff || '待明确'}<br>
   - 被告/被申请人：${formData.defendant || '待明确'}<br><br>
3. <strong>权利义务关系</strong>：双方之间存在${formData.disputeFocus ? '围绕' + formData.disputeFocus + '的' : ''}争议，需根据证据材料进一步认定。`,
    evidenceAnalysis: `现有证据情况分析：<br><br>
1. <strong>证据优势</strong>：<br>
   - ${formData.evidence.length > 0 ? '您已准备了' + formData.evidence.length + '项证据，具备一定证据基础' : '建议尽快收集和固定相关证据'}<br>
   - 建议确保证据的真实性、合法性和关联性<br><br>
2. <strong>证据不足之处</strong>：<br>
   - 部分关键事实可能缺乏直接证据支持<br>
   - 建议补充书面证据或证人证言<br><br>
3. <strong>证据完善建议</strong>：<br>
   - 梳理现有证据链条，查找缺失环节<br>
   - 及时固定电子数据等易灭失证据`,
    riskPrediction: `本案可能存在的法律风险与争议点：<br><br>
1. <strong>事实认定风险</strong>：<br>
   - 部分关键事实可能存在证据不足的情况<br>
   - 对方可能提出不同的陈述或反证<br><br>
2. <strong>法律适用风险</strong>：<br>
   - 相关法律条文可能存在多种理解<br>
   - 司法实践中对某些问题的裁判尺度不一<br><br>
3. <strong>执行风险</strong>：<br>
   - 即使胜诉，对方可能无财产可供执行<br>
   - 建议诉前申请财产保全`,
    strategy: `建议采取以下维权/应对策略：<br><br>
1. <strong>诉前准备</strong>：<br>
   - 全面梳理案件事实和证据材料<br>
   - 明确诉讼请求和诉讼策略<br>
   - 评估是否需要申请诉前财产保全<br><br>
2. <strong>诉中应对</strong>：<br>
   - 按时参加庭审，充分行使诉讼权利<br>
   - 做好举证、质证工作<br>
   - 必要时申请鉴定或调查取证<br><br>
3. <strong>多元化解决</strong>：<br>
   - 可考虑先与对方协商或申请调解<br>
   - 节省时间和诉讼成本`,
    solutionComparison: `针对您的案件，提供以下解决方案的利弊对比：<br><br>
1. <strong>协商和解</strong><br>
   - 优点：节省时间成本，保密性好，关系破坏小<br>
   - 缺点：可能需要做出一定让步，结果不确定<br>
   - 适用：对方有协商意愿，争议不大<br><br>
2. <strong>人民调解/行业调解</strong><br>
   - 优点：成本低，效率高，有法律效力<br>
   - 缺点：需双方同意，调解不成仍需诉讼<br>
   - 适用：争议金额适中，希望快速解决<br><br>
3. <strong>诉讼/仲裁</strong><br>
   - 优点：具有强制执行力，结果有保障<br>
   - 缺点：周期长，成本高，程序复杂<br>
   - 适用：对方无协商意愿，争议金额较大`
  }
}

const formatContent = (content) => {
  if (!content) return ''
  return content.replace(/\n/g, '<br>')
}

const exportReport = () => {
  if (!analysisResult.value) return
  
  const content = `
案件分析报告
生成时间：${new Date().toLocaleString()}

一、案件基本信息
案由：${formData.caseType}
案件类型：${formData.caseCategory}
原告/申请人：${formData.plaintiff || '未填写'}
被告/被申请人：${formData.defendant || '未填写'}
争议焦点：${formData.disputeFocus}

二、案情描述
${formData.caseDescription}

三、证据情况
${formData.evidence.map(e => `- ${e.name} (${e.type}, ${e.effect})`).join('\n') || '无'}
证据效力说明：${formData.evidenceNote || '无'}

四、核心诉求
${formData.coreClaims}

五、期望结果
${formData.expectedResult || '未填写'}

六、分析报告

案件复杂度：${analysisResult.value.complexity}
预估处理成本：${analysisResult.value.cost}
预估处理周期：${analysisResult.value.duration}

案件核心法律关系梳理：
${analysisResult.value.legalRelationship?.replace(/<[^>]*>/g, '') || '无'}

现有证据的优势与不足分析：
${analysisResult.value.evidenceAnalysis?.replace(/<[^>]*>/g, '') || '无'}

潜在法律风险与争议点预判：
${analysisResult.value.riskPrediction?.replace(/<[^>]*>/g, '') || '无'}

最优维权/应对策略建议：
${analysisResult.value.strategy?.replace(/<[^>]*>/g, '') || '无'}

不同解决方案的利弊对比：
${analysisResult.value.solutionComparison?.replace(/<[^>]*>/g, '') || '无'}

---
本报告由AI法律助手生成，仅供参考。具体法律问题请咨询专业律师。
  `.trim()
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `案件分析报告_${new Date().toLocaleDateString()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
</script>


<template>
  <div class="evaluate-page">
    <div class="page-header">
      <h1 class="page-title">案件分析</h1>
      <p class="page-desc">输入案件信息，AI智能分析案件走向、法律风险与应对策略</p>
    </div>

    <div class="evaluate-container">
      <!-- 步骤指示器 -->
      <div class="steps-indicator">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="step"
          :class="{ active: currentStep === index, completed: currentStep > index }"
        >
          <div class="step-number">
            <svg v-if="currentStep > index" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="step-title">{{ step.title }}</span>
        </div>
      </div>

      <!-- 步骤内容 -->
      <div class="step-content">
        <!-- 步骤1：案件基础信息 -->
        <div v-if="currentStep === 0" class="step-panel">
          <h2 class="panel-title">案件基础信息</h2>
          <div class="form-grid">
            <div class="form-field">
              <label class="field-label">
                案由 <span class="required">*</span>
              </label>
              <select v-model="formData.caseType" class="field-input">
                <option value="">请选择案由</option>
                <option value="劳动争议">劳动争议</option>
                <option value="合同纠纷">合同纠纷</option>
                <option value="物权纠纷">物权纠纷</option>
                <option value="侵权责任">侵权责任</option>
                <option value="婚姻家庭">婚姻家庭</option>
                <option value="债务纠纷">债务纠纷</option>
                <option value="知识产权">知识产权纠纷</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <div class="form-field">
              <label class="field-label">
                案件类型 <span class="required">*</span>
              </label>
              <select v-model="formData.caseCategory" class="field-input">
                <option value="">请选择案件类型</option>
                <option value="民事一审">民事一审案件</option>
                <option value="民事二审">民事二审案件（上诉）</option>
                <option value="再审申请">再审申请</option>
                <option value="执行申请">执行申请</option>
                <option value="刑事自诉">刑事自诉</option>
                <option value="行政诉讼">行政诉讼</option>
              </select>
            </div>

            <div class="form-field full-width">
              <label class="field-label">
                涉案主体 <span class="required">*</span>
              </label>
              <div class="subject-inputs">
                <div class="subject-group">
                  <span class="subject-label">原告/申请人：</span>
                  <input 
                    v-model="formData.plaintiff" 
                    type="text" 
                    class="field-input"
                    placeholder="请输入原告/申请人名称"
                  >
                </div>
                <div class="subject-group">
                  <span class="subject-label">被告/被申请人：</span>
                  <input 
                    v-model="formData.defendant" 
                    type="text" 
                    class="field-input"
                    placeholder="请输入被告/被申请人名称"
                  >
                </div>
              </div>
            </div>

            <div class="form-field full-width">
              <label class="field-label">
                争议焦点 <span class="required">*</span>
              </label>
              <textarea 
                v-model="formData.disputeFocus" 
                class="field-input textarea"
                placeholder="请简要描述案件的核心争议焦点，如：双方对违约责任认定存在分歧、对损失金额计算方式有异议等..."
                rows="4"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- 步骤2：案件事实与证据 -->
        <div v-if="currentStep === 1" class="step-panel">
          <h2 class="panel-title">案件事实与证据</h2>
          
          <div class="form-field">
            <label class="field-label">
              案情详细描述 <span class="required">*</span>
            </label>
            <textarea 
              v-model="formData.caseDescription" 
              class="field-input textarea"
              placeholder="请详细描述案件的全部事实经过，包括：时间、地点、人物、事件起因、经过、结果等要素..."
              rows="6"
            ></textarea>
          </div>

          <div class="evidence-section">
            <div class="evidence-header">
              <span class="evidence-title">证据清单</span>
              <button class="add-evidence-btn" @click="addEvidence">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                添加证据
              </button>
            </div>

            <div class="evidence-list">
              <div 
                v-for="(evidence, index) in formData.evidence" 
                :key="index"
                class="evidence-item"
              >
                <input 
                  v-model="evidence.name" 
                  class="evidence-input"
                  placeholder="证据名称（如：劳动合同、付款凭证）"
                >
                <select v-model="evidence.type" class="evidence-type">
                  <option value="原件">原件</option>
                  <option value="复印件">复印件</option>
                  <option value="电子证据">电子证据</option>
                  <option value="证人证言">证人证言</option>
                </select>
                <select v-model="evidence.effect" class="evidence-effect">
                  <option value="">效力评估</option>
                  <option value="强">证明力强</option>
                  <option value="中">证明力中等</option>
                  <option value="弱">证明力较弱</option>
                </select>
                <button class="remove-evidence" @click="removeEvidence(index)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div v-if="formData.evidence.length === 0" class="no-evidence">
                <p>暂未添加证据</p>
              </div>
            </div>
          </div>

          <div class="form-field">
            <label class="field-label">
              证据效力说明
            </label>
            <textarea 
              v-model="formData.evidenceNote" 
              class="field-input textarea"
              placeholder="请说明您现有证据的收集情况、各证据的证明目的、证据链是否完整等..."
              rows="3"
            ></textarea>
          </div>
        </div>

        <!-- 步骤3：用户诉求 -->
        <div v-if="currentStep === 2" class="step-panel">
          <h2 class="panel-title">用户诉求</h2>
          
          <div class="form-field">
            <label class="field-label">
              核心诉求 <span class="required">*</span>
            </label>
            <textarea 
              v-model="formData.coreClaims" 
              class="field-input textarea"
              placeholder="请详细列出您的核心诉求，如：1. 请求被告支付货款XX元；2. 请求解除双方签订的合同；3. 请求被告赔偿损失XX元..."
              rows="5"
            ></textarea>
          </div>

          <div class="form-field">
            <label class="field-label">
              期望结果
            </label>
            <textarea 
              v-model="formData.expectedResult" 
              class="field-input textarea"
              placeholder="请描述您希望通过法律途径达到的理想结果，以及您可以接受的底线..."
              rows="3"
            ></textarea>
          </div>

          <div class="form-field">
            <label class="field-label">
              其他补充说明
            </label>
            <textarea 
              v-model="formData.additionalInfo" 
              class="field-input textarea"
              placeholder="如有其他需要补充的信息，请在此说明..."
              rows="3"
            ></textarea>
          </div>
        </div>

        <!-- 步骤4：分析结果 -->
        <div v-if="currentStep === 3 && analysisResult" class="step-panel result-panel">
          <div class="result-header">
            <h2 class="panel-title">案件分析报告</h2>
            <button class="export-btn" @click="exportReport">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              导出分析报告
            </button>
          </div>

          <div class="result-summary">
            <div class="summary-cards">
              <div class="summary-card">
                <div class="card-icon legal">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4M12 8h.01"></path>
                  </svg>
                </div>
                <div class="card-info">
                  <span class="card-label">案件复杂度</span>
                  <span class="card-value">{{ analysisResult.complexity || '待评估' }}</span>
                </div>
              </div>

              <div class="summary-card">
                <div class="card-icon cost">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <div class="card-info">
                  <span class="card-label">预估处理成本</span>
                  <span class="card-value">{{ analysisResult.cost || '待评估' }}</span>
                </div>
              </div>

              <div class="summary-card">
                <div class="card-icon time">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div class="card-info">
                  <span class="card-label">预估处理周期</span>
                  <span class="card-value">{{ analysisResult.duration || '待评估' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="result-sections">
            <div class="result-section">
              <h3 class="section-title legal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"></path>
                </svg>
                案件核心法律关系梳理
              </h3>
              <div class="section-content" v-html="formatContent(analysisResult.legalRelationship)"></div>
            </div>

            <div class="result-section">
              <h3 class="section-title evidence">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                现有证据的优势与不足分析
              </h3>
              <div class="section-content" v-html="formatContent(analysisResult.evidenceAnalysis)"></div>
            </div>

            <div class="result-section">
              <h3 class="section-title warning">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                潜在法律风险与争议点预判
              </h3>
              <div class="section-content" v-html="formatContent(analysisResult.riskPrediction)"></div>
            </div>

            <div class="result-section">
              <h3 class="section-title strategy">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                最优维权/应对策略建议
              </h3>
              <div class="section-content" v-html="formatContent(analysisResult.strategy)"></div>
            </div>

            <div class="result-section">
              <h3 class="section-title compare">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                不同解决方案的利弊对比
              </h3>
              <div class="section-content" v-html="formatContent(analysisResult.solutionComparison)"></div>
            </div>
          </div>
        </div>

        <!-- 导航按钮 -->
        <div class="step-navigation" v-if="currentStep < 3">
          <button 
            v-if="currentStep > 0" 
            class="nav-btn prev" 
            @click="prevStep"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            上一步
          </button>
          
          <button 
            v-if="currentStep < 2" 
            class="nav-btn next" 
            @click="nextStep"
          >
            下一步
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          <button 
            v-if="currentStep === 2" 
            class="nav-btn submit" 
            @click="submitAnalysis"
            :disabled="loading"
          >
            <span class="loading-spinner" v-if="loading"></span>
            {{ loading ? '分析中...' : '开始分析' }}
          </button>
        </div>

        <div class="step-navigation" v-if="currentStep === 3">
          <button class="nav-btn prev" @click="currentStep = 0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            重新分析
          </button>
        </div>
      </div>
    </div>
  </div>
</template>



<style scoped>
.evaluate-page {
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

.evaluate-container {
  width: 100%;
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-sizing: border-box;
}

/* 步骤指示器 */
.steps-indicator {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 18px;
  left: 60%;
  width: 80%;
  height: 2px;
  background: #e5e7eb;
}

.step.completed:not(:last-child)::after {
  background: #3b82f6;
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  position: relative;
  z-index: 1;
  margin-bottom: 8px;
}

.step.active .step-number {
  background: #3b82f6;
  color: #fff;
}

.step.completed .step-number {
  background: #3b82f6;
  color: #fff;
}

.step-title {
  font-size: 13px;
  color: #9ca3af;
}

.step.active .step-title,
.step.completed .step-title {
  color: #374151;
  font-weight: 500;
}

/* 步骤内容 */
.step-panel {
  min-height: 400px;
}

.panel-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 24px 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #333333;
}

.required {
  color: #ef4444;
}

.field-input {
  padding: 12px 14px;
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
  min-height: 100px;
}

/* 涉案主体输入 */
.subject-inputs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.subject-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.subject-label {
  min-width: 100px;
  font-size: 14px;
  color: #4b5563;
}

/* 证据部分 */
.evidence-section {
  margin: 20px 0;
}

.evidence-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.evidence-title {
  font-size: 15px;
  font-weight: 600;
  color: #333333;
}

.add-evidence-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #f0f9ff;
  color: #0284c7;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.add-evidence-btn:hover {
  background: #e0f2fe;
}

.evidence-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.evidence-item {
  display: flex;
  gap: 10px;
  align-items: center;
}

.evidence-input {
  flex: 2;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
}

.evidence-type,
.evidence-effect {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
}

.remove-evidence {
  padding: 8px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
}

.remove-evidence:hover {
  color: #ef4444;
}

.no-evidence {
  padding: 32px;
  text-align: center;
  background: #f9fafb;
  border-radius: 8px;
  color: #9ca3af;
}

/* 导航按钮 */
.step-navigation {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn.prev {
  background: #f3f4f6;
  color: #6b7280;
}

.nav-btn.prev:hover {
  background: #e5e7eb;
}

.nav-btn.next {
  background: #3b82f6;
  color: #fff;
}

.nav-btn.next:hover {
  background: #2563eb;
}

.nav-btn.submit {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
}

.nav-btn.submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.nav-btn:disabled {
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

/* 分析结果 */
.result-panel {
  padding: 0;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
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

.result-summary {
  margin-bottom: 24px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-radius: 12px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon.cost {
  background: #fef3c7;
  color: #d97706;
}

.card-icon.time {
  background: #dbeafe;
  color: #2563eb;
}

.card-icon.legal {
  background: #f3e8ff;
  color: #9333ea;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-label {
  font-size: 13px;
  color: #4b5563;
}

.card-value {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

/* 结果详情 */
.result-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-section {
  padding: 20px;
  background: #f9fafb;
  border-radius: 10px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.section-title.warning {
  color: #d97706;
}

.section-title.strategy {
  color: #7c3aed;
}

.section-title.evidence {
  color: #2563eb;
}

.section-title.compare {
  color: #0891b2;
}

.section-title.legal {
  color: #9333ea;
}

.section-content {
  font-size: 14px;
  color: #333333;
  line-height: 1.8;
}

/* 响应式适配 */
@media (max-width: 1024px) {
  .evaluate-container {
    padding: 24px;
  }

  .steps-indicator {
    margin-bottom: 32px;
  }

  .step {
    flex: 1;
  }

  .step:not(:last-child)::after {
    width: 70%;
    left: 65%;
  }

  .step-title {
    font-size: 12px;
  }

  .form-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .summary-card:last-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 767px) {
  .evaluate-page {
    padding: 12px;
  }

  .page-header {
    margin-bottom: 16px;
  }

  .page-title {
    font-size: 20px;
  }

  .page-desc {
    font-size: 13px;
  }

  .evaluate-container {
    padding: 16px;
    border-radius: 12px;
  }

  /* 步骤指示器 - 简化显示 */
  .steps-indicator {
    margin-bottom: 24px;
    gap: 0;
  }

  .step {
    flex: 1;
    position: relative;
  }

  .step:not(:last-child)::after {
    width: 50%;
    left: 50%;
    top: 16px;
  }

  .step-number {
    width: 32px;
    height: 32px;
    font-size: 13px;
  }

  .step-title {
    font-size: 11px;
    text-align: center;
    display: none;
  }

  .step.active .step-title {
    display: block;
  }

  /* 表单 */
  .form-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .panel-title {
    font-size: 16px;
    margin-bottom: 16px;
  }

  .field-input {
    padding: 10px 12px;
    font-size: 14px;
  }

  .field-input.textarea {
    min-height: 80px;
  }

  /* 涉案主体 */
  .subject-inputs {
    gap: 10px;
  }

  .subject-group {
    flex-direction: column;
    gap: 8px;
  }

  .subject-label {
    font-size: 13px;
  }

  /* 证据列表 */
  .evidence-section {
    margin: 16px 0;
  }

  .evidence-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .add-evidence-btn {
    width: 100%;
    justify-content: center;
  }

  .evidence-list {
    gap: 8px;
  }

  .evidence-item {
    flex-wrap: wrap;
    padding: 10px;
    background: #f9fafb;
    border-radius: 8px;
  }

  .evidence-input {
    flex: 1 1 100%;
  }

  .evidence-type,
  .evidence-effect {
    flex: 1 1 calc(50% - 5px);
  }

  .remove-evidence {
    flex-shrink: 0;
  }

  /* 导航按钮 */
  .step-navigation {
    margin-top: 24px;
    padding-top: 16px;
    gap: 12px;
  }

  .nav-btn {
    flex: 1;
    justify-content: center;
    padding: 12px 16px;
    font-size: 14px;
  }

  /* 结果区域 */
  .result-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .export-btn {
    width: 100%;
    justify-content: center;
  }

  .summary-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .summary-card {
    padding: 16px;
  }

  .card-icon {
    width: 40px;
    height: 40px;
  }

  .card-value {
    font-size: 14px;
  }

  .result-sections {
    gap: 12px;
  }

  .result-section {
    padding: 16px;
  }

  .section-title {
    font-size: 14px;
    flex-wrap: wrap;
  }

  .section-content {
    font-size: 13px;
    line-height: 1.6;
  }
}
</style>
