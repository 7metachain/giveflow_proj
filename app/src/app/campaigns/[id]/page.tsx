'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Heart,
  CheckCircle,
  Users,
  Clock,
  ExternalLink,
  Shield,
  FileCheck,
  ArrowLeft,
  Loader2,
  Wallet,
  TrendingUp,
  Calendar,
  Brain,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import {
  getDonationsByCampaign,
  formatAmount,
  formatDate,
  shortenAddress,
  getCategoryStyle,
  getCategoryImage,
  Campaign,
  Donation,
} from '@/lib/mock-data'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState, useEffect } from 'react'
import { parseEther } from 'viem'
import { CampaignRegistryABI, BatchDonateABI } from '@/lib/contracts'
import { CONTRACT_ADDRESSES, monadTestnet } from '@/lib/web3'

export default function CampaignDetailPage() {
  const params = useParams()
  const { isConnected, address } = useAccount()
  const [donateAmount, setDonateAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)
  const [txSuccess, setTxSuccess] = useState(false)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [donations, setDonations] = useState<Donation[]>([])
  const [isPageLoading, setIsPageLoading] = useState(true)

  // 合约交互 hooks
  const { writeContract, data: txHash, isPending, error: writeError, reset } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // 监听交易成功
  useEffect(() => {
    if (isSuccess && txHash) {
      setIsLoading(false)
      setTxSuccess(true)
      setDonateAmount('')
      setTimeout(() => setTxSuccess(false), 5000)
    }
  }, [isSuccess, txHash])

  // 监听交易错误
  useEffect(() => {
    if (writeError) {
      setIsLoading(false)
      setTxError(writeError.message || '交易失败，请重试')
    }
  }, [writeError])

  // 更新加载状态
  useEffect(() => {
    setIsLoading(isPending || isConfirming)
  }, [isPending, isConfirming])

  // 从 API 加载项目数据
  useEffect(() => {
    async function fetchCampaignData() {
      setIsPageLoading(true)
      try {
        // 首先尝试从项目列表 API 中查找
        const listResponse = await fetch('/api/campaigns')
        if (listResponse.ok) {
          const listData = await listResponse.json()
          const found = listData.campaigns.find((c: Campaign) => c.id === params.id)
          if (found) {
            setCampaign(found)
            setDonations([]) // 新项目暂时没有捐赠记录
          }
        }
      } catch (error) {
        console.error('Failed to fetch campaign data:', error)
      } finally {
        setIsPageLoading(false)
      }
    }

    if (params.id) {
      fetchCampaignData()
    }
  }, [params.id])

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#D4785C] mx-auto mb-4" />
          <p className="text-[#8B7B6E]">加载中...</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-pattern">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#F3EDE6] flex items-center justify-center">
            <Heart className="w-12 h-12 text-[#D4785C]/40" />
          </div>
          <h2 className="text-2xl font-bold text-[#2D2420] mb-2">项目未找到</h2>
          <p className="text-[#8B7B6E] mb-6">该项目可能已被移除或不存在</p>
          <Link href="/campaigns">
            <Button className="btn-warm rounded-full">
              返回项目列表
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const progressPercent = Math.round(
    (campaign.raisedAmount / campaign.targetAmount) * 100
  )
  const style = getCategoryStyle(campaign.category)
  const imageClass = getCategoryImage(campaign.category)

  const handleDonate = async () => {
    if (!donateAmount || parseFloat(donateAmount) <= 0) return
    
    setIsLoading(true)
    setTxError(null)
    setTxSuccess(false)
    reset()
    
    try {
      // 从 campaign id 提取数字 ID (例如 "campaign-1" -> 1)
      const campaignIdStr = campaign.id.replace('campaign-', '')
      const campaignId = BigInt(parseInt(campaignIdStr) || 1)
      
      // 转换金额 (测试模式：除以 1000 以节省测试币)
      const donationValue = parseEther((parseFloat(donateAmount) / 1000).toString())
      
      console.log('📤 发起单次捐赠（通过 BatchDonate）:', {
        contract: CONTRACT_ADDRESSES.batchDonate,
        campaignId: campaignId.toString(),
        amount: donationValue.toString(),
      })
      
      // 使用 BatchDonate 合约进行单次捐赠（这样会被记录到捐赠历史）
      // 即使只捐一个项目，也使用批量捐赠接口，以便统一记录
      writeContract({
        address: CONTRACT_ADDRESSES.batchDonate as `0x${string}`,
        abi: BatchDonateABI,
        functionName: 'batchDonate',
        args: [[campaignId], [donationValue]],
        value: donationValue,
        chain: monadTestnet,
      })
    } catch (err) {
      console.error('捐赠失败:', err)
      setIsLoading(false)
      setTxError(err instanceof Error ? err.message : '交易失败，请重试')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Image */}
      <div className={`relative h-72 md:h-96 ${imageClass}`}>
        <Image
          src={campaign.imageUrl}
          alt={campaign.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Breadcrumb */}
        <div className="absolute top-6 left-0 right-0">
          <div className="container mx-auto px-4">
            <Link href="/campaigns" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              <ArrowLeft className="w-4 h-4" />
              返回项目列表
            </Link>
          </div>
        </div>
        
        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="container mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className="bg-white/90 text-[#2D2420] border-0">
                <CheckCircle className="w-3 h-3 mr-1 text-[#7BA089]" />
                已验证项目
              </Badge>
              <Badge className={`${style.bg} ${style.text} ${style.border} bg-white/90`}>
                {campaign.category}
              </Badge>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
              {campaign.title}
            </h1>
            <p className="text-white/80 text-sm md:text-base max-w-2xl">
              {campaign.description}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8 -mt-16 relative z-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Card */}
            <Card className="warm-card card-shadow">
              <CardContent className="p-6">
                {/* Beneficiary Info */}
                <div className="flex items-center gap-4 p-4 bg-[#FBF8F4] rounded-xl border border-[#E5DDD4]">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4785C] to-[#E8B4A0] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {campaign.beneficiaryName[0]}
                  </div>
                  <div className="flex-1">
                    <div className="text-[#2D2420] font-semibold text-lg">
                      {campaign.beneficiaryName}
                    </div>
                    <div className="text-sm text-[#8B7B6E] flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      {shortenAddress(campaign.beneficiary)}
                      <ExternalLink className="w-3.5 h-3.5 hover:text-[#D4785C] cursor-pointer" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="badge-sage">
                      <Shield className="w-3 h-3 mr-1" />
                      链上存证
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card className="warm-card card-shadow">
              <Tabs defaultValue="milestones">
                <CardHeader className="pb-0">
                  <TabsList className="bg-[#F3EDE6] border border-[#E5DDD4] p-1 rounded-xl">
                    <TabsTrigger value="milestones" className="data-[state=active]:bg-white data-[state=active]:text-[#D4785C] data-[state=active]:shadow-sm rounded-lg">
                      <TrendingUp className="w-4 h-4 mr-1.5" />
                      里程碑
                    </TabsTrigger>
                    <TabsTrigger value="proofs" className="data-[state=active]:bg-white data-[state=active]:text-[#D4785C] data-[state=active]:shadow-sm rounded-lg">
                      <FileCheck className="w-4 h-4 mr-1.5" />
                      凭证记录
                    </TabsTrigger>
                    <TabsTrigger value="donors" className="data-[state=active]:bg-white data-[state=active]:text-[#D4785C] data-[state=active]:shadow-sm rounded-lg">
                      <Users className="w-4 h-4 mr-1.5" />
                      支持者
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent className="pt-6">
                  {/* Milestones Tab */}
                  <TabsContent value="milestones" className="mt-0 space-y-4">
                    {campaign.milestones.map((milestone, index) => (
                      <div
                        key={milestone.id}
                        className={`p-5 rounded-xl border transition-all ${
                          milestone.status === 'completed'
                            ? 'border-[#7BA089]/30 bg-gradient-to-r from-[#7BA089]/5 to-transparent'
                            : milestone.status === 'in_progress'
                            ? 'border-[#D4785C]/30 bg-gradient-to-r from-[#D4785C]/5 to-transparent'
                            : 'border-[#E5DDD4] bg-[#FBF8F4]'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm ${
                              milestone.status === 'completed'
                                ? 'bg-[#7BA089] text-white'
                                : milestone.status === 'in_progress'
                                ? 'bg-[#D4785C] text-white'
                                : 'bg-[#E5DDD4] text-[#8B7B6E]'
                            }`}
                          >
                            {milestone.status === 'completed' ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              index + 1
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-[#2D2420] text-lg">
                                {milestone.title}
                              </h4>
                              <Badge
                                className={
                                  milestone.status === 'completed'
                                    ? 'badge-sage'
                                    : milestone.status === 'in_progress'
                                    ? 'badge-terracotta'
                                    : 'badge-warm'
                                }
                              >
                                {milestone.status === 'completed'
                                  ? '✓ 已完成'
                                  : milestone.status === 'in_progress'
                                  ? '进行中'
                                  : '待开始'}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between text-sm mb-3">
                              <span className="text-[#8B7B6E]">
                                目标: <span className="font-medium text-[#2D2420]">{formatAmount(milestone.targetAmount)}</span>
                              </span>
                              <span className="text-[#7BA089] font-medium">
                                已释放: {formatAmount(milestone.releasedAmount)}
                              </span>
                            </div>

                            <div className="h-2.5 bg-[#E5DDD4] rounded-full overflow-hidden">
                              <div 
                                className="h-full progress-sage transition-all duration-500"
                                style={{ width: `${(milestone.releasedAmount / milestone.targetAmount) * 100}%` }}
                              />
                            </div>

                            {milestone.proofRequired && (
                              <div className="flex items-center gap-1.5 mt-3 text-xs text-[#8B7B6E]">
                                <FileCheck className="w-3.5 h-3.5" />
                                需要凭证审核才能释放资金
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  {/* Proofs Tab */}
                  <TabsContent value="proofs" className="mt-0 space-y-4">
                    {campaign.proofs.length > 0 ? (
                      campaign.proofs.map((proof) => (
                        <div
                          key={proof.id}
                          className="p-5 rounded-xl border border-[#E5DDD4] bg-[#FBF8F4]"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-medium text-[#2D2420] mb-1 text-lg">
                                {proof.description}
                              </h4>
                              <div className="text-sm text-[#8B7B6E]">
                                申请金额: <span className="font-semibold text-[#D4785C]">{formatAmount(proof.amount)}</span>
                              </div>
                            </div>
                            <Badge
                              className={
                                proof.status === 'ai_approved'
                                  ? 'badge-sage'
                                  : proof.status === 'ai_rejected'
                                  ? 'bg-[#D97065]/10 text-[#D97065] border-[#D97065]/20'
                                  : 'badge-terracotta'
                              }
                            >
                              <Brain className="w-3 h-3 mr-1" />
                              {proof.status === 'ai_approved'
                                ? 'AI 审核通过'
                                : proof.status === 'ai_rejected'
                                ? 'AI 审核拒绝'
                                : '待审核'}
                            </Badge>
                          </div>

                          {proof.aiReview && (
                            <div className="bg-white rounded-xl p-4 border border-[#E5DDD4] space-y-3">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-[#D4785C]" />
                                <span className="text-sm font-medium text-[#2D2420]">
                                  AI 审核详情
                                </span>
                                <Badge variant="outline" className="text-xs ml-auto">
                                  置信度: {(proof.aiReview.confidence * 100).toFixed(0)}%
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="p-2 bg-[#FBF8F4] rounded-lg">
                                  <span className="text-[#8B7B6E] text-xs">识别金额</span>
                                  <div className="font-medium text-[#2D2420]">
                                    {formatAmount(proof.aiReview.extracted.amount)}
                                  </div>
                                </div>
                                <div className="p-2 bg-[#FBF8F4] rounded-lg">
                                  <span className="text-[#8B7B6E] text-xs">日期</span>
                                  <div className="font-medium text-[#2D2420]">
                                    {proof.aiReview.extracted.date}
                                  </div>
                                </div>
                                <div className="p-2 bg-[#FBF8F4] rounded-lg">
                                  <span className="text-[#8B7B6E] text-xs">收款方</span>
                                  <div className="font-medium text-[#2D2420]">
                                    {proof.aiReview.extracted.recipient}
                                  </div>
                                </div>
                                <div className="p-2 bg-[#FBF8F4] rounded-lg">
                                  <span className="text-[#8B7B6E] text-xs">用途</span>
                                  <div className="font-medium text-[#2D2420]">
                                    {proof.aiReview.extracted.purpose}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 pt-3 border-t border-[#E5DDD4]">
                                {proof.aiReview.checks.amountMatch && (
                                  <Badge className="badge-sage text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    金额匹配
                                  </Badge>
                                )}
                                {proof.aiReview.checks.dateValid && (
                                  <Badge className="badge-sage text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    日期有效
                                  </Badge>
                                )}
                                {proof.aiReview.checks.purposeMatch && (
                                  <Badge className="badge-sage text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    用途匹配
                                  </Badge>
                                )}
                              </div>

                              <p className="text-sm text-[#6B5B4F] italic bg-[#FBF8F4] p-3 rounded-lg">
                                "{proof.aiReview.reason}"
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-4 text-xs text-[#8B7B6E]">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              提交于 {formatDate(proof.submittedAt)}
                            </span>
                            {proof.txHash && (
                              <span className="flex items-center gap-1 hover:text-[#D4785C] cursor-pointer">
                                查看链上记录 <ExternalLink className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F3EDE6] flex items-center justify-center">
                          <FileCheck className="w-8 h-8 text-[#D4785C]/40" />
                        </div>
                        <p className="text-[#8B7B6E]">暂无凭证记录</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Donors Tab */}
                  <TabsContent value="donors" className="mt-0 space-y-3">
                    {donations.length > 0 ? (
                      donations.map((donation, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-xl border border-[#E5DDD4] bg-[#FBF8F4] hover:border-[#D4785C]/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4785C] to-[#E8B4A0] flex items-center justify-center text-white shadow-md">
                              <Heart className="w-5 h-5" fill="white" />
                            </div>
                            <div>
                              <div className="text-[#2D2420] font-medium">
                                {shortenAddress(donation.donor)}
                              </div>
                              <div className="text-xs text-[#8B7B6E]">
                                {formatDate(donation.timestamp)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[#D4785C] font-bold text-lg">
                              {formatAmount(donation.amount)}
                            </div>
                            <div className="text-xs text-[#8B7B6E] flex items-center gap-1 justify-end hover:text-[#D4785C] cursor-pointer">
                              <ExternalLink className="w-3 h-3" />
                              {shortenAddress(donation.txHash)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F3EDE6] flex items-center justify-center">
                          <Users className="w-8 h-8 text-[#7BA089]/40" />
                        </div>
                        <p className="text-[#8B7B6E] mb-4">成为第一个支持者</p>
                        <Button className="btn-warm rounded-full">
                          <Heart className="w-4 h-4 mr-2" fill="white" />
                          立即支持
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donate Card */}
            <Card className="warm-card card-shadow sticky top-24 overflow-hidden">
              <div className="h-2 progress-warm" style={{ width: `${progressPercent}%` }} />
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-[#2D2420] mb-1">
                    {formatAmount(campaign.raisedAmount)}
                  </div>
                  <div className="text-sm text-[#8B7B6E]">
                    目标 {formatAmount(campaign.targetAmount)} · <span className="text-[#D4785C] font-semibold">{progressPercent}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-[#FBF8F4] rounded-xl">
                    <div className="text-2xl font-bold text-[#2D2420]">
                      {campaign.donorsCount}
                    </div>
                    <div className="text-xs text-[#8B7B6E] flex items-center justify-center gap-1 mt-1">
                      <Users className="w-3.5 h-3.5" />
                      支持者
                    </div>
                  </div>
                  <div className="text-center p-4 bg-[#FBF8F4] rounded-xl">
                    <div className="text-2xl font-bold text-[#7BA089]">
                      {campaign.milestones.filter((m) => m.status === 'completed').length}/
                      {campaign.milestones.length}
                    </div>
                    <div className="text-xs text-[#8B7B6E] flex items-center justify-center gap-1 mt-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      里程碑
                    </div>
                  </div>
                </div>

                {isConnected ? (
                  <>
                    <div className="mb-4">
                      <label className="text-sm text-[#5D4E47] mb-2 block font-medium">
                        支持金额 (MON)
                      </label>
                      <Input
                        type="number"
                        placeholder="输入金额"
                        value={donateAmount}
                        onChange={(e) => setDonateAmount(e.target.value)}
                        className="bg-[#FBF8F4] border-[#E5DDD4] text-[#2D2420] focus:border-[#D4785C] h-12 text-lg"
                      />
                      <div className="text-xs text-[#8B7B6E] mt-1">
                        实际链上金额: {donateAmount ? (parseFloat(donateAmount) / 1000).toFixed(4) : '0'} MON (测试模式)
                      </div>
                      <div className="flex gap-2 mt-3">
                        {[10, 50, 100, 500].map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            size="sm"
                            onClick={() => setDonateAmount(amount.toString())}
                            className={`flex-1 border-[#E5DDD4] hover:border-[#D4785C] hover:bg-[#D4785C]/5 rounded-full ${donateAmount === amount.toString() ? 'border-[#D4785C] bg-[#D4785C]/5 text-[#D4785C]' : 'text-[#5D4E47]'}`}
                          >
                            {amount} MON
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* 成功提示 */}
                    {txSuccess && txHash && (
                      <div className="mb-4 p-3 bg-[#7BA089]/10 rounded-xl border border-[#7BA089]/30">
                        <div className="flex items-center gap-2 text-[#7BA089] text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          支持成功！感谢你的爱心 🌸
                        </div>
                        <a 
                          href={`https://testnet.monadexplorer.com/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#7BA089] hover:underline flex items-center gap-1 mt-1"
                        >
                          查看交易 <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    
                    {/* 错误提示 */}
                    {txError && (
                      <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-200">
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {txError}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setTxError(null)}
                          className="text-xs text-red-500 mt-1 p-0 h-auto"
                        >
                          关闭
                        </Button>
                      </div>
                    )}
                    
                    {/* 交易中提示 */}
                    {txHash && isLoading && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-600 text-sm">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          交易确认中...
                        </div>
                        <a 
                          href={`https://testnet.monadexplorer.com/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1"
                        >
                          查看交易 <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    <Button
                      onClick={handleDonate}
                      disabled={!donateAmount || isLoading}
                      className="w-full btn-warm h-14 rounded-full text-lg font-semibold"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {isPending ? '等待签名...' : '确认中...'}
                        </>
                      ) : (
                        <>
                          <Heart className="w-5 h-5 mr-2" fill="white" />
                          立即支持
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-[#8B7B6E] mb-4">
                      连接钱包后即可支持此项目
                    </p>
                    <ConnectButton.Custom>
                      {({ openConnectModal }) => (
                        <Button
                          onClick={openConnectModal}
                          className="w-full btn-warm h-14 rounded-full text-lg font-semibold"
                        >
                          <Wallet className="w-5 h-5 mr-2" />
                          连接钱包
                        </Button>
                      )}
                    </ConnectButton.Custom>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-[#E5DDD4]">
                  <div className="flex items-center gap-2 text-sm text-[#8B7B6E]">
                    <Calendar className="w-4 h-4" />
                    截止日期: {formatDate(campaign.deadline)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Card */}
            <Card className="warm-card card-shadow">
              <CardContent className="p-5">
                <h4 className="font-semibold text-[#2D2420] mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#7BA089]" />
                  为什么值得信任
                </h4>
                <div className="space-y-3">
                  {[
                    { icon: '🔗', text: '所有支持记录链上存证' },
                    { icon: '🤖', text: 'AI 智能审核支出凭证' },
                    { icon: '📊', text: '里程碑式资金释放' },
                    { icon: '👁️', text: '100% 透明可追溯' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-[#6B5B4F] p-2 bg-[#FBF8F4] rounded-lg">
                      <span className="text-lg">{item.icon}</span>
                      {item.text}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
