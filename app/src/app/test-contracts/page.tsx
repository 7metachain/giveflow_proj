'use client'

import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { parseEther, formatEther, keccak256, toBytes } from 'viem'
import { contractConfig, getProofStatusText, getMilestoneStatusText } from '@/lib/contracts'

export default function TestContractsPage() {
  const { address, isConnected } = useAccount()
  const [logs, setLogs] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'campaign' | 'proof' | 'milestone' | 'batch'>('campaign')

  // Campaign 表单状态
  const [campaignId, setCampaignId] = useState('1')
  const [donationAmount, setDonationAmount] = useState('0.001')
  const [newCampaign, setNewCampaign] = useState({
    title: '测试项目 - 医疗救助',
    description: '这是一个测试项目，用于验证合约功能。目标是为需要帮助的人提供医疗援助。',
    category: 'medical',
    targetAmount: '1',
    deadline: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
  })

  // Proof 表单状态
  const [proofId, setProofId] = useState('1')
  const [newProof, setNewProof] = useState({
    campaignId: '1',
    milestoneId: '1',
    amount: '0.1',
    ipfsUri: 'ipfs://QmTest123',
  })

  // Milestone 表单状态
  const [milestoneId, setMilestoneId] = useState('1')
  const [newMilestone, setNewMilestone] = useState({
    campaignId: '1',
    title: '第一阶段 - 采购医疗设备',
    targetAmount: '0.5',
    proofRequired: true,
  })

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev])
  }

  // ==================== CampaignRegistry 合约操作 ====================

  const { writeContract: createCampaign, isPending: isCreating } = useWriteContract({
    mutation: {
      onSuccess: (data) => {
        addLog('✅ 项目创建成功！')
        addLog(`📝 交易哈希: ${data}`)
      },
      onError: (error: any) => {
        addLog(`❌ 创建失败: ${error.message}`)
      },
    },
  })

  const handleCreateCampaign = async () => {
    if (!address) {
      addLog('❌ 请先连接钱包')
      return
    }
    try {
      addLog('📝 创建项目...')
      await createCampaign({
        ...contractConfig.campaignRegistry,
        functionName: 'createCampaign',
        args: [
          newCampaign.title,
          newCampaign.description,
          newCampaign.category,
          parseEther(newCampaign.targetAmount),
          BigInt(newCampaign.deadline),
          '',
        ],
      })
    } catch (error: any) {
      addLog(`❌ 错误: ${error.message}`)
    }
  }

  const { data: campaignCount, refetch: refetchCount } = useReadContract({
    ...contractConfig.campaignRegistry,
    functionName: 'campaignCount',
  })

  const { data: campaign, refetch: refetchCampaign } = useReadContract({
    ...contractConfig.campaignRegistry,
    functionName: 'getCampaign',
    args: [BigInt(campaignId)],
    query: {
      enabled: !!campaignId && campaignId !== '0',
    },
  })

  const { writeContract: donate, isPending: isDonating } = useWriteContract({
    mutation: {
      onSuccess: () => {
        addLog('✅ 捐赠成功！')
        refetchCount()
        refetchCampaign()
      },
      onError: (error: any) => {
        addLog(`❌ 捐赠��败: ${error.message}`)
      },
    },
  })

  const handleDonate = async () => {
    if (!address) {
      addLog('❌ 请先连接钱包')
      return
    }
    try {
      addLog(`💰 向项目 ${campaignId} 捐赠 ${donationAmount} MON`)
      await donate({
        ...contractConfig.campaignRegistry,
        functionName: 'donate',
        args: [BigInt(campaignId)],
        value: parseEther(donationAmount),
      })
    } catch (error: any) {
      addLog(`❌ 错误: ${error.message}`)
    }
  }

  // ==================== ProofRegistry 合约操作 ====================

  const { writeContract: submitProof, isPending: isSubmittingProof } = useWriteContract({
    mutation: {
      onSuccess: (data) => {
        addLog('✅ 凭证提交成功！')
        addLog(`📝 交易哈希: ${data}`)
      },
      onError: (error: any) => {
        addLog(`❌ 提交失败: ${error.message}`)
      },
    },
  })

  const handleSubmitProof = async () => {
    if (!address) {
      addLog('❌ 请先连接钱包')
      return
    }
    try {
      const proofHash = keccak256(toBytes(newProof.ipfsUri))
      addLog('📤 提交凭证...')
      addLog(`   项目ID: ${newProof.campaignId}`)
      addLog(`   里程碑ID: ${newProof.milestoneId}`)
      addLog(`   金额: ${newProof.amount} MON`)
      addLog(`   IPFS: ${newProof.ipfsUri}`)

      await submitProof({
        ...contractConfig.proofRegistry,
        functionName: 'submitProof',
        args: [
          BigInt(newProof.campaignId),
          BigInt(newProof.milestoneId),
          proofHash,
          parseEther(newProof.amount),
          newProof.ipfsUri,
        ],
      })
    } catch (error: any) {
      addLog(`❌ 错误: ${error.message}`)
    }
  }

  const { data: proof, refetch: refetchProof } = useReadContract({
    ...contractConfig.proofRegistry,
    functionName: 'getProof',
    args: [BigInt(proofId)],
    query: {
      enabled: !!proofId && proofId !== '0',
    },
  })

  const { data: proofCount } = useReadContract({
    ...contractConfig.proofRegistry,
    functionName: 'proofCount',
  })

  // ==================== MilestoneVault 合约操作 ====================

  const { writeContract: createMilestone, isPending: isCreatingMilestone } = useWriteContract({
    mutation: {
      onSuccess: (data) => {
        addLog('✅ 里程碑创建成功！')
        addLog(`📝 交易哈希: ${data}`)
      },
      onError: (error: any) => {
        addLog(`❌ 创建失败: ${error.message}`)
      },
    },
  })

  const handleCreateMilestone = async () => {
    if (!address) {
      addLog('❌ 请先连接钱包')
      return
    }
    try {
      addLog('🎯 创建里程碑...')
      addLog(`   项目ID: ${newMilestone.campaignId}`)
      addLog(`   标题: ${newMilestone.title}`)
      addLog(`   目标金额: ${newMilestone.targetAmount} MON`)

      await createMilestone({
        ...contractConfig.milestoneVault,
        functionName: 'createMilestone',
        args: [
          BigInt(newMilestone.campaignId),
          newMilestone.title,
          parseEther(newMilestone.targetAmount),
          newMilestone.proofRequired,
        ],
      })
    } catch (error: any) {
      addLog(`❌ 错误: ${error.message}`)
    }
  }

  const { data: milestone, refetch: refetchMilestone } = useReadContract({
    ...contractConfig.milestoneVault,
    functionName: 'getMilestone',
    args: [BigInt(milestoneId)],
    query: {
      enabled: !!milestoneId && milestoneId !== '0',
    },
  })

  const { data: milestoneCount } = useReadContract({
    ...contractConfig.milestoneVault,
    functionName: 'milestoneCount',
  })

  const { data: campaignBalance } = useReadContract({
    ...contractConfig.milestoneVault,
    functionName: 'getCampaignBalance',
    args: [BigInt(campaignId)],
    query: {
      enabled: !!campaignId && campaignId !== '0',
    },
  })

  const { writeContract: withdrawWithProof, isPending: isWithdrawing } = useWriteContract({
    mutation: {
      onSuccess: (data) => {
        addLog('✅ 提款成功！')
        addLog(`📝 交易哈希: ${data}`)
        refetchMilestone()
      },
      onError: (error: any) => {
        addLog(`❌ 提款失败: ${error.message}`)
      },
    },
  })

  const handleWithdraw = async () => {
    if (!address) {
      addLog('❌ 请先连接钱包')
      return
    }
    try {
      addLog('💸 提取资金...')
      addLog(`   项目ID: ${campaignId}`)
      addLog(`   里程碑ID: ${milestoneId}`)
      addLog(`   凭证ID: ${proofId}`)

      await withdrawWithProof({
        ...contractConfig.milestoneVault,
        functionName: 'withdrawWithProof',
        args: [BigInt(campaignId), BigInt(milestoneId), BigInt(proofId)],
      })
    } catch (error: any) {
      addLog(`❌ 错误: ${error.message}`)
    }
  }

  // ==================== BatchDonate 合约操作 ====================

  const { writeContract: batchDonate, isPending: isBatchDonating } = useWriteContract({
    mutation: {
      onSuccess: () => {
        addLog('✅ 批量捐赠成功！')
        refetchCount()
        refetchCampaign()
      },
      onError: (error: any) => {
        addLog(`❌ 批量捐赠失败: ${error.message}`)
      },
    },
  })

  const handleBatchDonate = async () => {
    if (!address) {
      addLog('❌ 请先连接钱包')
      return
    }
    try {
      const campaignIds = [BigInt(1), BigInt(2)]
      const amounts = campaignIds.map(() => parseEther(donationAmount))
      const totalAmount = parseEther(String(parseFloat(donationAmount) * campaignIds.length))

      addLog(`⚡ 批量捐赠 ${campaignIds.length} 个项目`)
      addLog(`   每个项目: ${donationAmount} MON`)
      addLog(`   总计: ${(parseFloat(donationAmount) * campaignIds.length).toFixed(3)} MON`)

      await batchDonate({
        ...contractConfig.batchDonate,
        functionName: 'batchDonate',
        args: [campaignIds, amounts],
        value: totalAmount,
      })
    } catch (error: any) {
      addLog(`❌ 错误: ${error.message}`)
    }
  }

  const { data: donorHistory } = useReadContract({
    ...contractConfig.batchDonate,
    functionName: 'getDonorHistory',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: donorTotal } = useReadContract({
    ...contractConfig.batchDonate,
    functionName: 'getDonorTotalAmount',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  })

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <h1 className="text-4xl font-bold mb-4">🧪 GiveFlow 全功能测试</h1>
      <p className="text-gray-600 mb-6">测试所有 4 个合约的完整功能</p>

      {/* 钱包状态 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                <span className="text-green-600 text-2xl">✅</span>
                <div>
                  <p className="font-semibold">已连接</p>
                  <p className="text-sm text-gray-600">{address?.slice(0, 8)}...{address?.slice(-6)}</p>
                </div>
              </>
            ) : (
              <>
                <span className="text-red-600 text-2xl">❌</span>
                <p className="font-semibold">未连接钱包</p>
              </>
            )}
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>网络: Monad Testnet</p>
            <p>Chain ID: 10143</p>
          </div>
        </div>
      </div>

      {/* Tab 导航 */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('campaign')}
          className={`px-6 py-3 font-semibold ${activeTab === 'campaign' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          📋 项目管理 (CampaignRegistry)
        </button>
        <button
          onClick={() => setActiveTab('proof')}
          className={`px-6 py-3 font-semibold ${activeTab === 'proof' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-600'}`}
        >
          🔍 凭证管理 (ProofRegistry)
        </button>
        <button
          onClick={() => setActiveTab('milestone')}
          className={`px-6 py-3 font-semibold ${activeTab === 'milestone' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-600'}`}
        >
          🎯 里程碑 (MilestoneVault)
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`px-6 py-3 font-semibold ${activeTab === 'batch' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-600'}`}
        >
          ⚡ 批量捐赠 (BatchDonate)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：操作面板 */}
        <div className="space-y-6">
          {/* CampaignRegistry 面板 */}
          {activeTab === 'campaign' && (
            <>
              <div className="bg-white rounded-lg shadow p-6 border-2 border-blue-200">
                <h2 className="text-xl font-semibold mb-4">📝 创建项目</h2>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newCampaign.title}
                    onChange={(e) => setNewCampaign({...newCampaign, title: e.target.value})}
                    placeholder="项目标题"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                  <textarea
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                    placeholder="项目描述"
                    rows={2}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={newCampaign.targetAmount}
                      onChange={(e) => setNewCampaign({...newCampaign, targetAmount: e.target.value})}
                      placeholder="目标金额"
                      step="0.1"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                    />
                    <input
                      type="text"
                      value={newCampaign.category}
                      onChange={(e) => setNewCampaign({...newCampaign, category: e.target.value})}
                      placeholder="类别"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                    />
                  </div>
                  <button
                    onClick={handleCreateCampaign}
                    disabled={!isConnected || isCreating}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
                  >
                    {isCreating ? '创建中...' : '📝 创建项目'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-2 border-green-200">
                <h2 className="text-xl font-semibold mb-4">💰 捐赠</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">项目总数:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {campaignCount?.toString() || '0'}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                    placeholder="项目 ID"
                    min="1"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="捐赠金额"
                    step="0.001"
                    min="0.001"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => refetchCampaign()}
                      className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                      查询项目
                    </button>
                    <button
                      onClick={handleDonate}
                      disabled={!isConnected || isDonating}
                      className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300"
                    >
                      {isDonating ? '捐赠中...' : '💰 捐赠'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ProofRegistry 面板 */}
          {activeTab === 'proof' && (
            <>
              <div className="bg-white rounded-lg shadow p-6 border-2 border-purple-200">
                <h2 className="text-xl font-semibold mb-4">📤 提交凭证</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">凭证总数:</span>
                    <span className="text-xl font-bold text-purple-600">
                      {proofCount?.toString() || '0'}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={newProof.campaignId}
                    onChange={(e) => setNewProof({...newProof, campaignId: e.target.value})}
                    placeholder="项目 ID"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                  <input
                    type="number"
                    value={newProof.milestoneId}
                    onChange={(e) => setNewProof({...newProof, milestoneId: e.target.value})}
                    placeholder="里程碑 ID"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                  <input
                    type="number"
                    value={newProof.amount}
                    onChange={(e) => setNewProof({...newProof, amount: e.target.value})}
                    placeholder="申请金额"
                    step="0.01"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                  <input
                    type="text"
                    value={newProof.ipfsUri}
                    onChange={(e) => setNewProof({...newProof, ipfsUri: e.target.value})}
                    placeholder="IPFS URI"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                  <button
                    onClick={handleSubmitProof}
                    disabled={!isConnected || isSubmittingProof}
                    className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-300"
                  >
                    {isSubmittingProof ? '提交中...' : '📤 提交凭证'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-2 border-indigo-200">
                <h2 className="text-xl font-semibold mb-4">🔍 查询凭证</h2>
                <div className="space-y-3">
                  <input
                    type="number"
                    value={proofId}
                    onChange={(e) => setProofId(e.target.value)}
                    placeholder="凭证 ID"
                    min="1"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                  <button
                    onClick={() => refetchProof()}
                    className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
                  >
                    查询凭证
                  </button>
                </div>
              </div>
            </>
          )}

          {/* MilestoneVault 面板 */}
          {activeTab === 'milestone' && (
            <>
              <div className="bg-white rounded-lg shadow p-6 border-2 border-green-200">
                <h2 className="text-xl font-semibold mb-4">🎯 创建里程碑</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">里程碑总数:</span>
                    <span className="text-xl font-bold text-green-600">
                      {milestoneCount?.toString() || '0'}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={newMilestone.campaignId}
                    onChange={(e) => setNewMilestone({...newMilestone, campaignId: e.target.value})}
                    placeholder="项目 ID"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                  <input
                    type="text"
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                    placeholder="里程碑标题"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                  <input
                    type="number"
                    value={newMilestone.targetAmount}
                    onChange={(e) => setNewMilestone({...newMilestone, targetAmount: e.target.value})}
                    placeholder="目标金额"
                    step="0.1"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newMilestone.proofRequired}
                      onChange={(e) => setNewMilestone({...newMilestone, proofRequired: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">需要凭证验证</span>
                  </label>
                  <button
                    onClick={handleCreateMilestone}
                    disabled={!isConnected || isCreatingMilestone}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300"
                  >
                    {isCreatingMilestone ? '创建中...' : '🎯 创建里程碑'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-2 border-teal-200">
                <h2 className="text-xl font-semibold mb-4">💸 提取资金</h2>
                <div className="space-y-3">
                  <input
                    type="number"
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                    placeholder="项目 ID"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                  <input
                    type="number"
                    value={milestoneId}
                    onChange={(e) => setMilestoneId(e.target.value)}
                    placeholder="里程碑 ID"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                  <input
                    type="number"
                    value={proofId}
                    onChange={(e) => setProofId(e.target.value)}
                    placeholder="凭证 ID"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                  />
                  <button
                    onClick={handleWithdraw}
                    disabled={!isConnected || isWithdrawing}
                    className="w-full bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 disabled:bg-gray-300"
                  >
                    {isWithdrawing ? '提取中...' : '💸 凭证提款'}
                  </button>
                  <p className="text-xs text-gray-500">
                    需要凭证审核通过才能提款
                  </p>
                </div>
              </div>
            </>
          )}

          {/* BatchDonate 面板 */}
          {activeTab === 'batch' && (
            <div className="bg-white rounded-lg shadow p-6 border-2 border-orange-200">
              <h2 className="text-xl font-semibold mb-4">⚡ 批量捐赠</h2>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  同时向多个项目捐赠，体验 Monad 并行执行优势
                </p>
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="每个项目的捐赠金额"
                  step="0.001"
                  min="0.001"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
                />
                <div className="p-3 bg-orange-50 rounded">
                  <p className="text-sm">将向项目 1 和 2 各捐赠 <strong>{donationAmount} MON</strong></p>
                  <p className="text-sm">总计: <strong>{(parseFloat(donationAmount) * 2).toFixed(3)} MON</strong></p>
                </div>
                <button
                  onClick={handleBatchDonate}
                  disabled={!isConnected || isBatchDonating}
                  className="w-full bg-orange-500 text-white px-4 py-3 rounded hover:bg-orange-600 disabled:bg-gray-300 font-semibold"
                >
                  {isBatchDonating ? '捐赠中...' : '⚡ 批量捐赠'}
                </button>
                <p className="text-xs text-orange-600">
                  ⭐ Monad 并行执行：一次交易完成多笔捐赠，Gas 费更低
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：显示面板 */}
        <div className="space-y-6">
          {/* 项目详情 */}
          {campaign && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">📋 项目详情</h3>
              <div className="space-y-2 text-sm">
                <p><strong>ID:</strong> {(campaign as any).id?.toString() || 'N/A'}</p>
                <p><strong>标题:</strong> {(campaign as any).title || 'N/A'}</p>
                <p><strong>受益人:</strong> {(campaign as any).beneficiary || 'N/A'}</p>
                <p><strong>类别:</strong> {(campaign as any).category || 'N/A'}</p>
                <p><strong>目标:</strong> {(campaign as any).targetAmount ? formatEther((campaign as any).targetAmount) : '0'} MON</p>
                <p><strong>已筹:</strong> {(campaign as any).raisedAmount ? formatEther((campaign as any).raisedAmount) : '0'} MON</p>
                <p><strong>捐赠人:</strong> {(campaign as any).donorsCount?.toString() || '0'}</p>
                <p><strong>状态:</strong> {(campaign as any).status === 0 ? '✅ 活跃' : '❌ 已结束'}</p>
              </div>
            </div>
          )}

          {/* 凭证详情 */}
          {proof && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">🔍 凭证详情</h3>
              <div className="space-y-2 text-sm">
                <p><strong>ID:</strong> {(proof as any).id?.toString() || 'N/A'}</p>
                <p><strong>项目ID:</strong> {(proof as any).campaignId?.toString() || 'N/A'}</p>
                <p><strong>里程碑ID:</strong> {(proof as any).milestoneId?.toString() || 'N/A'}</p>
                <p><strong>提交者:</strong> {(proof as any).submitter || 'N/A'}</p>
                <p><strong>金额:</strong> {(proof as any).amount ? formatEther((proof as any).amount) : '0'} MON</p>
                <p><strong>状态:</strong> <span className="font-semibold">{getProofStatusText((proof as any).status)}</span></p>
                <p><strong>置信度:</strong> {((proof as any).confidence || 0) / 100}%</p>
                <p><strong>IPFS:</strong> {(proof as any).ipfsUri || 'N/A'}</p>
              </div>
            </div>
          )}

          {/* 里程碑详情 */}
          {milestone && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">🎯 里程碑详情</h3>
              <div className="space-y-2 text-sm">
                <p><strong>ID:</strong> {(milestone as any).id?.toString() || 'N/A'}</p>
                <p><strong>项目ID:</strong> {(milestone as any).campaignId?.toString() || 'N/A'}</p>
                <p><strong>标题:</strong> {(milestone as any).title || 'N/A'}</p>
                <p><strong>目标:</strong> {(milestone as any).targetAmount ? formatEther((milestone as any).targetAmount) : '0'} MON</p>
                <p><strong>已释放:</strong> {(milestone as any).releasedAmount ? formatEther((milestone as any).releasedAmount) : '0'} MON</p>
                <p><strong>状态:</strong> <span className="font-semibold">{getMilestoneStatusText((milestone as any).status)}</span></p>
                <p><strong>需凭证:</strong> {(milestone as any).proofRequired ? '是' : '否'}</p>
              </div>
            </div>
          )}

          {/* 项目余额 */}
          {campaignBalance !== undefined && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">💰 项目余额</h3>
              <p className="text-2xl font-bold text-green-600">
                {formatEther(campaignBalance)} MON
              </p>
              <p className="text-sm text-gray-500 mt-1">
                项目 {campaignId} 在 MilestoneVault 中的余额
              </p>
            </div>
          )}

          {/* 用户统计 */}
          {address && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">📊 您的捐赠统计</h3>
              <div className="space-y-3">
                <div className="flex justify-between p-2 bg-blue-50 rounded">
                  <span>总捐赠:</span>
                  <span className="font-bold text-blue-600">
                    {donorTotal ? formatEther(donorTotal) : '0'} MON
                  </span>
                </div>
                {donorHistory && donorHistory.length > 0 && (
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {donorHistory.map((donation: any, index: number) => (
                      <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                        <div className="flex justify-between">
                          <span>项目 #{donation.campaignId.toString()}</span>
                          <span className="font-semibold text-green-600">
                            {formatEther(donation.amount)} MON
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 操作日志 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">📝 操作日志</h3>
              <button
                onClick={() => setLogs([])}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                清空
              </button>
            </div>
            <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500">等待操作...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 合约地址信息 */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📜 合约地址</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="p-3 bg-blue-50 rounded">
            <p className="font-semibold text-blue-700">CampaignRegistry</p>
            <p className="text-xs text-gray-600 mt-1 break-all">
              {contractConfig.campaignRegistry.address}
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded">
            <p className="font-semibold text-purple-700">ProofRegistry</p>
            <p className="text-xs text-gray-600 mt-1 break-all">
              {contractConfig.proofRegistry.address}
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded">
            <p className="font-semibold text-green-700">MilestoneVault</p>
            <p className="text-xs text-gray-600 mt-1 break-all">
              {contractConfig.milestoneVault.address}
            </p>
          </div>
          <div className="p-3 bg-orange-50 rounded">
            <p className="font-semibold text-orange-700">BatchDonate</p>
            <p className="text-xs text-gray-600 mt-1 break-all">
              {contractConfig.batchDonate.address}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <a
            href={`https://testnet.monadexplorer.com/address/${contractConfig.campaignRegistry.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            🔍 在 Monad Explorer 查看 →
          </a>
        </div>
      </div>
    </div>
  )
}
