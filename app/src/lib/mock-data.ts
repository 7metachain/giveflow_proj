// Mock data for demo purposes

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

// Mock campaigns
export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    title: '乡村医疗救助计划',
    description: '为偏远山区的村民提供基本医疗服务和药品支持。每一分钱都将用于购买必需药品和医疗器械。',
    beneficiary: '0x1234567890abcdef1234567890abcdef12345678',
    beneficiaryName: 'Alice Wang',
    targetAmount: 10000,
    raisedAmount: 7500,
    donorsCount: 156,
    category: '医疗健康',
    imageUrl: '/images/medical.jpg',
    milestones: [
      {
        id: 'm1',
        title: '第一批药品采购',
        targetAmount: 3000,
        releasedAmount: 3000,
        status: 'completed',
        proofRequired: true,
      },
      {
        id: 'm2',
        title: '医疗设备购置',
        targetAmount: 4000,
        releasedAmount: 2000,
        status: 'in_progress',
        proofRequired: true,
      },
      {
        id: 'm3',
        title: '村医培训费用',
        targetAmount: 3000,
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
        amount: 3000,
        description: '药品采购发票 - 2026年1月',
        status: 'ai_approved',
        aiReview: {
          status: 'approved',
          confidence: 0.95,
          extracted: {
            amount: 3000,
            date: '2026-01-10',
            recipient: '乡村医疗站',
            purpose: '药品采购',
          },
          checks: {
            amountMatch: true,
            dateValid: true,
            formatValid: true,
            authenticityScore: 0.92,
            purposeMatch: true,
          },
          reason: '凭证金额与申请金额一致，日期有效，用途与里程碑描述匹配',
        },
        submittedAt: '2026-01-10T08:00:00Z',
        reviewedAt: '2026-01-10T08:00:15Z',
        txHash: '0xabc123...',
      },
    ],
    createdAt: '2025-12-01T00:00:00Z',
    deadline: '2026-03-01T00:00:00Z',
    status: 'active',
  },
  {
    id: '2',
    title: '山区儿童教育支持',
    description: '为贫困山区的孩子们提供学习用品、书籍和在线教育资源。',
    beneficiary: '0xabcdef1234567890abcdef1234567890abcdef12',
    beneficiaryName: 'Bob Chen',
    targetAmount: 15000,
    raisedAmount: 12000,
    donorsCount: 234,
    category: '教育助学',
    imageUrl: '/images/education.jpg',
    milestones: [
      {
        id: 'm1',
        title: '学习用品采购',
        targetAmount: 5000,
        releasedAmount: 5000,
        status: 'completed',
        proofRequired: true,
      },
      {
        id: 'm2',
        title: '图书馆建设',
        targetAmount: 6000,
        releasedAmount: 4000,
        status: 'in_progress',
        proofRequired: true,
      },
      {
        id: 'm3',
        title: '在线课程订阅',
        targetAmount: 4000,
        releasedAmount: 0,
        status: 'pending',
        proofRequired: true,
      },
    ],
    proofs: [],
    createdAt: '2025-11-15T00:00:00Z',
    deadline: '2026-02-15T00:00:00Z',
    status: 'active',
  },
  {
    id: '3',
    title: '灾区紧急救援物资',
    description: '为受灾地区提供紧急救援物资，包括食品、饮用水和临时住所。',
    beneficiary: '0x9876543210fedcba9876543210fedcba98765432',
    beneficiaryName: 'Charlie Li',
    targetAmount: 50000,
    raisedAmount: 35000,
    donorsCount: 512,
    category: '灾害救助',
    imageUrl: '/images/disaster.jpg',
    milestones: [
      {
        id: 'm1',
        title: '紧急食品和饮水',
        targetAmount: 20000,
        releasedAmount: 20000,
        status: 'completed',
        proofRequired: true,
      },
      {
        id: 'm2',
        title: '临时帐篷搭建',
        targetAmount: 15000,
        releasedAmount: 10000,
        status: 'in_progress',
        proofRequired: true,
      },
      {
        id: 'm3',
        title: '后续重建支援',
        targetAmount: 15000,
        releasedAmount: 0,
        status: 'pending',
        proofRequired: true,
      },
    ],
    proofs: [],
    createdAt: '2026-01-05T00:00:00Z',
    deadline: '2026-04-05T00:00:00Z',
    status: 'active',
  },
]

// Mock donations
export const mockDonations: Donation[] = [
  {
    id: 'd1',
    campaignId: '1',
    donor: '0x1111111111111111111111111111111111111111',
    amount: 10,
    txHash: '0xdef456...',
    timestamp: '2026-01-15T10:30:00Z',
  },
  {
    id: 'd2',
    campaignId: '1',
    donor: '0x2222222222222222222222222222222222222222',
    amount: 50,
    txHash: '0xghi789...',
    timestamp: '2026-01-15T11:00:00Z',
  },
  {
    id: 'd3',
    campaignId: '1',
    donor: '0x1111111111111111111111111111111111111111',
    amount: 25,
    txHash: '0xjkl012...',
    timestamp: '2026-01-16T09:15:00Z',
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
