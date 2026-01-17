// Mock data for SHE³ - Women's Health & Education Platform

export interface Campaign {
  id: string
  title: string
  description: string
  beneficiary: string
  beneficiaryName: string
  targetAmount: number
  raisedAmount: number
  donorsCount: number
  category: string
  imageUrl: string
  milestones: Milestone[]
  proofs: Proof[]
  createdAt: string
  deadline: string
  status: 'active' | 'completed' | 'expired'
}

export interface Milestone {
  id: string
  title: string
  targetAmount: number
  releasedAmount: number
  status: 'pending' | 'in_progress' | 'completed'
  proofRequired: boolean
}

export interface Proof {
  id: string
  campaignId: string
  milestoneId: string
  imageUrl: string
  amount: number
  description: string
  status: 'pending' | 'ai_approved' | 'ai_rejected' | 'manual_review'
  aiReview?: AIReviewResult
  submittedAt: string
  reviewedAt?: string
  txHash?: string
}

export interface AIReviewResult {
  status: 'approved' | 'rejected' | 'manual_review'
  confidence: number
  extracted: {
    amount: number
    date: string
    recipient: string
    purpose: string
  }
  checks: {
    amountMatch: boolean
    dateValid: boolean
    formatValid: boolean
    authenticityScore: number
    purposeMatch: boolean
  }
  reason: string
}

export interface Donation {
  id: string
  campaignId: string
  donor: string
  amount: number
  txHash: string
  timestamp: string
}

// Mock campaigns - Women's Health & Education
export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    title: '农村女性宫颈癌筛查计划',
    description: '为偏远地区的女性提供免费HPV检测和宫颈癌早筛服务。早发现、早治疗，守护每一位姐妹的健康。已帮助3000+女性完成筛查。',
    beneficiary: '0x1234567890abcdef1234567890abcdef12345678',
    beneficiaryName: '李医生团队',
    targetAmount: 15000,
    raisedAmount: 11250,
    donorsCount: 328,
    category: '女性健康',
    imageUrl: '/images/health-screening.jpg',
    milestones: [
      {
        id: 'm1',
        title: '检测试剂采购',
        targetAmount: 5000,
        releasedAmount: 5000,
        status: 'completed',
        proofRequired: true,
      },
      {
        id: 'm2',
        title: '流动检测车运营',
        targetAmount: 6000,
        releasedAmount: 4000,
        status: 'in_progress',
        proofRequired: true,
      },
      {
        id: 'm3',
        title: '阳性患者后续治疗',
        targetAmount: 4000,
        releasedAmount: 0,
        status: 'pending',
        proofRequired: true,
      },
    ],
    proofs: [
      {
        id: 'p1',
        campaignId: '1',
        milestoneId: 'm1',
        imageUrl: '/images/proof1.jpg',
        amount: 5000,
        description: 'HPV检测试剂采购发票 - 2026年1月',
        status: 'ai_approved',
        aiReview: {
          status: 'approved',
          confidence: 0.96,
          extracted: {
            amount: 5000,
            date: '2026-01-08',
            recipient: '某医疗器械公司',
            purpose: 'HPV检测试剂',
          },
          checks: {
            amountMatch: true,
            dateValid: true,
            formatValid: true,
            authenticityScore: 0.94,
            purposeMatch: true,
          },
          reason: '凭证金额与申请金额一致，采购内容与项目用途匹配，发票格式规范',
        },
        submittedAt: '2026-01-08T08:00:00Z',
        reviewedAt: '2026-01-08T08:00:12Z',
        txHash: '0xabc123...',
      },
    ],
    createdAt: '2025-12-01T00:00:00Z',
    deadline: '2026-04-01T00:00:00Z',
    status: 'active',
  },
  {
    id: '2',
    title: '山区女孩编程夏令营',
    description: '为贫困山区的女孩们提供为期一个月的编程培训，让她们接触STEM教育，开启科技梦想之门。包含编程课程、导师指导和设备支持。',
    beneficiary: '0xabcdef1234567890abcdef1234567890abcdef12',
    beneficiaryName: 'Code4Her 公益组织',
    targetAmount: 20000,
    raisedAmount: 16000,
    donorsCount: 456,
    category: '女性教育',
    imageUrl: '/images/coding-camp.jpg',
    milestones: [
      {
        id: 'm1',
        title: '笔记本电脑采购',
        targetAmount: 8000,
        releasedAmount: 8000,
        status: 'completed',
        proofRequired: true,
      },
      {
        id: 'm2',
        title: '课程开发与教师薪酬',
        targetAmount: 7000,
        releasedAmount: 5000,
        status: 'in_progress',
        proofRequired: true,
      },
      {
        id: 'm3',
        title: '食宿与交通补贴',
        targetAmount: 5000,
        releasedAmount: 0,
        status: 'pending',
        proofRequired: true,
      },
    ],
    proofs: [],
    createdAt: '2025-11-15T00:00:00Z',
    deadline: '2026-03-15T00:00:00Z',
    status: 'active',
  },
  {
    id: '3',
    title: '单亲妈妈职业技能培训',
    description: '为单亲妈妈提供免费的职业技能培训（美容美发、电商运营、家政服务），帮助她们实现经济独立，重建自信人生。',
    beneficiary: '0x9876543210fedcba9876543210fedcba98765432',
    beneficiaryName: '向阳花开公益',
    targetAmount: 12000,
    raisedAmount: 8400,
    donorsCount: 267,
    category: '女性赋能',
    imageUrl: '/images/skill-training.jpg',
    milestones: [
      {
        id: 'm1',
        title: '培训场地租赁',
        targetAmount: 3000,
        releasedAmount: 3000,
        status: 'completed',
        proofRequired: true,
      },
      {
        id: 'm2',
        title: '培训设备与材料',
        targetAmount: 5000,
        releasedAmount: 3500,
        status: 'in_progress',
        proofRequired: true,
      },
      {
        id: 'm3',
        title: '学员生活补贴',
        targetAmount: 4000,
        releasedAmount: 0,
        status: 'pending',
        proofRequired: true,
      },
    ],
    proofs: [],
    createdAt: '2026-01-05T00:00:00Z',
    deadline: '2026-05-05T00:00:00Z',
    status: 'active',
  },
  {
    id: '4',
    title: '女性心理健康热线',
    description: '建设24小时女性心理援助热线，为遭受家暴、产后抑郁、职场压力的女性提供专业心理咨询和危机干预服务。',
    beneficiary: '0xfedcba9876543210fedcba9876543210fedcba98',
    beneficiaryName: '心灵港湾基金会',
    targetAmount: 25000,
    raisedAmount: 17500,
    donorsCount: 389,
    category: '心理健康',
    imageUrl: '/images/mental-health.jpg',
    milestones: [
      {
        id: 'm1',
        title: '热线系统建设',
        targetAmount: 8000,
        releasedAmount: 8000,
        status: 'completed',
        proofRequired: true,
      },
      {
        id: 'm2',
        title: '心理咨询师团队',
        targetAmount: 12000,
        releasedAmount: 7500,
        status: 'in_progress',
        proofRequired: true,
      },
      {
        id: 'm3',
        title: '危机干预培训',
        targetAmount: 5000,
        releasedAmount: 0,
        status: 'pending',
        proofRequired: true,
      },
    ],
    proofs: [],
    createdAt: '2025-10-20T00:00:00Z',
    deadline: '2026-04-20T00:00:00Z',
    status: 'active',
  },
  {
    id: '5',
    title: '乡村女教师成长计划',
    description: '资助偏远地区女教师参加教学能力提升培训，提供教学资源和交流平台。一位好老师，能改变无数孩子的命运。',
    beneficiary: '0x5678901234abcdef5678901234abcdef56789012',
    beneficiaryName: '春蕾教育基金',
    targetAmount: 18000,
    raisedAmount: 10800,
    donorsCount: 234,
    category: '女性教育',
    imageUrl: '/images/teacher-training.jpg',
    milestones: [
      {
        id: 'm1',
        title: '线上培训课程开发',
        targetAmount: 6000,
        releasedAmount: 6000,
        status: 'completed',
        proofRequired: true,
      },
      {
        id: 'm2',
        title: '线下研修班费用',
        targetAmount: 8000,
        releasedAmount: 4000,
        status: 'in_progress',
        proofRequired: true,
      },
      {
        id: 'm3',
        title: '教学资源包配送',
        targetAmount: 4000,
        releasedAmount: 0,
        status: 'pending',
        proofRequired: true,
      },
    ],
    proofs: [],
    createdAt: '2025-12-10T00:00:00Z',
    deadline: '2026-06-10T00:00:00Z',
    status: 'active',
  },
]

