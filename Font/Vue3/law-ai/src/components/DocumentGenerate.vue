<template>
  <div class="document-page">
    <div class="page-header">
      <h1 class="page-title">劳动仲裁申请书生成</h1>
      <p class="page-desc">填写相关信息，自动生成劳动仲裁申请书，支持下载Word和PDF格式</p>
    </div>

    <div class="document-layout">
      <!-- 左侧：表单填写区 -->
      <aside class="form-section">
        <div class="form-header">
          <h2 class="section-title">申请人信息</h2>
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

        <!-- 申请人信息 -->
        <div class="form-group">
          <label class="form-label">申请人姓名</label>
          <input v-model="formData.applicantName" type="text" class="form-input" placeholder="请输入申请人姓名" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">性别</label>
            <select v-model="formData.applicantGender" class="form-input">
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">民族</label>
            <input v-model="formData.applicantEthnicity" type="text" class="form-input" placeholder="如：汉族" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">出生日期</label>
            <input v-model="formData.applicantBirthdate" type="text" class="form-input" placeholder="XXXX年XX月XX日" />
          </div>
          <div class="form-group">
            <label class="form-label">联系电话</label>
            <input v-model="formData.applicantPhone" type="text" class="form-input" placeholder="XXXXXXXXXXX" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">住所地</label>
          <input v-model="formData.applicantAddress" type="text" class="form-input" placeholder="XXX市XXX区XXX路XXX号" />
        </div>

        <div class="form-divider"></div>
        <h2 class="section-title">被申请人信息</h2>

        <div class="form-group">
          <label class="form-label">被申请人名称</label>
          <input v-model="formData.respondentName" type="text" class="form-input" placeholder="请输入被申请人名称" />
        </div>

        <div class="form-group">
          <label class="form-label">住所地</label>
          <input v-model="formData.respondentAddress" type="text" class="form-input" placeholder="XX市XX区XXX路XXX号" />
        </div>

        <div class="form-group">
          <label class="form-label">统一社会信用代码</label>
          <input v-model="formData.respondentCode" type="text" class="form-input" placeholder="XXXXXXXXXXX" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">法定代表人</label>
            <input v-model="formData.respondentLegalPerson" type="text" class="form-input" placeholder="姓名" />
          </div>
          <div class="form-group">
            <label class="form-label">职务</label>
            <input v-model="formData.respondentTitle" type="text" class="form-input" placeholder="如：总经理" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">联系电话</label>
          <input v-model="formData.respondentPhone" type="text" class="form-input" placeholder="XXXXXXXXXXX" />
        </div>

        <div class="form-divider"></div>
        <h2 class="section-title">劳动关系信息</h2>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">入职日期</label>
            <input v-model="formData.workStartDate" type="text" class="form-input" placeholder="XXXX年XX月XX日" />
          </div>
          <div class="form-group">
            <label class="form-label">离职日期</label>
            <input v-model="formData.workEndDate" type="text" class="form-input" placeholder="XXXX年XX月XX日或至今" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">工作部门</label>
          <input v-model="formData.department" type="text" class="form-input" placeholder="如：技术部" />
        </div>

        <div class="form-group">
          <label class="form-label">每月基本工资（元）</label>
          <input v-model="formData.monthlySalary" type="text" class="form-input" placeholder="如：5000" />
        </div>

        <div class="form-group">
          <label class="form-label">是否签订劳动合同</label>
          <select v-model="formData.hasContract" class="form-input">
            <option value="已签订">已签订</option>
            <option value="未签订">未签订</option>
          </select>
        </div>

        <div class="form-divider"></div>
        <h2 class="section-title">仲裁请求</h2>

        <div class="form-group">
          <label class="form-label">拖欠工资金额（元）</label>
          <input v-model="formData.unpaidSalary" type="text" class="form-input" placeholder="0" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">工作日加班（小时）</label>
            <input v-model="formData.weekdayOvertime" type="text" class="form-input" placeholder="0" />
          </div>
          <div class="form-group">
            <label class="form-label">加班工资（元）</label>
            <input v-model="formData.weekdayOvertimePay" type="text" class="form-input" placeholder="0" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">休息日加班（天）</label>
            <input v-model="formData.restdayOvertime" type="text" class="form-input" placeholder="0" />
          </div>
          <div class="form-group">
            <label class="form-label">休息日加班工资（元）</label>
            <input v-model="formData.restdayOvertimePay" type="text" class="form-input" placeholder="0" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">法定节假日加班（天）</label>
            <input v-model="formData.holidayOvertime" type="text" class="form-input" placeholder="0" />
          </div>
          <div class="form-group">
            <label class="form-label">法定节假日加班工资（元）</label>
            <input v-model="formData.holidayOvertimePay" type="text" class="form-input" placeholder="0" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">拖欠工资月数</label>
          <input v-model="formData.unpaidSalaryMonths" type="text" class="form-input" placeholder="0" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">高温工作天数</label>
            <input v-model="formData.highTempDays" type="text" class="form-input" placeholder="0" />
          </div>
          <div class="form-group">
            <label class="form-label">高温津贴（元）</label>
            <input v-model="formData.highTempAllowance" type="text" class="form-input" placeholder="0" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">未签劳动合同期间（月）</label>
            <input v-model="formData.noContractMonths" type="text" class="form-input" placeholder="0" />
          </div>
          <div class="form-group">
            <label class="form-label">二倍工资差额（元）</label>
            <input v-model="formData.doubleSalaryGap" type="text" class="form-input" placeholder="0" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">未休年假天数</label>
            <input v-model="formData.unusedVacationDays" type="text" class="form-input" placeholder="0" />
          </div>
          <div class="form-group">
            <label class="form-label">未休年假工资（元）</label>
            <input v-model="formData.unusedVacationPay" type="text" class="form-input" placeholder="0" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">工作年限</label>
            <input v-model="formData.workingYears" type="text" class="form-input" placeholder="X年" />
          </div>
          <div class="form-group">
            <label class="form-label">经济补偿金（元）</label>
            <input v-model="formData.severancePay" type="text" class="form-input" placeholder="0" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">押金/证件扣押（物品）</label>
          <input v-model="formData.depositedItems" type="text" class="form-input" placeholder="如：工作服押金XX元/身份证/毕业证" />
        </div>

        <div class="form-group">
          <label class="form-label">仲裁委员会名称</label>
          <input v-model="formData.arbitrationCommittee" type="text" class="form-input" placeholder="如：XX劳动争议仲裁委员会" />
        </div>

        <div class="form-group">
          <label class="form-label">离职原因</label>
          <textarea v-model="formData.resignationReason" class="form-input" rows="3" placeholder="如：XXXX年XX月XX日，被申请人在申请人工作没有任何过错的情况下，违法解除与申请人的劳动合同"></textarea>
        </div>

        <div class="form-divider"></div>
        <h2 class="section-title">生成操作</h2>

        <div class="action-buttons">
          <button class="action-btn primary" @click="generateWord">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            下载Word
          </button>
          <button class="action-btn secondary" @click="generatePdf">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            下载PDF
          </button>
        </div>
      </aside>

      <!-- 右侧：预览区 -->
      <main class="preview-section">
        <div class="preview-header">
          <h2 class="preview-title">文书预览</h2>
        </div>
        <div class="preview-content">
          <div class="document-preview" v-html="previewContent"></div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx'
