'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Brain,
  Plus,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  mockCampaigns,
  formatAmount,
  getCategoryStyle,
} from '@/lib/mock-data'

export default function BeneficiaryDashboardPage() {
  const { address, isConnected } = useAccount()

  const myCampaigns = mockCampaigns.slice(0, 2)
  const totalRaised = myCampaigns.reduce((sum, c) => sum + c.raisedAmount, 0)
  const totalWithdrawn = myCampaigns.reduce(
    (sum, c) => sum + c.milestones.reduce((ms, m) => ms + m.releasedAmount, 0),
    0
  )
  const pendingProofs = 1

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-pattern">
        <Card className="warm-card card-shadow max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F5F2ED] flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-[#D4C8BC]" />
            </div>
            <h2 className="text-2xl font-bold text-[#3D3D3D] mb-2">连接钱包查看</h2>
            <p className="text-[#8A7B73] mb-6">连接您的钱包以管理项目和申请提款</p>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <Button onClick={openConnectModal} className="btn-sage rounded-full px-8">
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
    <div className="min-h-screen py-10 hero-pattern">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Badge className="mb-3 px-4 py-2 badge-sage">
            <Sparkles className="w-3 h-3 mr-1" />
            项目发起人视角
          </Badge>
          <h1 className="text-3xl font-bold text-[#3D3D3D] mb-2">项目管理</h1>
          <p className="text-[#8A7B73]">管理您发起的公益项目，上传凭证申请资金释放</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: DollarSign, label: '累计筹款', value: formatAmount(totalRaised), color: '#A8B5A0' },
            { icon: CheckCircle, label: '已提取', value: formatAmount(totalWithdrawn), color: '#8FA584' },
            { icon: Users, label: '支持者', value: myCampaigns.reduce((sum, c) => sum + c.donorsCount, 0), color: '#C4866B' },
            { icon: AlertTriangle, label: '待审核凭证', value: pendingProofs, color: '#D4A59A' },
          ].map((stat) => (
            <Card key={stat.label} className="warm-card card-shadow">
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#3D3D3D]">{stat.value}</div>
                    <div className="text-sm text-[#B8A99A]">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Campaigns */}
            <Card className="warm-card card-shadow">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-[#3D3D3D] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#8FA584]" />
                  我的项目
                </CardTitle>
                <Button size="sm" className="btn-sage rounded-full">
                  <Plus className="w-4 h-4 mr-1" />
                  创建项目
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {myCampaigns.map((campaign) => {
                  const style = getCategoryStyle(campaign.category)
                  const progress = Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)
                  return (
                    <div key={campaign.id} className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9]">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-[#3D3D3D] font-medium mb-2">{campaign.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={`${style.bg} ${style.text} text-xs`}>{campaign.category}</Badge>
                            <Badge className={campaign.status === 'active' ? 'badge-sage' : 'badge-warm'}>
                              {campaign.status === 'active' ? '进行中' : '已结束'}
                            </Badge>
                          </div>
                        </div>
                        <Link href={`/campaigns/${campaign.id}`}>
                          <Button variant="outline" size="sm" className="border-[#E8E2D9] text-[#5D4E47] hover:text-[#8FA584] hover:border-[#A8B5A0]/50 rounded-full">
                            详情 <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#8A7B73]">筹款进度</span>
                          <span className="text-[#8FA584] font-semibold">{progress}%</span>
                        </div>
                        <div className="h-2.5 bg-[#E8E2D9] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#A8B5A0] to-[#8FA584]"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-[#B8A99A]">
                          <span>{formatAmount(campaign.raisedAmount)}</span>
                          <span>目标 {formatAmount(campaign.targetAmount)}</span>
                        </div>
                      </div>

                      {/* Milestones Overview */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-white rounded-xl border border-[#E8E2D9]">
                          <div className="text-lg font-bold text-[#8FA584]">
                            {campaign.milestones.filter((m) => m.status === 'completed').length}
                          </div>
                          <div className="text-xs text-[#B8A99A]">已完成</div>
                        </div>
                        <div className="p-2 bg-white rounded-xl border border-[#E8E2D9]">
                          <div className="text-lg font-bold text-[#C4866B]">
                            {campaign.milestones.filter((m) => m.status === 'in_progress').length}
                          </div>
                          <div className="text-xs text-[#B8A99A]">进行中</div>
                        </div>
                        <div className="p-2 bg-white rounded-xl border border-[#E8E2D9]">
                          <div className="text-lg font-bold text-[#B8A99A]">
                            {campaign.milestones.filter((m) => m.status === 'pending').length}
                          </div>
                          <div className="text-xs text-[#B8A99A]">待开始</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Recent Proofs */}
            <Card className="warm-card card-shadow">
              <CardHeader>
                <CardTitle className="text-[#3D3D3D] flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-[#8FA584]" />
                  凭证记录
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Approved Proof */}
                <div className="p-4 bg-[#FAF7F2] rounded-xl border-l-4 border-[#A8B5A0]">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-[#3D3D3D] font-medium">女性健康筛查物资采购发票</div>
                      <div className="text-sm text-[#8A7B73]">农村女性宫颈癌筛查计划 · 里程碑 1</div>
                    </div>
                    <Badge className="badge-sage">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      AI 审核通过
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#8A7B73]">提取金额: <span className="text-[#3D3D3D]">3,000 MON</span></span>
                    <span className="text-[#B8A99A]">2026-01-10</span>
                  </div>
                </div>

                {/* Pending Proof */}
                <div className="p-4 bg-[#FAF7F2] rounded-xl border-l-4 border-[#C4866B]">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-[#3D3D3D] font-medium">培训教材采购合同</div>
                      <div className="text-sm text-[#8A7B73]">女性职业技能培训 · 里程碑 2</div>
                    </div>
                    <Badge className="badge-terracotta">
                      <Clock className="w-3 h-3 mr-1" />
                      审核中
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#8A7B73]">申请金额: <span className="text-[#3D3D3D]">2,000 MON</span></span>
                    <span className="text-[#B8A99A]">2026-01-15</span>
                  </div>
                </div>

                <Link href="/proof/upload">
                  <Button variant="outline" className="w-full border-[#A8B5A0]/30 text-[#8FA584] hover:bg-[#A8B5A0]/10 mt-2 rounded-full">
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
            <Card className="warm-card card-shadow">
              <CardHeader>
                <CardTitle className="text-[#3D3D3D] text-lg">快捷操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/proof/upload">
                  <Button className="w-full btn-sage rounded-full">
                    <Upload className="w-4 h-4 mr-2" />
                    上传凭证申请提款
                  </Button>
                </Link>
                <Button variant="outline" className="w-full border-[#E8E2D9] text-[#5D4E47] hover:text-[#8FA584] hover:border-[#A8B5A0]/50 rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  创建新项目
                </Button>
              </CardContent>
            </Card>

            {/* Pending Withdrawals */}
            <Card className="warm-card card-shadow">
              <CardHeader>
                <CardTitle className="text-[#3D3D3D] text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#8FA584]" />
                  可提取资金
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-[#A8B5A0]/10 rounded-xl border border-[#A8B5A0]/30">
                    <div className="text-3xl font-bold text-[#8FA584] mb-1">2,500 MON</div>
                    <div className="text-sm text-[#8A7B73]">待上传凭证后可提取</div>
                  </div>
                  <div className="text-xs text-[#B8A99A] text-center">
                    * 需上传对应里程碑的支出凭证并通过 AI 审核
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Review Stats */}
            <Card className="warm-card card-shadow">
              <CardHeader>
                <CardTitle className="text-[#3D3D3D] text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#8FA584]" />
                  AI 审核统计
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: CheckCircle, label: '审核通过', value: 1, color: '#8FA584' },
                  { icon: Clock, label: '待审核', value: 1, color: '#C4866B' },
                  { icon: XCircle, label: '审核拒绝', value: 0, color: '#C97065' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" style={{ color: item.color }} />
                      <span className="text-[#8A7B73]">{item.label}</span>
                    </div>
                    <span className="text-[#3D3D3D] font-medium">{item.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="warm-card card-shadow bg-[#A8B5A0]/5">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-[#8FA584] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[#3D3D3D] font-medium mb-2">提高审核通过率</div>
                    <ul className="text-sm text-[#8A7B73] space-y-1">
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
