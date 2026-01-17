// Contract ABIs and addresses
import { CONTRACT_ADDRESSES } from './web3'

// CampaignRegistry ABI (simplified for demo)
export const CampaignRegistryABI = [
  {
    name: 'createCampaign',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_title', type: 'string' },
      { name: '_description', type: 'string' },
      { name: '_category', type: 'string' },
      { name: '_targetAmount', type: 'uint256' },
      { name: '_deadline', type: 'uint256' },
      { name: '_metadataUri', type: 'string' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'donate',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: '_campaignId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'getCampaign',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_campaignId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'beneficiary', type: 'address' },
          { name: 'title', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'category', type: 'string' },
          { name: 'targetAmount', type: 'uint256' },
          { name: 'raisedAmount', type: 'uint256' },
          { name: 'donorsCount', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'metadataUri', type: 'string' },
        ],
      },
    ],
  },
  {
    name: 'campaignCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'CampaignCreated',
    type: 'event',
    inputs: [
      { name: 'campaignId', type: 'uint256', indexed: true },
      { name: 'beneficiary', type: 'address', indexed: true },
      { name: 'title', type: 'string', indexed: false },
      { name: 'targetAmount', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'DonationReceived',
    type: 'event',
    inputs: [
      { name: 'campaignId', type: 'uint256', indexed: true },
      { name: 'donor', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
] as const

// ProofRegistry ABI (simplified for demo)
export const ProofRegistryABI = [
  {
    name: 'submitProof',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_campaignId', type: 'uint256' },
      { name: '_milestoneId', type: 'uint256' },
      { name: '_proofHash', type: 'bytes32' },
      { name: '_amount', type: 'uint256' },
      { name: '_ipfsUri', type: 'string' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'recordAIReview',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_proofId', type: 'uint256' },
      { name: '_status', type: 'uint8' },
      { name: '_confidence', type: 'uint256' },
      { name: '_aiReportHash', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    name: 'getProof',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_proofId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'campaignId', type: 'uint256' },
          { name: 'milestoneId', type: 'uint256' },
          { name: 'submitter', type: 'address' },
          { name: 'proofHash', type: 'bytes32' },
          { name: 'aiReportHash', type: 'bytes32' },
          { name: 'amount', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'confidence', type: 'uint256' },
          { name: 'ipfsUri', type: 'string' },
          { name: 'submittedAt', type: 'uint256' },
          { name: 'reviewedAt', type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'isProofApproved',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_proofId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'ProofSubmitted',
    type: 'event',
    inputs: [
      { name: 'proofId', type: 'uint256', indexed: true },
      { name: 'campaignId', type: 'uint256', indexed: true },
      { name: 'milestoneId', type: 'uint256', indexed: false },
      { name: 'submitter', type: 'address', indexed: true },
      { name: 'proofHash', type: 'bytes32', indexed: false },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'AIReviewRecorded',
    type: 'event',
    inputs: [
      { name: 'proofId', type: 'uint256', indexed: true },
      { name: 'campaignId', type: 'uint256', indexed: true },
      { name: 'status', type: 'uint8', indexed: false },
      { name: 'confidence', type: 'uint256', indexed: false },
      { name: 'aiReportHash', type: 'bytes32', indexed: false },
    ],
  },
] as const

// MilestoneVault ABI (simplified for demo)
export const MilestoneVaultABI = [
  {
    name: 'createMilestone',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_campaignId', type: 'uint256' },
      { name: '_title', type: 'string' },
      { name: '_targetAmount', type: 'uint256' },
      { name: '_proofRequired', type: 'bool' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: '_campaignId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'withdrawWithProof',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_campaignId', type: 'uint256' },
      { name: '_milestoneId', type: 'uint256' },
      { name: '_proofId', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'getMilestone',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_milestoneId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'campaignId', type: 'uint256' },
          { name: 'title', type: 'string' },
          { name: 'targetAmount', type: 'uint256' },
          { name: 'releasedAmount', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'proofRequired', type: 'bool' },
          { name: 'createdAt', type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'getCampaignBalance',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_campaignId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'WithdrawalExecuted',
    type: 'event',
    inputs: [
      { name: 'withdrawalId', type: 'uint256', indexed: true },
      { name: 'campaignId', type: 'uint256', indexed: true },
      { name: 'milestoneId', type: 'uint256', indexed: true },
      { name: 'proofId', type: 'uint256', indexed: false },
      { name: 'recipient', type: 'address', indexed: false },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
] as const

// BatchDonate ABI - 批量捐赠合约
export const BatchDonateABI = [
  {
    name: 'batchDonate',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: '_campaignIds', type: 'uint256[]' },
      { name: '_amounts', type: 'uint256[]' },
    ],
    outputs: [],
  },
  {
    name: 'splitDonate',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: '_campaignIds', type: 'uint256[]' }],
    outputs: [],
  },
  {
    name: 'getDonorHistory',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_donor', type: 'address' }],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'campaignId', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'getDonorTotalAmount',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_donor', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'totalBatchDonations',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'totalAmountDonated',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'BatchDonationExecuted',
    type: 'event',
    inputs: [
      { name: 'donor', type: 'address', indexed: true },
      { name: 'campaignIds', type: 'uint256[]', indexed: false },
      { name: 'amounts', type: 'uint256[]', indexed: false },
      { name: 'totalAmount', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'SingleDonationInBatch',
    type: 'event',
    inputs: [
      { name: 'donor', type: 'address', indexed: true },
      { name: 'campaignId', type: 'uint256', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
] as const

// Contract configuration
export const contractConfig = {
  campaignRegistry: {
    address: CONTRACT_ADDRESSES.campaignRegistry,
    abi: CampaignRegistryABI,
  },
  proofRegistry: {
    address: CONTRACT_ADDRESSES.proofRegistry,
    abi: ProofRegistryABI,
  },
  milestoneVault: {
    address: CONTRACT_ADDRESSES.milestoneVault,
    abi: MilestoneVaultABI,
  },
  batchDonate: {
    address: CONTRACT_ADDRESSES.batchDonate,
    abi: BatchDonateABI,
  },
}

// Helper function to get proof status text
export function getProofStatusText(status: number): string {
  const statusMap: Record<number, string> = {
    0: '待审核',
    1: 'AI 审核通过',
    2: 'AI 审核拒绝',
    3: '人工复核中',
    4: '人工审核通过',
    5: '人工审核拒绝',
  }
  return statusMap[status] || '未知状态'
}

// Helper function to get milestone status text
export function getMilestoneStatusText(status: number): string {
  const statusMap: Record<number, string> = {
    0: '待开始',
    1: '进行中',
    2: '已完成',
    3: '已取消',
  }
  return statusMap[status] || '未知状态'
}