import { saveAs } from 'file-saver'

const formData = reactive({
  applicantName: '',
  applicantGender: '男',
  applicantEthnicity: '汉族',
  applicantBirthdate: '',
  applicantPhone: '',
  applicantAddress: '',
  respondantName: '',
  respondantAddress: '',
  respondantCode: '',
  respondentName: '',
  respondentAddress: '',
  respondentCode: '',
  respondentLegalPerson: '',
  respondentTitle: '',
  respondentPhone: '',
  workStartDate: '',
  workEndDate: '',
  department: '',
  monthlySalary: '',
  hasContract: '已签订',
  unpaidSalary: '0',
  unpaidSalaryMonths: '0',
  weekdayOvertime: '0',
  weekdayOvertimePay: '0',
  restdayOvertime: '0',
  restdayOvertimePay: '0',
  holidayOvertime: '0',
  holidayOvertimePay: '0',
  highTempDays: '0',
  highTempAllowance: '0',
  noContractMonths: '0',
  doubleSalaryGap: '0',
  unusedVacationDays: '0',
  unusedVacationPay: '0',
  workingYears: '',
  severancePay: '0',
  depositedItems: '',
  arbitrationCommittee: '',
  resignationReason: ''
})

const sampleData = {
  applicantName: '张三',
  applicantGender: '男',
  applicantEthnicity: '汉族',
  applicantBirthdate: '1990年5月15日',
  applicantPhone: '13800138000',
  applicantAddress: '北京市朝阳区建国路88号',
  respondantName: '',
  respondentName: '北京某某科技有限公司',
  respondentAddress: '北京市海淀区中关村大街1号',
  respondentCode: '91110108MA00123456',
  respondentLegalPerson: '李四',
  respondentTitle: '总经理',
  respondentPhone: '010-12345678',
  workStartDate: '2021年3月1日',
  workEndDate: '2024年6月30日',
  department: '技术部',
  monthlySalary: '8000',
  hasContract: '已签订',
  unpaidSalary: '24000',
  unpaidSalaryMonths: '3',
  weekdayOvertime: '60',
  weekdayOvertimePay: '6000',
  restdayOvertime: '10',
  restdayOvertimePay: '3500',
  holidayOvertime: '3',
  holidayOvertimePay: '1200',
  highTempDays: '15',
  highTempAllowance: '450',
  noContractMonths: '0',
  doubleSalaryGap: '0',
  unusedVacationDays: '5',
  unusedVacationPay: '3500',
  workingYears: '3年',
  severancePay: '24000',
  depositedItems: '工作服押金500元',
  arbitrationCommittee: '北京市海淀区劳动争议仲裁委员会',
  resignationReason: '2024年6月30日，被申请人在申请人工作没有任何过错的情况下，违法解除与申请人的劳动合同。申请人已在被申请人处工作3年，根据法律规定应当获得经济补偿金共计24000元。'
}

