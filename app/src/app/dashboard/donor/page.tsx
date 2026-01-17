'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Heart,
  TrendingUp,
  Eye,
  ExternalLink,
  ArrowRight,
  Wallet,
  Clock,
  CheckCircle,
  FileCheck,
  DollarSign,
  Gift,
} from 'lucide-react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  mockCampaigns,
  mockDonations,
  formatAmount,
  formatDate,
  shortenAddress,
  getCategoryStyle,
} from '@/lib/mock-data'

export default function DonorDashboardPage() {
  const { address, isConnected } = useAccount()

  const myDonations = mockDonations.slice(0, 3)
  const totalDonated = myDonations.reduce((sum, d) => sum + d.amount, 0)
  const projectsSupported = new Set(myDonations.map((d) => d.campaignId)).size

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-pattern">
        <Card className="warm-card card-shadow max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F5F2ED] flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-[#D4C8BC]" />
            </div>
            <h2 className="text-2xl font-bold text-[#3D3D3D] mb-2">
              连接钱包查看
            </h2>
            <p className="text-[#8A7B73] mb-6">
              连接您的钱包以查看支持记录和资金追踪
            </p>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <Button onClick={openConnectModal} className="btn-warm rounded-full px-8">
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
          <Badge className="mb-3 px-4 py-2 badge-terracotta">
            <Heart className="w-3 h-3 mr-1" fill="currentColor" />
            支持者视角
          </Badge>
          <h1 className="text-3xl font-bold text-[#3D3D3D] mb-2">我的支持</h1>
          <p className="text-[#8A7B73]">
            追踪您的每一份爱心，查看资金流向和项目进展
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: DollarSign, label: '累计支持', value: `$${totalDonated}`, color: '#C4866B' },
            { icon: Gift, label: '支持次数', value: myDonations.length, color: '#A8B5A0' },
            { icon: Heart, label: '支持项目', value: projectsSupported, color: '#D4A59A' },
            { icon: TrendingUp, label: '透明度', value: '100%', color: '#8FA584' },
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
            {/* Donation History */}
            <Card className="warm-card card-shadow">
              <CardHeader>
                <CardTitle className="text-[#3D3D3D] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#C4866B]" />
                  支持记录
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {myDonations.map((donation) => {
                  const campaign = mockCampaigns.find((c) => c.id === donation.campaignId)
                  const style = campaign ? getCategoryStyle(campaign.category) : null
                  return (
                    <div
                      key={donation.id}
                      className="flex items-center justify-between p-4 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9] hover:bg-[#F5F2ED] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C4866B]/20 to-[#D4A59A]/20 flex items-center justify-center">
                          <Heart className="w-6 h-6 text-[#C4866B]" fill="currentColor" />
                        </div>
                        <div>
                          <div className="text-[#3D3D3D] font-medium">
                            {campaign?.title || '未知项目'}
                          </div>
                          <div className="text-sm text-[#B8A99A]">
                            {formatDate(donation.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#C4866B] font-bold">${donation.amount}</div>
                        <a href="#" className="text-xs text-[#B8A99A] hover:text-[#C4866B] flex items-center gap-1 justify-end">
                          {shortenAddress(donation.txHash)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )
                })}

                {myDonations.length === 0 && (
                  <div className="text-center py-10">
                    <div className="text-5xl mb-4">🌸</div>
                    <p className="text-[#8A7B73]">还没有支持记录</p>
                    <Link href="/campaigns">
                      <Button className="mt-4 btn-warm rounded-full">开始支持</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fund Flow Tracking */}
            <Card className="warm-card card-shadow">
              <CardHeader>
                <CardTitle className="text-[#3D3D3D] flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#8FA584]" />
                  资金流向追踪
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockCampaigns.slice(0, 2).map((campaign) => {
                    const style = getCategoryStyle(campaign.category)
                    return (
                      <div key={campaign.id} className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9]">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-[#3D3D3D] font-medium mb-1">{campaign.title}</h4>
                            <Badge className={`${style.bg} ${style.text} text-xs`}>{campaign.category}</Badge>
                          </div>
                          <Badge className="badge-sage">
                            {Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)}% 已筹
                          </Badge>
                        </div>

                        {/* Milestones Flow */}
                        <div className="space-y-3">
                          {campaign.milestones.map((milestone, index) => (
                            <div key={milestone.id} className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  milestone.status === 'completed'
                                    ? 'bg-[#A8B5A0]'
                                    : milestone.status === 'in_progress'
                                    ? 'bg-[#C4866B]'
                                    : 'bg-[#E8E2D9]'
                                }`}
                              >
                                {milestone.status === 'completed' ? (
                                  <CheckCircle className="w-4 h-4 text-white" />
                                ) : (
                                  <span className={`text-sm ${milestone.status === 'in_progress' ? 'text-white' : 'text-[#8A7B73]'}`}>
                                    {index + 1}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[#5D4E47] text-sm">{milestone.title}</span>
                                  <span className="text-[#B8A99A] text-xs">
                                    {formatAmount(milestone.releasedAmount)} / {formatAmount(milestone.targetAmount)}
                                  </span>
                                </div>
                                <div className="h-1.5 bg-[#E8E2D9] rounded-full mt-1 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#A8B5A0] to-[#8FA584]"
                                    style={{ width: `${(milestone.releasedAmount / milestone.targetAmount) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {campaign.proofs.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-[#E8E2D9]">
                            <div className="flex items-center gap-2 text-sm">
                              <FileCheck className="w-4 h-4 text-[#8FA584]" />
                              <span className="text-[#8A7B73]">已审核凭证: {campaign.proofs.length} 份</span>
                              <Badge className="ml-auto badge-sage text-xs">AI 验证通过</Badge>
                            </div>
                          </div>
                        )}

                        <Link href={`/campaigns/${campaign.id}`}>
                          <Button variant="outline" size="sm" className="w-full mt-4 border-[#E8E2D9] text-[#5D4E47] hover:text-[#C4866B] hover:border-[#C4866B]/50 rounded-full">
                            查看详情 <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet Info */}
            <Card className="warm-card card-shadow">
              <CardHeader>
                <CardTitle className="text-[#3D3D3D] text-lg flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-[#C4866B]" />
                  钱包信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9]">
                  <div className="text-xs text-[#B8A99A] mb-1">地址</div>
                  <div className="text-[#3D3D3D] font-mono text-sm">{address ? shortenAddress(address) : '-'}</div>
                </div>
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9]">
                  <div className="text-xs text-[#B8A99A] mb-1">网络</div>
                  <div className="text-[#8FA584] font-medium">Monad Testnet</div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="warm-card card-shadow">
              <CardHeader>
                <CardTitle className="text-[#3D3D3D] text-lg">快捷操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/campaigns">
                  <Button className="w-full btn-warm rounded-full">
                    <Heart className="w-4 h-4 mr-2" />
                    发现更多项目
                  </Button>
                </Link>
                <Link href="/proof/upload">
                  <Button variant="outline" className="w-full border-[#E8E2D9] text-[#5D4E47] hover:text-[#C4866B] hover:border-[#C4866B]/50 rounded-full">
                    <Eye className="w-4 h-4 mr-2" />
                    查看 AI 审核 Demo
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Transparency Note */}
            <Card className="warm-card card-shadow bg-[#A8B5A0]/5">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#8FA584] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[#3D3D3D] font-medium mb-1">100% 透明追踪</div>
                    <p className="text-sm text-[#8A7B73]">
                      您的每一份支持都记录在 Monad 区块链上，
                      资金使用需经过 AI 审核验证，确保透明可追溯。
                    </p>
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
