'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
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
  AlertCircle,
  Loader2,
  Wallet,
  TrendingUp,
  Calendar,
  Brain,
} from 'lucide-react'
import {
  getCampaignById,
  getDonationsByCampaign,
  formatAmount,
  formatDate,
  shortenAddress,
  getCategoryStyle,
} from '@/lib/mock-data'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState } from 'react'

export default function CampaignDetailPage() {
  const params = useParams()
  const { isConnected } = useAccount()
  const [donateAmount, setDonateAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const campaign = getCampaignById(params.id as string)
  const donations = getDonationsByCampaign(params.id as string)

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-pattern">
        <div className="text-center">
          <div className="text-6xl mb-4">🌸</div>
          <h2 className="text-2xl font-bold text-[#3D3D3D] mb-2">项目未找到</h2>
          <p className="text-[#8A7B73] mb-4">该项目可能已被移除或不存在</p>
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

  const handleDonate = async () => {
    if (!donateAmount || parseFloat(donateAmount) <= 0) return
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    setDonateAmount('')
    alert('支持成功！感谢你的爱心 🌸')
  }

  return (
    <div className="min-h-screen py-10 hero-pattern">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#8A7B73] mb-6">
          <Link href="/campaigns" className="hover:text-[#C4866B] flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            探索项目
          </Link>
          <span>/</span>
          <span className="text-[#5D4E47]">{campaign.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="warm-card card-shadow overflow-hidden">
              {/* Image placeholder */}
              <div className="h-64 bg-gradient-to-br from-[#F5F2ED] to-[#E8E2D9] flex items-center justify-center relative">
                <span className="text-8xl opacity-60">🌸</span>
                <Badge className="absolute top-4 left-4 badge-terracotta">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  已验证项目
                </Badge>
              </div>

              <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge className={`${style.bg} ${style.text} ${style.border}`}>
                    {campaign.category}
                  </Badge>
                  <Badge className="badge-sage">
                    <Shield className="w-3 h-3 mr-1" />
                    链上存证
                  </Badge>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-[#3D3D3D] mb-4">
                  {campaign.title}
                </h1>

                <p className="text-[#8A7B73] leading-relaxed mb-6">
                  {campaign.description}
                </p>

                {/* Beneficiary Info */}
                <div className="flex items-center gap-3 p-4 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9]">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C4866B] to-[#D4A59A] flex items-center justify-center text-white font-bold text-lg">
                    {campaign.beneficiaryName[0]}
                  </div>
                  <div>
                    <div className="text-[#3D3D3D] font-medium">
                      {campaign.beneficiaryName}
                    </div>
                    <div className="text-sm text-[#B8A99A] flex items-center gap-1">
                      <Wallet className="w-3 h-3" />
                      {shortenAddress(campaign.beneficiary)}
                      <ExternalLink className="w-3 h-3 ml-1 hover:text-[#C4866B] cursor-pointer" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card className="warm-card card-shadow">
              <Tabs defaultValue="milestones">
                <CardHeader className="pb-0">
                  <TabsList className="bg-[#F5F2ED] border border-[#E8E2D9]">
                    <TabsTrigger value="milestones" className="data-[state=active]:bg-white data-[state=active]:text-[#C4866B]">里程碑</TabsTrigger>
                    <TabsTrigger value="proofs" className="data-[state=active]:bg-white data-[state=active]:text-[#C4866B]">凭证记录</TabsTrigger>
                    <TabsTrigger value="donors" className="data-[state=active]:bg-white data-[state=active]:text-[#C4866B]">支持者</TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent className="pt-6">
                  {/* Milestones Tab */}
                  <TabsContent value="milestones" className="mt-0 space-y-4">
                    {campaign.milestones.map((milestone, index) => (
                      <div
                        key={milestone.id}
                        className={`p-4 rounded-xl border ${
                          milestone.status === 'completed'
                            ? 'border-[#A8B5A0]/30 bg-[#A8B5A0]/5'
                            : milestone.status === 'in_progress'
                            ? 'border-[#C4866B]/30 bg-[#C4866B]/5'
                            : 'border-[#E8E2D9] bg-[#FAF7F2]'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              milestone.status === 'completed'
                                ? 'bg-[#A8B5A0] text-white'
                                : milestone.status === 'in_progress'
                                ? 'bg-[#C4866B] text-white'
                                : 'bg-[#E8E2D9] text-[#8A7B73]'
                            }`}
                          >
                            {milestone.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              index + 1
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-[#3D3D3D]">
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
                                  ? '已完成'
                                  : milestone.status === 'in_progress'
                                  ? '进行中'
                                  : '待开始'}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-[#8A7B73]">
                                目标: {formatAmount(milestone.targetAmount)}
                              </span>
                              <span className="text-[#8FA584]">
                                已释放: {formatAmount(milestone.releasedAmount)}
                              </span>
                            </div>

                            <div className="h-2 bg-[#E8E2D9] rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#A8B5A0] to-[#8FA584] transition-all"
                                style={{ width: `${(milestone.releasedAmount / milestone.targetAmount) * 100}%` }}
                              />
                            </div>

                            {milestone.proofRequired && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-[#B8A99A]">
                                <FileCheck className="w-3 h-3" />
                                需要凭证审核
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
                          className="p-4 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2]"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-[#3D3D3D] mb-1">
                                {proof.description}
                              </h4>
                              <div className="text-sm text-[#8A7B73]">
                                申请金额: {formatAmount(proof.amount)}
                              </div>
                            </div>
                            <Badge
                              className={
                                proof.status === 'ai_approved'
                                  ? 'badge-sage'
                                  : proof.status === 'ai_rejected'
                                  ? 'bg-[#C97065]/10 text-[#C97065] border-[#C97065]/20'
                                  : 'badge-terracotta'
                              }
                            >
                              {proof.status === 'ai_approved'
                                ? 'AI 审核通过'
                                : proof.status === 'ai_rejected'
                                ? 'AI 审核拒绝'
                                : '待审核'}
                            </Badge>
                          </div>

                          {proof.aiReview && (
                            <div className="bg-white rounded-xl p-4 border border-[#E8E2D9] space-y-3">
                              <div className="flex items-center gap-2">
                                <Brain className="w-4 h-4 text-[#C4866B]" />
                                <span className="text-sm font-medium text-[#5D4E47]">
                                  AI 审核结果
                                </span>
                                <span className="text-xs text-[#8A7B73]">
                                  置信度: {(proof.aiReview.confidence * 100).toFixed(0)}%
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-[#B8A99A]">识别金额:</span>
                                  <span className="ml-2 text-[#3D3D3D]">
                                    {formatAmount(proof.aiReview.extracted.amount)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[#B8A99A]">日期:</span>
                                  <span className="ml-2 text-[#3D3D3D]">
                                    {proof.aiReview.extracted.date}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[#B8A99A]">收款方:</span>
                                  <span className="ml-2 text-[#3D3D3D]">
                                    {proof.aiReview.extracted.recipient}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[#B8A99A]">用途:</span>
                                  <span className="ml-2 text-[#3D3D3D]">
                                    {proof.aiReview.extracted.purpose}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E8E2D9]">
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

                              <p className="text-xs text-[#8A7B73] italic">
                                {proof.aiReview.reason}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-3 text-xs text-[#B8A99A]">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              提交于 {formatDate(proof.submittedAt)}
                            </span>
                            {proof.txHash && (
                              <span className="flex items-center gap-1 hover:text-[#C4866B] cursor-pointer">
                                查看交易 <ExternalLink className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <FileCheck className="w-12 h-12 text-[#D4C8BC] mx-auto mb-3" />
                        <p className="text-[#8A7B73]">暂无凭证记录</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Donors Tab */}
                  <TabsContent value="donors" className="mt-0 space-y-3">
                    {donations.length > 0 ? (
                      donations.map((donation, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-xl border border-[#E8E2D9] bg-[#FAF7F2]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C4866B] to-[#D4A59A] flex items-center justify-center text-white text-sm">
                              <Heart className="w-4 h-4" fill="white" />
                            </div>
                            <div>
                              <div className="text-[#3D3D3D] font-medium">
                                {shortenAddress(donation.donor)}
                              </div>
                              <div className="text-xs text-[#B8A99A]">
                                {formatDate(donation.timestamp)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[#C4866B] font-semibold">
                              {formatAmount(donation.amount)}
                            </div>
                            <div className="text-xs text-[#B8A99A] flex items-center gap-1 justify-end">
                              <ExternalLink className="w-3 h-3" />
                              {shortenAddress(donation.txHash)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <Users className="w-12 h-12 text-[#D4C8BC] mx-auto mb-3" />
                        <p className="text-[#8A7B73]">成为第一个支持者</p>
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
            <Card className="warm-card card-shadow sticky top-24">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-[#3D3D3D] mb-1">
                    {formatAmount(campaign.raisedAmount)}
                  </div>
                  <div className="text-sm text-[#8A7B73]">
                    目标 {formatAmount(campaign.targetAmount)}
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="h-3 bg-[#F0EBE3] rounded-full overflow-hidden">
                    <div 
                      className="h-full progress-warm"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#C4866B] font-semibold">{progressPercent}%</span>
                    <span className="text-[#8A7B73]">已筹款</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-[#FAF7F2] rounded-xl">
                    <div className="text-xl font-bold text-[#3D3D3D]">
                      {campaign.donorsCount}
                    </div>
                    <div className="text-xs text-[#B8A99A] flex items-center justify-center gap-1">
                      <Users className="w-3 h-3" />
                      支持者
                    </div>
                  </div>
                  <div className="text-center p-3 bg-[#FAF7F2] rounded-xl">
                    <div className="text-xl font-bold text-[#8FA584]">
                      {campaign.milestones.filter((m) => m.status === 'completed').length}/
                      {campaign.milestones.length}
                    </div>
                    <div className="text-xs text-[#B8A99A] flex items-center justify-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      里程碑
                    </div>
                  </div>
                </div>

                {isConnected ? (
                  <>
                    <div className="mb-4">
                      <label className="text-sm text-[#5D4E47] mb-2 block">
                        支持金额 (USDC)
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={donateAmount}
                          onChange={(e) => setDonateAmount(e.target.value)}
                          className="bg-[#FAF7F2] border-[#E8E2D9] text-[#3D3D3D] focus:border-[#C4866B]"
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        {[10, 50, 100].map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            size="sm"
                            onClick={() => setDonateAmount(amount.toString())}
                            className="flex-1 border-[#E8E2D9] text-[#5D4E47] hover:bg-[#F5F2ED] hover:border-[#C4866B]"
                          >
                            ${amount}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleDonate}
                      disabled={!donateAmount || isLoading}
                      className="w-full btn-warm h-12 rounded-full text-base font-semibold pulse-warm"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          处理中...
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4 mr-2" fill="white" />
                          立即支持 🌸
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-[#8A7B73] mb-4">
                      连接钱包后即可支持此项目
                    </p>
                    <ConnectButton.Custom>
                      {({ openConnectModal }) => (
                        <Button
                          onClick={openConnectModal}
                          className="w-full btn-warm h-12 rounded-full text-base font-semibold"
                        >
                          <Wallet className="w-4 h-4 mr-2" />
                          连接钱包
                        </Button>
                      )}
                    </ConnectButton.Custom>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-[#E8E2D9]">
                  <div className="flex items-center gap-1 text-xs text-[#B8A99A]">
                    <Calendar className="w-3 h-3" />
                    截止日期: {formatDate(campaign.deadline)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Card */}
            <Card className="warm-card card-shadow">
              <CardContent className="p-4">
                <h4 className="font-semibold text-[#3D3D3D] mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#8FA584]" />
                  为什么信任我们
                </h4>
                <div className="space-y-2 text-sm">
                  {[
                    '所有支持记录上链存证',
                    'AI 智能审核支出凭证',
                    '里程碑式资金释放机制',
                    '100% 透明可追溯',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[#8A7B73]">
                      <CheckCircle className="w-4 h-4 text-[#A8B5A0]" />
                      {item}
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