const loadSampleCase = () => {
  Object.assign(formData, sampleData)
}

const getTotalClaim = () => {
  const unpaidSalary = parseFloat(formData.unpaidSalary) || 0
  const weekdayOvertimePay = parseFloat(formData.weekdayOvertimePay) || 0
  const restdayOvertimePay = parseFloat(formData.restdayOvertimePay) || 0
  const holidayOvertimePay = parseFloat(formData.holidayOvertimePay) || 0
  const highTempAllowance = parseFloat(formData.highTempAllowance) || 0
  const doubleSalaryGap = parseFloat(formData.doubleSalaryGap) || 0
  const unusedVacationPay = parseFloat(formData.unusedVacationPay) || 0
  const severancePay = parseFloat(formData.severancePay) || 0
  
  return unpaidSalary + weekdayOvertimePay + restdayOvertimePay + holidayOvertimePay + highTempAllowance + doubleSalaryGap + unusedVacationPay + severancePay
}

const previewContent = computed(() => {
  const total = getTotalClaim()
  return `
    <div style="font-family: 'SimSun', serif; font-size: 14px; line-height: 2; padding: 40px;">
      <p style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px;">劳动仲裁申请书</p>
      
      <p style="margin-bottom: 10px;"><strong>申请人：</strong>${formData.applicantName || 'XXX'}，${formData.applicantGender || 'X'}，${formData.applicantEthnicity || 'X'}族，${formData.applicantBirthdate || 'XXXX年XX月XX日'}出生，住所地${formData.applicantAddress || 'XXX市XXX区XXX路XXX号'}；联系电话：${formData.applicantPhone || 'XXXXXXXXXXX'}。</p>
      
      <p style="margin-bottom: 10px;"><strong>被申请人：</strong>${formData.respondentName || 'XXXXXX有限公司'}，住所地${formData.respondentAddress || 'XX市XX区XXX路XXX号'}，统一社会信用代码${formData.respondentCode || 'XXXXXXXXXXX'}；</p>
      <p style="margin-bottom: 10px; padding-left: 2em;"><strong>法定代表人：</strong>${formData.respondentLegalPerson || 'XX'}，职务：${formData.respondentTitle || 'XXX'}；</p>
      <p style="margin-bottom: 10px; padding-left: 2em;"><strong>联系电话：</strong>${formData.respondentPhone || 'XXXXXXXXXXX'}。</p>
      
      <p style="font-weight: bold; margin: 20px 0 10px;">申请事项：</p>
      
      <p style="margin-bottom: 10px;">一、请求确认申请人与被申请人${formData.workStartDate || 'XXXX年XX月XX日'}至${formData.workEndDate || 'XXXX年XX月XX日'}存在劳动关系；</p>
      
      <p style="margin-bottom: 10px;">二、请求裁令被申请人支付申请人${formData.workStartDate || 'XXXX年XX月XX日'}至${formData.workEndDate || 'XXXX年XX月XX日'}的拖欠工资${formData.unpaidSalary || '0'}元，工作日延长工作时间工资${formData.weekdayOvertimePay || '0'}元，休息日加班费${formData.restdayOvertimePay || '0'}元，法定节假日加班费${formData.holidayOvertimePay || '0'}元，共计<strong style="color: red;">${total}</strong>元；</p>
      
      <p style="font-size: 12px; color: #666; margin-bottom: 10px; padding-left: 2em;">（注：根据《劳动法》第四十四条规定：（一）安排劳动者延长工作时间的，支付不低于工资的百分之一百五十的工资报酬；（二）休息日安排劳动者工作又不能安排补休的，支付不低于工资的百分之二百的工资报酬；（三）法定休假日安排劳动者工作的，支付不低于工资的百分之三百的工资报酬。）</p>
      
      <p style="margin-bottom: 10px;">三、请求裁令被申请人支付申请人高温津贴${formData.highTempAllowance || '0'}元；</p>
      
      <p style="font-size: 12px; color: #666; margin-bottom: 10px; padding-left: 2em;">（注：根据《防暑降温措施管理办法》第十七条规定：劳动者从事高温作业的,依法享受岗位津贴。）</p>
      
      ${formData.hasContract === '未签订' ? `<p style="margin-bottom: 10px;">四、请求裁令被申请人支付申请人未签订书面劳动合同的二倍工资差额${formData.doubleSalaryGap || '0'}元；</p>
      <p style="font-size: 12px; color: #666; margin-bottom: 10px; padding-left: 2em;">（注：根据《劳动合同法》第八十二条规定：用人单位自用工之日起超过一个月不满一年未与劳动者订立书面劳动合同的，应当向劳动者每月支付二倍的工资。）</p>` : ''}
      
      <p style="margin-bottom: 10px;">${formData.hasContract === '未签订' ? '五' : '四'}、请求裁令被申请人支付申请人未休带薪年休假（${formData.unusedVacationDays || '0'}天）工资${formData.unusedVacationPay || '0'}元；</p>
      
      <p style="font-size: 12px; color: #666; margin-bottom: 10px; padding-left: 2em;">（注：根据《职工带薪年休假条例》第五条规定：单位确因工作需要不能安排职工休年休假的，对职工应休未休的年休假天数，单位应当按照该职工日工资收入的300%支付年休假工资报酬。）</p>
      
      <p style="margin-bottom: 10px;">${formData.hasContract === '未签订' ? '六' : '五'}、请求裁令被申请人支付（双倍）经济补偿金${formData.severancePay || '0'}元；</p>
      
      <p style="font-size: 12px; color: #666; margin-bottom: 10px; padding-left: 2em;">（注：经济补偿金按劳动者的工作年限，每满一年支付一个月工资。）</p>
      
      <p style="margin-bottom: 10px;">${formData.hasContract === '未签订' ? '七' : '六'}、请求裁令被申请人向申请人出具解除劳动合同的证明，并在十五日内为申请人办理档案和社会保险关系转移手续；</p>
      
      ${formData.depositedItems ? `<p style="margin-bottom: 10px;">${formData.hasContract === '未签订' ? '八' : '七'}、请求裁令被申请人返还申请人${formData.depositedItems}。</p>` : ''}
      
      <p style="font-weight: bold; margin: 20px 0 10px;">事实与理由：</p>
      
      <p style="text-indent: 2em; margin-bottom: 10px;">申请人于${formData.workStartDate || 'XXXX年XX月XX日'}与被申请人${formData.hasContract === '已签订' ? '签订《劳动合同》' : '起在被申请人处工作'}，与被申请人建立劳动合同关系，双方约定每月基本工资为${formData.monthlySalary || 'XX'}元。</p>
      
      ${formData.hasContract === '未签订' ? '<p style="text-indent: 2em; margin-bottom: 10px;">申请人于XXXX年XX月XX日起在被申请人处工作，任XX一职，但至今被申请人与申请人未签订劳动合同，双方成立事实劳动关系。</p>' : ''}
      
      ${formData.unpaidSalary !== '0' ? `<p style="text-indent: 2em; margin-bottom: 10px;">申请人入职被申请人处后，在${formData.department || 'XX'}部门工作。自${formData.workStartDate || 'XXXX年XX月XX日'}以来，被申请人已经拖欠申请人工资${formData.unpaidSalaryMonths || 'XX'}月，每月工资${formData.monthlySalary || 'XX'}元，共计${formData.unpaidSalary || 'XX'}元，经申请人多次催要，被申请人仍拒不发还工资。</p>` : ''}
      
      <p style="text-indent: 2em; margin-bottom: 10px;">综上所述，被申请人的行为已经严重侵害申请人的合法权益，为了维护申请人的合法权益，申请人依据《劳动法》等法律之规定，特向贵委申请劳动仲裁，请求贵委依法裁决！</p>
      
      <p style="text-align: right; margin-top: 40px;">此致</p>
      <p style="text-align: right; margin-bottom: 40px;">${formData.arbitrationCommittee || 'XX劳动争议仲裁委员会'}</p>
      <p style="text-align: right; margin-bottom: 10px;">申请人：${formData.applicantName || 'XXX'}</p>
      <p style="text-align: right;">XXXX年XX月XX日</p>
    </div>
  `
})