// Mock donations
export const mockDonations: Donation[] = [
  {
    id: 'd1',
    campaignId: '1',
    donor: '0x1111111111111111111111111111111111111111',
    amount: 20,
    txHash: '0xdef456...',
    timestamp: '2026-01-15T10:30:00Z',
  },
  {
    id: 'd2',
    campaignId: '1',
    donor: '0x2222222222222222222222222222222222222222',
    amount: 100,
    txHash: '0xghi789...',
    timestamp: '2026-01-15T11:00:00Z',
  },
  {
    id: 'd3',
    campaignId: '2',
    donor: '0x1111111111111111111111111111111111111111',
    amount: 50,
    txHash: '0xjkl012...',
    timestamp: '2026-01-16T09:15:00Z',
  },
  {
    id: 'd4',
    campaignId: '3',
    donor: '0x3333333333333333333333333333333333333333',
    amount: 30,
    txHash: '0xmno345...',
    timestamp: '2026-01-16T14:20:00Z',
  },
]

// Helper functions
export function getCampaignById(id: string): Campaign | undefined {
  return mockCampaigns.find((c) => c.id === id)
}

export function getDonationsByCampaign(campaignId: string): Donation[] {
  return mockDonations.filter((d) => d.campaignId === campaignId)
}

export function getDonationsByDonor(donorAddress: string): Donation[] {
  return mockDonations.filter(
    (d) => d.donor.toLowerCase() === donorAddress.toLowerCase()
  )
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Category colors for SHE³ - Warm earthy tones
export const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  '女性健康': { bg: 'bg-[#C4866B]/10', text: 'text-[#B5776C]', border: 'border-[#C4866B]/20' },
  '女性教育': { bg: 'bg-[#A8B5A0]/10', text: 'text-[#7A8B72]', border: 'border-[#A8B5A0]/20' },
  '女性赋能': { bg: 'bg-[#D4A59A]/10', text: 'text-[#B08578]', border: 'border-[#D4A59A]/20' },
  '心理健康': { bg: 'bg-[#8FA584]/10', text: 'text-[#6B7D62]', border: 'border-[#8FA584]/20' },
}

export function getCategoryStyle(category: string) {
  return categoryColors[category] || { bg: 'bg-[#C4866B]/10', text: 'text-[#B5776C]', border: 'border-[#C4866B]/20' }
}
