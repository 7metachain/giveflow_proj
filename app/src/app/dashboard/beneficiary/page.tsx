'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  FileCheck,
  TrendingUp,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  DollarSign,
  Users,
  ArrowRight,
  ExternalLink,
  Brain,
  Plus,
} from 'lucide-react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  mockCampaigns,
  formatAmount,
  formatDate,
  shortenAddress,
} from '@/lib/mock-data'

export default function BeneficiaryDashboardPage() {
  const { address, isConnected } = useAccount()

  // Mock data for beneficiary
  const myCampaigns = mockCampaigns.slice(0, 2)
  const totalRaised = myCampaigns.reduce((sum, c) => sum + c.raisedAmount, 0)
  const totalWithdrawn = myCampaigns.reduce(
    (sum, c) =>
      sum +
      c.milestones.reduce((ms, m) => ms + m.releasedAmount, 0),
    0
  )
  const pendingProofs = 1 // Mock

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-slate-900/50 border-teal-500/20 max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h2 className="text-2xl font-bold text-white mb-2">
              连接钱包查看
            </h2>
            <p className="text-slate-400 mb-6">
              连接您的钱包以管理项目和申请提款
            </p>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <Button
                  onClick={openConnectModal}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  连接钱包
                </Button>
              )}
            </ConnectButton.Custom>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/30">
              <FileCheck className="w-3 h-3 mr-1" />
              项目发起人视角
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">项目管理</h1>
          <p className="text-slate-400">
            管理您发起的公益项目，上传凭证申请资金释放
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/50 border-teal-500/20">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {formatAmount(totalRaised)}
                  </div>
                  <div className="text-sm text-slate-400">累计筹款</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-teal-500/20">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {formatAmount(totalWithdrawn)}
                  </div>
                  <div className="text-sm text-slate-400">已提取</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-teal-500/20">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {myCampaigns.reduce((sum, c) => sum + c.donorsCount, 0)}
                  </div>
                  <div className="text-sm text-slate-400">支持者</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-teal-500/20">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {pendingProofs}
                  </div>
                  <div className="text-sm text-slate-400">待审核凭证</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Campaigns */}
            <Card className="bg-slate-900/50 border-teal-500/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-400" />
                  我的项目
                </CardTitle>
                <Button
                  size="sm"
                  className="bg-teal-500 hover:bg-teal-600"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  创建项目
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {myCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="p-4 bg-slate-800/30 rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-white font-medium mb-1">
                          {campaign.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-500/10 text-emerald-400 text-xs">
                            {campaign.category}
                          </Badge>
                          <Badge
                            className={
                              campaign.status === 'active'
                                ? 'bg-teal-500/10 text-teal-400 text-xs'
                                : 'bg-slate-500/10 text-slate-400 text-xs'
                            }
                          >
                            {campaign.status === 'active' ? '进行中' : '已结束'}
                          </Badge>
                        </div>
                      </div>
                      <Link href={`/campaigns/${campaign.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-700 text-slate-400 hover:text-teal-400"
                        >
                          详情
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">筹款进度</span>
                        <span className="text-teal-400">
                          {Math.round(
                            (campaign.raisedAmount / campaign.targetAmount) * 100
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          (campaign.raisedAmount / campaign.targetAmount) * 100
                        }
                        className="h-2 bg-slate-700"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{formatAmount(campaign.raisedAmount)}</span>
                        <span>目标 {formatAmount(campaign.targetAmount)}</span>
                      </div>
                    </div>

                    {/* Milestones Overview */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-slate-800/50 rounded-lg">
                        <div className="text-lg font-bold text-emerald-400">
                          {
                            campaign.milestones.filter(
                              (m) => m.status === 'completed'
                            ).length
                          }
                        </div>
                        <div className="text-xs text-slate-500">已完成</div>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded-lg">
                        <div className="text-lg font-bold text-teal-400">
                          {
                            campaign.milestones.filter(
                              (m) => m.status === 'in_progress'
                            ).length
                          }
                        </div>
                        <div className="text-xs text-slate-500">进行中</div>
                      </div>
                      <div className="p-2 bg-slate-800/50 rounded-lg">
                        <div className="text-lg font-bold text-slate-400">
                          {
                            campaign.milestones.filter(
                              (m) => m.status === 'pending'
                            ).length
                          }
                        </div>
                        <div className="text-xs text-slate-500">待开始</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Proofs */}
            <Card className="bg-slate-900/50 border-teal-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  凭证记录
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Approved Proof */}
                <div className="p-4 bg-slate-800/30 rounded-xl border-l-4 border-emerald-500">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-white font-medium">
                        药品采购发票 - 2026年1月
                      </div>
                      <div className="text-sm text-slate-400">
                        乡村医疗救助计划 · 里程碑 1
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      AI 审核通过
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                      提取金额: <span className="text-white">$3,000</span>
                    </span>
                    <span className="text-slate-500">2026-01-10</span>
                  </div>
                </div>

                {/* Pending Proof */}
                <div className="p-4 bg-slate-800/30 rounded-xl border-l-4 border-yellow-500">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-white font-medium">
                        设备购置合同
                      </div>
                      <div className="text-sm text-slate-400">
                        乡村医疗救助计划 · 里程碑 2
                      </div>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400">
                      <Clock className="w-3 h-3 mr-1" />
                      审核中
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                      申请金额: <span className="text-white">$2,000</span>
                    </span>
                    <span className="text-slate-500">2026-01-15</span>
                  </div>
                </div>

                <Link href="/proof/upload">
                  <Button
                    variant="outline"
                    className="w-full border-teal-500/30 text-teal-400 hover:bg-teal-500/10 mt-2"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    上传新凭证
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-slate-900/50 border-teal-500/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">快捷操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/proof/upload">
                  <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                    <Upload className="w-4 h-4 mr-2" />
                    上传凭证申请提款
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full border-slate-700 text-slate-400 hover:text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  创建新项目
                </Button>
              </CardContent>
            </Card>

            {/* Pending Withdrawals */}
            <Card className="bg-slate-900/50 border-teal-500/20">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-teal-400" />
                  可提取资金
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-teal-500/10 rounded-xl">
                    <div className="text-3xl font-bold text-teal-400 mb-1">
                      $2,500
                    </div>
                    <div className="text-sm text-slate-400">
                      待上传凭证后可提取
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 text-center">
                    * 需上传对应里程碑的支出凭证并通过 AI 审核
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Review Stats */}
            <Card className="bg-slate-900/50 border-teal-500/20">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-emerald-400" />
                  AI 审核统计
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-400">审核通过</span>
                  </div>
                  <span className="text-white font-medium">1</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <span className="text-slate-400">待审核</span>
                  </div>
                  <span className="text-white font-medium">1</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-slate-400">审核拒绝</span>
                  </div>
                  <span className="text-white font-medium">0</span>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-teal-500/5 border-teal-500/20">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-white font-medium mb-1">
                      提高审核通过率
                    </div>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>• 上传清晰的发票/收据原件</li>
                      <li>• 确保金额与申请金额一致</li>
                      <li>• 凭证日期需在有效期内</li>
                      <li>• 用途需与里程碑描述匹配</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