const generateWord = async () => {
  const total = getTotalClaim()
  
  const paragraphs = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: '劳动仲裁申请书', bold: true, size: 36 })
      ]
    }),
    new Paragraph({ children: [] }),
    new Paragraph({
      children: [
        new TextRun({ text: '申请人：', bold: true }),
        new TextRun({ text: `${formData.applicantName || 'XXX'}，${formData.applicantGender || 'X'}，${formData.applicantEthnicity || 'X'}族，${formData.applicantBirthdate || 'XXXX年XX月XX日'}出生，住所地${formData.applicantAddress || 'XXX市XXX区XXX路XXX号'}；联系电话：${formData.applicantPhone || 'XXXXXXXXXXX'}。` })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '被申请人：', bold: true }),
        new TextRun({ text: `${formData.respondentName || 'XXXXXX有限公司'}，住所地${formData.respondentAddress || 'XX市XX区XXX路XXX号'}，统一社会信用代码${formData.respondentCode || 'XXXXXXXXXXX'}；` })
      ]
    }),
    new Paragraph({
      indent: { left: 720 },
      children: [
        new TextRun({ text: '法定代表人：', bold: true }),
        new TextRun({ text: `${formData.respondentLegalPerson || 'XX'}，职务：${formData.respondentTitle || 'XXX'}；` })
      ]
    }),
    new Paragraph({
      indent: { left: 720 },
      children: [
        new TextRun({ text: '联系电话：', bold: true }),
        new TextRun({ text: `${formData.respondentPhone || 'XXXXXXXXXXX'}。` })
      ]
    }),
    new Paragraph({ children: [] }),
    new Paragraph({
      children: [new TextRun({ text: '申请事项：', bold: true })]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '一、请求确认申请人与被申请人', bold: false }),
        new TextRun({ text: `${formData.workStartDate || 'XXXX年XX月XX日'}至${formData.workEndDate || 'XXXX年XX月XX日'}`, bold: false }),
        new TextRun({ text: '存在劳动关系；', bold: false })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `二、请求裁令被申请人支付申请人${formData.workStartDate || 'XXXX年XX月XX日'}至${formData.workEndDate || 'XXXX年XX月XX日'}的拖欠工资${formData.unpaidSalary || '0'}元，工作日延长工作时间工资${formData.weekdayOvertimePay || '0'}元，休息日加班费${formData.restdayOvertimePay || '0'}元，法定节假日加班费${formData.holidayOvertimePay || '0'}元，共计${total}元；` })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `三、请求裁令被申请人支付申请人高温津贴${formData.highTempAllowance || '0'}元；` })
      ]
    }),
    ...(formData.hasContract === '未签订' ? [
      new Paragraph({
        children: [
          new TextRun({ text: `四、请求裁令被申请人支付申请人未签订书面劳动合同的二倍工资差额${formData.doubleSalaryGap || '0'}元；` })
        ]
      })
    ] : []),
    new Paragraph({
      children: [
        new TextRun({ text: `${formData.hasContract === '未签订' ? '五' : '四'}、请求裁令被申请人支付申请人未休带薪年休假（${formData.unusedVacationDays || '0'}天）工资${formData.unusedVacationPay || '0'}元；` })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${formData.hasContract === '未签订' ? '六' : '五'}、请求裁令被申请人支付（双倍）经济补偿金${formData.severancePay || '0'}元；` })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${formData.hasContract === '未签订' ? '七' : '六'}、请求裁令被申请人向申请人出具解除劳动合同的证明，并在十五日内为申请人办理档案和社会保险关系转移手续；` })
      ]
    }),
    ...(formData.depositedItems ? [
      new Paragraph({
        children: [
          new TextRun({ text: `${formData.hasContract === '未签订' ? '八' : '七'}、请求裁令被申请人返还申请人${formData.depositedItems}。` })
        ]
      })
    ] : []),
    new Paragraph({ children: [] }),
    new Paragraph({
      children: [new TextRun({ text: '事实与理由：', bold: true })]
    }),
    new Paragraph({
      indent: { firstLine: 720 },
      children: [
        new TextRun({ text: `申请人于${formData.workStartDate || 'XXXX年XX月XX日'}与被申请人${formData.hasContract === '已签订' ? '签订《劳动合同》' : '起在被申请人处工作'}，与被申请人建立劳动合同关系，双方约定每月基本工资为${formData.monthlySalary || 'XX'}元。` })
      ]
    }),
    ...(formData.hasContract === '未签订' ? [
      new Paragraph({
        indent: { firstLine: 720 },
        children: [
          new TextRun({ text: '申请人于XXXX年XX月XX日起在被申请人处工作，任XX一职，但至今被申请人与申请人未签订劳动合同，双方成立事实劳动关系。' })
        ]
      })
    ] : []),
    ...(formData.unpaidSalary !== '0' ? [
      new Paragraph({
        indent: { firstLine: 720 },
        children: [
          new TextRun({ text: `申请人入职被申请人处后，在${formData.department || 'XX'}部门工作。自${formData.workStartDate || 'XXXX年XX月XX日'}以来，被申请人已经拖欠申请人工资${formData.unpaidSalaryMonths || 'XX'}月，每月工资${formData.monthlySalary || 'XX'}元，共计${formData.unpaidSalary || 'XX'}元，经申请人多次催要，被申请人仍拒不发还工资。` })
        ]
      })
    ] : []),
    new Paragraph({ children: [] }),
    new Paragraph({
      indent: { firstLine: 720 },
      children: [
        new TextRun({ text: '综上所述，被申请人的行为已经严重侵害申请人的合法权益，为了维护申请人的合法权益，申请人依据《劳动法》等法律之规定，特向贵委申请劳动仲裁，请求贵委依法裁决！' })
      ]
    }),
    new Paragraph({ children: [] }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: '此致' })]
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: `${formData.arbitrationCommittee || 'XX劳动争议仲裁委员会'}` })]
    }),
    new Paragraph({ children: [] }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: `申请人：${formData.applicantName || 'XXX'}` })]
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: 'XXXX年XX月XX日' })]
    })
  ]

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs
    }]
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `劳动仲裁申请书_${formData.applicantName || '申请人'}_${new Date().toISOString().slice(0, 10)}.docx`)
}

const generatePdf = () => {
  const content = previewContent.value
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>劳动仲裁申请书</title>
      <meta charset="utf-8">
      <style>
        body { font-family: 'SimSun', serif; font-size: 14px; line-height: 2; }
        @media print {
          body { padding: 0; margin: 0; }
        }
      </style>
    </head>
    <body>${content}</body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
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
  height: calc(100vh - 140px);
}

.form-section {
  width: 45%;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
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
  margin-bottom: 16px;
}

.sample-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

.form-group {
  margin-bottom: 12px;
}

.form-label {
  display: block;
  font-size: 13px;
  color: #4b5563;
  margin-bottom: 4px;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

.form-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 20px 0;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.action-btn.secondary {
  background: #f3f4f6;
  color: #4b5563;
}

.action-btn.secondary:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

.preview-section {
  width: 55%;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-header {
  margin-bottom: 16px;
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.document-preview {
  padding: 20px;
  min-height: 100%;
}

@media (max-width: 1024px) {
  .document-layout {
    flex-direction: column;
    height: auto;
  }
  
  .form-section,
  .preview-section {
    width: 100%;
    max-height: 500px;
    overflow-y: auto;
  }
}
</style>
