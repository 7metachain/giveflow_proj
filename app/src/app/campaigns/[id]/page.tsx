'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Heart,
  CheckCircle,
  Users,
  Clock,
  ExternalLink,
  Shield,
  FileCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  Wallet,
  TrendingUp,
  Calendar,
} from 'lucide-react'
import {
  getCampaignById,
  getDonationsByCampaign,
  formatAmount,
  formatDate,
  shortenAddress,
} from '@/lib/mock-data'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState } from 'react'

export default function CampaignDetailPage() {
  const params = useParams()
  const { address, isConnected } = useAccount()
  const [donateAmount, setDonateAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const campaign = getCampaignById(params.id as string)
  const donations = getDonationsByCampaign(params.id as string)

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">项目未找到</h2>
          <p className="text-slate-400 mb-4">该项目可能已被移除或不存在</p>
          <Link href="/campaigns">
            <Button className="bg-emerald-500 hover:bg-emerald-600">
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

  const handleDonate = async () => {
    if (!donateAmount || parseFloat(donateAmount) <= 0) return
    setIsLoading(true)
    // Simulate donation
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    setDonateAmount('')
    alert('捐赠成功！（Demo 模式）')
  }

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/campaigns" className="hover:text-emerald-400">
            探索项目
          </Link>
          <span>/</span>
          <span className="text-white">{campaign.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="bg-slate-900/50 border-emerald-500/20 overflow-hidden">
              {/* Image placeholder */}
              <div className="h-64 bg-gradient-to-br from-emerald-900/50 to-teal-900/50 flex items-center justify-center">
                <Heart className="w-24 h-24 text-emerald-500/30" />
              </div>

              <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    {campaign.category}
                  </Badge>
                  <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    已验证项目
                  </Badge>
                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                    <Shield className="w-3 h-3 mr-1" />
                    链上存证
                  </Badge>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  {campaign.title}
                </h1>

                <p className="text-slate-400 leading-relaxed mb-6">
                  {campaign.description}
                </p>

                {/* Beneficiary Info */}
                <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                    {campaign.beneficiaryName[0]}
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {campaign.beneficiaryName}
                    </div>
                    <div className="text-sm text-slate-400 flex items-center gap-1">
                      <Wallet className="w-3 h-3" />
                      {shortenAddress(campaign.beneficiary)}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs: Milestones / Proofs / Donors */}
            <Card className="bg-slate-900/50 border-emerald-500/20">
              <Tabs defaultValue="milestones">
                <CardHeader className="pb-0">
                  <TabsList className="bg-slate-800/50">
                    <TabsTrigger value="milestones">里程碑</TabsTrigger>
                    <TabsTrigger value="proofs">凭证记录</TabsTrigger>
                    <TabsTrigger value="donors">捐赠者</TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent className="pt-6">
                  {/* Milestones Tab */}
                  <TabsContent value="milestones" className="mt-0 space-y-4">
                    {campaign.milestones.map((milestone, index) => (
                      <div
                        key={milestone.id}
                        className={`p-4 rounded-lg border ${
                          milestone.status === 'completed'
                            ? 'border-emerald-500/30 bg-emerald-500/5'
                            : milestone.status === 'in_progress'
                            ? 'border-teal-500/30 bg-teal-500/5'
                            : 'border-slate-700 bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              milestone.status === 'completed'
                                ? 'bg-emerald-500 text-white'
                                : milestone.status === 'in_progress'
                                ? 'bg-teal-500 text-white'
                                : 'bg-slate-700 text-slate-400'
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
                              <h4 className="font-semibold text-white">
                                {milestone.title}
                              </h4>
                              <Badge
                                className={
                                  milestone.status === 'completed'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : milestone.status === 'in_progress'
                                    ? 'bg-teal-500/20 text-teal-400'
                                    : 'bg-slate-500/20 text-slate-400'
                                }
                              >
                                {milestone.status === 'completed'
                                  ? '已完成'
                                  : milestone.status === 'in_progress'
                                  ? '进行中'
                                  : '待开始'}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-400">
                                目标: {formatAmount(milestone.targetAmount)}
                              </span>
                              <span className="text-emerald-400">
                                已释放: {formatAmount(milestone.releasedAmount)}
                              </span>
                            </div>

                            <Progress
                              value={
                                (milestone.releasedAmount /
                                  milestone.targetAmount) *
                                100
                              }
                              className="h-1.5 mt-2 bg-slate-700"
                            />

                            {milestone.proofRequired && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
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
                          className="p-4 rounded-lg border border-emerald-500/20 bg-slate-800/30"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-white mb-1">
                                {proof.description}
                              </h4>
                              <div className="text-sm text-slate-400">
                                金额: {formatAmount(proof.amount)}
                              </div>
                            </div>
                            <Badge
                              className={
                                proof.status === 'ai_approved'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : proof.status === 'ai_rejected'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }
                            >
                              {proof.status === 'ai_approved'
                                ? 'AI 审核通过'
                                : proof.status === 'ai_rejected'
                                ? 'AI 审核拒绝'
                                : '人工审核中'}
                            </Badge>
                          </div>

                          {proof.aiReview && (
                            <div className="p-3 bg-slate-900/50 rounded-lg text-sm">
                              <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                <Shield className="w-4 h-4" />
                                AI 审核报告
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-slate-400">
                                <div>
                                  置信度:{' '}
                                  <span className="text-white">
                                    {(proof.aiReview.confidence * 100).toFixed(
                                      0
                                    )}
                                    %
                                  </span>
                                </div>
                                <div>
                                  提取金额:{' '}
                                  <span className="text-white">
                                    ${proof.aiReview.extracted.amount}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2 text-slate-300">
                                {proof.aiReview.reason}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                            <span>提交时间: {formatDate(proof.submittedAt)}</span>
                            {proof.txHash && (
                              <a
                                href="#"
                                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                              >
                                查看链上记录
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-slate-400">
                        <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>暂无凭证记录</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Donors Tab */}
                  <TabsContent value="donors" className="mt-0 space-y-3">
                    {donations.length > 0 ? (
                      donations.map((donation) => (
                        <div
                          key={donation.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm">
                              💚
                            </div>
                            <div>
                              <div className="text-white text-sm">
                                {shortenAddress(donation.donor)}
                              </div>
                              <div className="text-xs text-slate-500">
                                {formatDate(donation.timestamp)}
                              </div>
                            </div>
                          </div>
                          <div className="text-emerald-400 font-medium">
                            ${donation.amount}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-slate-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>暂无捐赠记录</p>
                      </div>
                    )}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donation Card */}
            <Card className="bg-slate-900/50 border-emerald-500/20 sticky top-24">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-emerald-400" />
                  支持这个项目
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-3xl font-bold text-emerald-400">
                        {formatAmount(campaign.raisedAmount)}
                      </div>
                      <div className="text-sm text-slate-400">
                        目标 {formatAmount(campaign.targetAmount)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {progressPercent}%
                      </div>
                      <div className="text-sm text-slate-400">已筹集</div>
                    </div>
                  </div>
                  <Progress
                    value={progressPercent}
                    className="h-3 bg-slate-800"
                  />
                </div>

                <Separator className="bg-slate-800" />

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                    <Users className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
                    <div className="text-xl font-bold text-white">
                      {campaign.donorsCount}
                    </div>
                    <div className="text-xs text-slate-400">支持者</div>
                  </div>
                  <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                    <TrendingUp className="w-5 h-5 mx-auto text-teal-400 mb-1" />
                    <div className="text-xl font-bold text-white">
                      {
                        campaign.milestones.filter(
                          (m) => m.status === 'completed'
                        ).length
                      }
                      /{campaign.milestones.length}
                    </div>
                    <div className="text-xs text-slate-400">里程碑</div>
                  </div>
                </div>

                <Separator className="bg-slate-800" />

                {/* Donate Form */}
                {isConnected ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-400 mb-2 block">
                        捐赠金额 (USDC)
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={donateAmount}
                          onChange={(e) => setDonateAmount(e.target.value)}
                          className="bg-slate-800 border-slate-700 text-white"
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        {[10, 50, 100].map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            size="sm"
                            onClick={() => setDonateAmount(amount.toString())}
                            className="flex-1 border-slate-700 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400"
                          >
                            ${amount}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={handleDonate}
                      disabled={isLoading || !donateAmount}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-6"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          处理中...
                        </>
                      ) : (
                        <>
                          <Heart className="w-5 h-5 mr-2" fill="white" />
                          立即捐赠
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-slate-400 text-sm">
                      连接钱包开始捐赠
                    </p>
                    <ConnectButton.Custom>
                      {({ openConnectModal }) => (
                        <Button
                          onClick={openConnectModal}
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                        >
                          连接钱包
                        </Button>
                      )}
                    </ConnectButton.Custom>
                  </div>
                )}

                {/* Deadline */}
                <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                  <Calendar className="w-4 h-4" />
                  截止日期: {formatDate(campaign.deadline)}
                </div>
              </CardContent>
            </Card>

            {/* Beneficiary Actions */}
            {isConnected &&
              address?.toLowerCase() === campaign.beneficiary.toLowerCase() && (
                <Card className="bg-slate-900/50 border-teal-500/20">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-teal-400" />
                      项目管理
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href="/proof/upload">
                      <Button className="w-full bg-teal-500 hover:bg-teal-600">
                        上传凭证申请提款
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
