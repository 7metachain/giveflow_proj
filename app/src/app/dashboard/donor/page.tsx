'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Users,
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
} from '@/lib/mock-data'

export default function DonorDashboardPage() {
  const { address, isConnected } = useAccount()

  // Mock data for this donor (in real app, filter by address)
  const myDonations = mockDonations.slice(0, 3)
  const totalDonated = myDonations.reduce((sum, d) => sum + d.amount, 0)
  const projectsSupported = new Set(myDonations.map((d) => d.campaignId)).size

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-slate-900/50 border-emerald-500/20 max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h2 className="text-2xl font-bold text-white mb-2">
              连接钱包查看
            </h2>
            <p className="text-slate-400 mb-6">
              连接您的钱包以查看捐赠记录和资金追踪
            </p>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <Button
                  onClick={openConnectModal}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
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
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              <Heart className="w-3 h-3 mr-1" fill="currentColor" />
              捐赠者视角
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">我的捐赠</h1>
          <p className="text-slate-400">
            追踪您的每一笔善款，查看资金流向和项目进展
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/50 border-emerald-500/20">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    ${totalDonated}
                  </div>
                  <div className="text-sm text-slate-400">累计捐赠</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-emerald-500/20">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {myDonations.length}
                  </div>
                  <div className="text-sm text-slate-400">捐赠次数</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-emerald-500/20">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {projectsSupported}
                  </div>
                  <div className="text-sm text-slate-400">支持项目</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-emerald-500/20">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-sm text-slate-400">透明度</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Donation History */}
            <Card className="bg-slate-900/50 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  捐赠记录
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {myDonations.map((donation, index) => {
                  const campaign = mockCampaigns.find(
                    (c) => c.id === donation.campaignId
                  )
                  return (
                    <div
                      key={donation.id}
                      className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                          <Heart className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {campaign?.title || '未知项目'}
                          </div>
                          <div className="text-sm text-slate-400">
                            {formatDate(donation.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-400 font-bold">
                          ${donation.amount}
                        </div>
                        <a
                          href="#"
                          className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1"
                        >
                          {shortenAddress(donation.txHash)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )
                })}

                {myDonations.length === 0 && (
                  <div className="text-center py-10 text-slate-400">
                    <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>还没有捐赠记录</p>
                    <Link href="/campaigns">
                      <Button className="mt-4 bg-emerald-500 hover:bg-emerald-600">
                        开始捐赠
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fund Flow Tracking */}
            <Card className="bg-slate-900/50 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-teal-400" />
                  资金流向追踪
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockCampaigns.slice(0, 2).map((campaign) => (
                    <div
                      key={campaign.id}
                      className="p-4 bg-slate-800/30 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-medium">
                          {campaign.title}
                        </h4>
                        <Badge className="bg-emerald-500/10 text-emerald-400">
                          {Math.round(
                            (campaign.raisedAmount / campaign.targetAmount) * 100
                          )}
                          % 已筹
                        </Badge>
                      </div>

                      {/* Milestones Flow */}
                      <div className="space-y-3">
                        {campaign.milestones.map((milestone, index) => (
                          <div
                            key={milestone.id}
                            className="flex items-center gap-3"
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                milestone.status === 'completed'
                                  ? 'bg-emerald-500'
                                  : milestone.status === 'in_progress'
                                  ? 'bg-teal-500'
                                  : 'bg-slate-700'
                              }`}
                            >
                              {milestone.status === 'completed' ? (
                                <CheckCircle className="w-4 h-4 text-white" />
                              ) : (
                                <span className="text-white text-sm">
                                  {index + 1}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-300 text-sm">
                                  {milestone.title}
                                </span>
                                <span className="text-slate-400 text-xs">
                                  {formatAmount(milestone.releasedAmount)} /{' '}
                                  {formatAmount(milestone.targetAmount)}
                                </span>
                              </div>
                              <Progress
                                value={
                                  (milestone.releasedAmount /
                                    milestone.targetAmount) *
                                  100
                                }
                                className="h-1 mt-1 bg-slate-700"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Proof Info */}
                      {campaign.proofs.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-700">
                          <div className="flex items-center gap-2 text-sm">
                            <FileCheck className="w-4 h-4 text-emerald-400" />
                            <span className="text-slate-400">
                              已审核凭证: {campaign.proofs.length} 份
                            </span>
                            <Badge className="ml-auto bg-emerald-500/10 text-emerald-400 text-xs">
                              AI 验证通过
                            </Badge>
                          </div>
                        </div>
                      )}

                      <Link href={`/campaigns/${campaign.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-4 border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50"
                        >
                          查看详情
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet Info */}
            <Card className="bg-slate-900/50 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                  钱包信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">地址</div>
                  <div className="text-white font-mono text-sm">
                    {address ? shortenAddress(address) : '-'}
                  </div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">网络</div>
                  <div className="text-emerald-400 font-medium">
                    Monad Testnet
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-slate-900/50 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">快捷操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/campaigns">
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                    <Heart className="w-4 h-4 mr-2" />
                    发现更多项目
                  </Button>
                </Link>
                <Link href="/proof/upload">
                  <Button
                    variant="outline"
                    className="w-full border-slate-700 text-slate-400 hover:text-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    查看 AI 审核 Demo
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Transparency Note */}
            <Card className="bg-emerald-500/5 border-emerald-500/20">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-white font-medium mb-1">
                      100% 透明追踪
                    </div>
                    <p className="text-sm text-slate-400">
                      您的每一笔捐赠都记录在 Monad 区块链上，
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
