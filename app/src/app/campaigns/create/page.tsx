'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Stethoscope,
  GraduationCap,
  Sparkles,
  Heart,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Loader2,
} from 'lucide-react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { contractConfig } from '@/lib/contracts'
import { useEffect } from 'react'

const categories = [
  { name: '女性健康', icon: Stethoscope, color: 'text-[#B5776C]' },
  { name: '女性教育', icon: GraduationCap, color: 'text-[#7A8B72]' },
  { name: '女性赋能', icon: Sparkles, color: 'text-[#B08578]' },
  { name: '心理健康', icon: Heart, color: 'text-[#6B7D62]' },
]

interface Milestone {
  title: string
  targetAmount: number
  proofRequired: boolean
}

export default function CreateCampaignPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()

  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  // wagmi writeContract hook
  const { writeContract: createCampaignOnChain, isPending: isCreatingOnChain } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        console.log('✅ 链上交易已提交，交易哈希:', hash)
        setTxHash(hash)
        setSubmitStatus({
          type: 'success',
          message: '交易已提交，正在等待链上确认...'
        })
      },
      onError: (error: any) => {
        console.error('❌ 链上创建失败:', error)
        setSubmitStatus({
          type: 'error',
          message: `链上交易失败: ${error.message || '未知错误'}`
        })
        setIsSubmitting(false)
      },
    },
  })

  // 等待交易确认并获取项目ID
  const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // 当交易确认后，提取项目ID并保存到后端
  useEffect(() => {
    if (receipt) {
      handleTransactionReceipt(receipt)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt])

  // 处理交易收据，提取项目ID
  const handleTransactionReceipt = async (data: any) => {
    console.log('📜 交易收据:', data)

    // 从事件日志中提取项目ID
    const campaignCreatedEvent = data.logs.find((log: any) => {
      return log.address.toLowerCase() === contractConfig.campaignRegistry.address.toLowerCase()
    })

    if (campaignCreatedEvent) {
      // CampaignCreated事件: event CampaignCreated(uint256 indexed campaignId, address indexed beneficiary, string title, uint256 targetAmount)
      // campaignId是第一个indexed参数，在topics[1]
      const campaignIdHex = campaignCreatedEvent.topics[1]
      const campaignId = parseInt(campaignIdHex, 16)

      console.log('🎉 从链上事件提取到项目ID:', campaignId)

      // 保存到后端
      await saveToBackend(String(campaignId))
    } else {
      console.error('❌ 未找到CampaignCreated事件')
      setSubmitStatus({
        type: 'error',
        message: '未找到项目创建事件，请联系技术支持'
      })
      setIsSubmitting(false)
    }
  }

  // 保存到后端数据库
  const saveToBackend = async (campaignIdOnChain: string) => {
    console.log('💾 保存项目信息到后端...')
    console.log('  - 链上项目ID:', campaignIdOnChain)

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          category,
          beneficiaryName,
          beneficiary,
          targetAmount: Number(targetAmount),
          deadline,
          imageUrl,
          milestones,
          onChain: true,
          chainCampaignId: campaignIdOnChain, // 使用链上返回的项目ID
          txHash: txHash,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitStatus({
          type: 'success',
          message: '🎉 项目创建成功！已上链并保存到数据库。正在跳转...'
        })
        setTimeout(() => {
          router.push(`/campaigns/${campaignIdOnChain}`) // 跳转到链上项目ID
        }, 2000)
      } else {
        setSubmitStatus({ type: 'error', message: data.error || '保存到数据库失败，请重试' })
        setIsSubmitting(false)
      }
    } catch (error: any) {
      console.error('❌ 保存到后端失败:', error)
      setSubmitStatus({ type: 'error', message: error.message || '保存到数据库失败' })
      setIsSubmitting(false)
    }
  }

  // 基本信息
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [beneficiaryName, setBeneficiaryName] = useState('')
  const [beneficiary, setBeneficiary] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  // 里程碑
  const [milestones, setMilestones] = useState<Milestone[]>([
    { title: '', targetAmount: 0, proofRequired: true },
  ])

  // 计算里程碑总金额
  const milestonesTotal = milestones.reduce((sum, m) => sum + m.targetAmount, 0)
  const targetAmountNum = Number(targetAmount) || 0
  const isMilestonesValid = Math.abs(milestonesTotal - targetAmountNum) < 0.01 && milestonesTotal > 0

  // 添加里程碑
  const addMilestone = () => {
    setMilestones([...milestones, { title: '', targetAmount: 0, proofRequired: true }])
  }

  // 删除里程碑
  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index))
    }
  }

  // 更新里程碑
  const updateMilestone = (index: number, field: keyof Milestone, value: string | number | boolean) => {
    const newMilestones = [...milestones]
    ;(newMilestones[index] as any)[field] = value
    setMilestones(newMilestones)
  }

  // 表单验证
  const validateForm = (): boolean => {
    if (!title.trim()) {
      setSubmitStatus({ type: 'error', message: '请输入项目标题' })
      return false
    }
    if (!description.trim()) {
      setSubmitStatus({ type: 'error', message: '请输入项目描述' })
      return false
    }
    if (!category) {
      setSubmitStatus({ type: 'error', message: '请选择项目类别' })
      return false
    }
    if (!beneficiaryName.trim()) {
      setSubmitStatus({ type: 'error', message: '请输入受益人名称' })
      return false
    }
    if (!beneficiary.trim()) {
      setSubmitStatus({ type: 'error', message: '请输入受益人钱包地址' })
      return false
    }
    if (!targetAmount || Number(targetAmount) <= 0) {
      setSubmitStatus({ type: 'error', message: '请输入有效的目标金额' })
      return false
    }
    if (!deadline) {
      setSubmitStatus({ type: 'error', message: '请选择项目截止日期' })
      return false
    }
    if (milestones.some((m) => !m.title.trim() || m.targetAmount <= 0)) {
      setSubmitStatus({ type: 'error', message: '请完整填写所有里程碑信息' })
      return false
    }
    if (!isMilestonesValid) {
      setSubmitStatus({
        type: 'error',
        message: `里程碑总额(${milestonesTotal})必须等于目标金额(${targetAmountNum})`,
      })
      return false
    }
    return true
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitStatus({ type: null, message: '' })

    if (!validateForm()) {
      return
    }

    // 检查钱包连接
    if (!isConnected || !address) {
      setSubmitStatus({
        type: 'error',
        message: '请先连接钱包以创建链上项目'
      })
      return
    }

    setIsSubmitting(true)

    try {
      // 调用智能合约在链上创建项目
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000)
      const amountInWei = parseEther(targetAmount)

      console.log('📝 开始在链上创建项目...')
      console.log('  - 受益人地址:', beneficiary)
      console.log('  - 目标金额:', targetAmount, 'MON')
      console.log('  - 截止时间:', new Date(deadlineTimestamp * 1000).toLocaleString())

      createCampaignOnChain({
        ...contractConfig.campaignRegistry,
        functionName: 'createCampaign',
        args: [
          title,
          description,
          category,
          amountInWei,
          BigInt(deadlineTimestamp),
          '', // metadataUri (可选，暂时为空)
        ],
      })

      // 注意：不再需要在这里保存到后端
      // 因为 useWaitForTransactionReceipt 会在交易确认后触发
    } catch (error: any) {
      console.error('❌ 创建项目失败:', error)
      setSubmitStatus({
        type: 'error',
        message: error.message || '创建项目失败，请重试'
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF8F4] via-[#F8F0E8] to-[#F0EBE6]">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/campaigns">
            <Button variant="ghost" className="mb-4 text-[#8B7355] hover:text-[#B5956F]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回项目列表
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#5C4A3A] mb-2">发起新项目</h1>
              <p className="text-[#8B7355]">创建一个新的公益众筹项目，为需要帮助的女性筹集资金</p>
            </div>
            {/* 钱包连接状态 */}
            <div className="text-right">
              {isConnected ? (
                <Badge className="bg-green-100 text-green-700 border-green-300 px-3 py-1">
                  <Wallet className="w-4 h-4 mr-1" />
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </Badge>
              ) : (
                <Badge className="bg-orange-100 text-orange-700 border-orange-300 px-3 py-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  未连接钱包
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <Card className="border-[#C4B5A0]/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#5C4A3A]">基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 项目标题 */}
              <div>
                <label className="block text-sm font-medium text-[#5C4A3A] mb-2">
                  项目标题 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：农村女性宫颈癌筛查计划"
                  className="border-[#C4B5A0]/30"
                  maxLength={100}
                />
                <p className="text-xs text-[#8B7355] mt-1">{title.length}/100 字符</p>
              </div>

              {/* 项目描述 */}
              <div>
                <label className="block text-sm font-medium text-[#5C4A3A] mb-2">
                  项目描述 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="详细描述您的项目目标、受益人群、资金用途等信息"
                  className="w-full min-h-[120px] px-3 py-2 border border-[#C4B5A0]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C4866B]/50 resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-[#8B7355] mt-1">{description.length}/500 字符</p>
              </div>

              {/* 项目类别 */}
              <div>
                <label className="block text-sm font-medium text-[#5C4A3A] mb-2">
                  项目类别 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map((cat) => {
                    const Icon = cat.icon
                    const isSelected = category === cat.name
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => setCategory(cat.name)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-[#C4866B] bg-[#C4866B]/10'
                            : 'border-[#C4B5A0]/20 hover:border-[#C4B5A0]/40'
                        }`}
                      >
                        <Icon className={`h-6 w-6 ${cat.color}`} />
                        <span className="text-sm font-medium text-[#5C4A3A]">{cat.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 项目封面图 */}
              <div>
                <label className="block text-sm font-medium text-[#5C4A3A] mb-2">
                  项目封面图
                </label>
                <div className="flex gap-3">
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="输入图片URL（可选）"
                    className="flex-1 border-[#C4B5A0]/30"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-[#C4B5A0]/30 text-[#8B7355]"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    上传图片
                  </Button>
                </div>
                {imageUrl && (
                  <div className="mt-3 relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                    <img src={imageUrl} alt="预览" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 受益人信息 */}
          <Card className="border-[#C4B5A0]/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#5C4A3A]">受益人信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5C4A3A] mb-2">
                  受益人名称 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="例如：李医生团队"
                  className="border-[#C4B5A0]/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5C4A3A] mb-2">
                  受益人钱包地址 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value)}
                  placeholder="0x..."
                  className="border-[#C4B5A0]/30 font-mono"
                />
                <p className="text-xs text-[#8B7355] mt-1">
                  资金将筹集到此钱包地址，请确保地址正确
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 筹款目标 */}
          <Card className="border-[#C4B5A0]/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#5C4A3A]">筹款目标</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5C4A3A] mb-2">
                  目标金额 (MON) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="例如：10000"
                  className="border-[#C4B5A0]/30"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5C4A3A] mb-2">
                  截止日期 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="border-[#C4B5A0]/30"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </CardContent>
          </Card>

          {/* 里程碑 */}
          <Card className="border-[#C4B5A0]/20 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[#5C4A3A]">资金使用计划</CardTitle>
              <Badge
                variant={isMilestonesValid ? "default" : "destructive"}
                className={isMilestonesValid ? "bg-green-500" : ""}
              >
                {isMilestonesValid ? (
                  <><CheckCircle2 className="mr-1 h-3 w-3" /> 金额匹配</>
                ) : (
                  <><AlertCircle className="mr-1 h-3 w-3" /> 金额不匹配</>
                )}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-[#F8F0E8] p-4 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#5C4A3A]">目标金额：</span>
                  <span className="font-semibold text-[#5C4A3A]">{targetAmountNum || 0} MON</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-[#5C4A3A]">里程碑总额：</span>
                  <span className={`font-semibold ${isMilestonesValid ? 'text-green-600' : 'text-red-600'}`}>
                    {milestonesTotal} MON
                  </span>
                </div>
              </div>

              {milestones.map((milestone, index) => (
                <div key={index} className="border border-[#C4B5A0]/20 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-[#5C4A3A]">里程碑 {index + 1}</h4>
                    {milestones.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMilestone(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#5C4A3A] mb-1">
                      里程碑标题
                    </label>
                    <Input
                      value={milestone.title}
                      onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                      placeholder="例如：检测试剂采购"
                      className="border-[#C4B5A0]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#5C4A3A] mb-1">
                      目标金额 (MON)
                    </label>
                    <Input
                      type="number"
                      value={milestone.targetAmount || ''}
                      onChange={(e) => updateMilestone(index, 'targetAmount', Number(e.target.value))}
                      placeholder="例如：5000"
                      className="border-[#C4B5A0]/30"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`proof-${index}`}
                      checked={milestone.proofRequired}
                      onChange={(e) => updateMilestone(index, 'proofRequired', e.target.checked)}
                      className="w-4 h-4 text-[#C4866B] border-gray-300 rounded focus:ring-[#C4866B]"
                    />
                    <label htmlFor={`proof-${index}`} className="text-sm text-[#5C4A3A]">
                      需要提交支出凭证
                    </label>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addMilestone}
                className="w-full border-[#C4B5A0]/30 text-[#8B7355] hover:bg-[#F8F0E8]"
              >
                <Plus className="mr-2 h-4 w-4" />
                添加里程碑
              </Button>
            </CardContent>
          </Card>

          {/* 提交状态 */}
          {submitStatus.type && (
            <div
              className={`p-4 rounded-lg flex items-center gap-2 ${
                submitStatus.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {submitStatus.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <span>{submitStatus.message}</span>
            </div>
          )}

          {/* 提交按钮 */}
          <div className="flex gap-3">
            <Link href="/campaigns" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full border-[#C4B5A0]/30 text-[#8B7355]"
                disabled={isSubmitting}
              >
                取消
              </Button>
            </Link>
            <Button
              type="submit"
              className="flex-1 bg-[#C4866B] text-white hover:bg-[#B5776C]"
              disabled={isSubmitting || isCreatingOnChain || isConfirming}
            >
              {(isSubmitting || isCreatingOnChain || isConfirming) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isConfirming ? '确认交易中...' : isCreatingOnChain ? '正在上链...' : '创建中...'}
                </>
              ) : (
                '创建项目'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
