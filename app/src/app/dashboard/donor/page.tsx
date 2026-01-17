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
  Loader2,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import { useAccount, useReadContract } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { formatEther } from 'viem'
import {
  mockCampaigns,
  formatAmount,
  formatDate,
  shortenAddress,
  getCategoryStyle,
} from '@/lib/mock-data'
import { BatchDonateABI } from '@/lib/contracts'
import { CONTRACT_ADDRESSES, monadTestnet } from '@/lib/web3'
import { useState, useEffect } from 'react'

// 链上捐赠记录类型
interface OnChainDonation {
  campaignId: bigint
  amount: bigint
  timestamp: bigint
}

export default function DonorDashboardPage() {
  const { address, isConnected } = useAccount()
  
  // 从 BatchDonate 合约读取捐赠历史
  const { data: donorHistory, isLoading: isLoadingHistory, refetch: refetchHistory } = useReadContract({
    address: CONTRACT_ADDRESSES.batchDonate as `0x${string}`,
    abi: BatchDonateABI,
    functionName: 'getDonorHistory',
    args: address ? [address] : undefined,
    chainId: monadTestnet.id,
    query: {
      enabled: !!address,
    },
  })
  
  // 从 BatchDonate 合约读取总捐赠金额
  const { data: donorTotalAmount, isLoading: isLoadingTotal, refetch: refetchTotal } = useReadContract({
    address: CONTRACT_ADDRESSES.batchDonate as `0x${string}`,
    abi: BatchDonateABI,
    functionName: 'getDonorTotalAmount',
    args: address ? [address] : undefined,
    chainId: monadTestnet.id,
    query: {
      enabled: !!address,
    },
  })
  
  // 刷新数据
  const handleRefresh = () => {
    refetchHistory()
    refetchTotal()
  }
  
  // 处理链上数据
  const onChainDonations = (donorHistory as OnChainDonation[] | undefined) || []
  const chainTotalDonated = donorTotalAmount ? Number(formatEther(donorTotalAmount as bigint)) : 0
  
  // 调试信息 - 详细输出
  useEffect(() => {
    if (address) {
      console.log('📊 链上捐赠数据详情:', {
        钱包地址: address,
        合约地址: CONTRACT_ADDRESSES.batchDonate,
        原始数据: donorHistory,
        已处理数据: onChainDonations,
        数据长度: onChainDonations.length,
        总金额Wei: donorTotalAmount?.toString(),
        总金额ETH: chainTotalDonated,
        是否加载中: isLoadingHistory || isLoadingTotal,
      })
    }
  }, [address, donorHistory, donorTotalAmount, onChainDonations, chainTotalDonated, isLoadingHistory, isLoadingTotal])
  
  // ⚠️ 只使用链上数据，不再使用 mock 数据
  // 注意：mockCampaigns 的 id 是 '1', '2' 等，链上数据是 1n, 2n 等
  const displayDonations = onChainDonations.map((d, index) => ({
    id: `chain-${index}`,
    campaignId: d.campaignId.toString(), // 直接使用数字字符串，与 mockCampaigns 的 id 匹配
    amount: Number(formatEther(d.amount)) * 1000, // 还原显示金额（测试模式除以了1000）
    timestamp: new Date(Number(d.timestamp) * 1000).toISOString(),
    txHash: '0x...' // 链上记录没有保存完整的 txHash
  }))
  
  const totalDonated = chainTotalDonated * 1000 // 还原显示金额
  
  const projectsSupported = new Set(displayDonations.map((d) => d.campaignId)).size
  
  const isLoading = isLoadingHistory || isLoadingTotal

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
            { icon: DollarSign, label: '累计支持', value: isLoading ? '...' : `${totalDonated.toFixed(0)} MON`, color: '#C4866B' },
            { icon: Gift, label: '支持次数', value: isLoading ? '...' : displayDonations.length, color: '#A8B5A0' },
            { icon: Heart, label: '支持项目', value: isLoading ? '...' : projectsSupported, color: '#D4A59A' },
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
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#3D3D3D] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#C4866B]" />
                    支持记录
                    {onChainDonations.length > 0 && (
                      <Badge className="badge-sage text-xs ml-2">链上数据</Badge>
                    )}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="text-[#B8A99A] hover:text-[#C4866B]"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-[#C4866B] mx-auto mb-4" />
                    <p className="text-[#8A7B73]">加载链上数据...</p>
                  </div>
                ) : (
                  <>
                    {displayDonations.map((donation, index) => {
                      const campaign = mockCampaigns.find((c) => c.id === donation.campaignId)
                      const style = campaign ? getCategoryStyle(campaign.category) : null
                      const isOnChain = donation.id.startsWith('chain-')
                      
                      // 根据 campaignId 获取项目名称
                      const getProjectName = () => {
                        if (campaign?.title) return campaign.title
                        // 根据 ID 返回对应项目名称
                        const nameMap: Record<string, string> = {
                          '1': '农村女性宫颈癌筛查计划',
                          '2': '女性心理健康热线',
                          '3': '山区女孩编程夏令营',
                          '4': '乡村女教师成长计划',
                          '5': '单亲妈妈职业技能培训',
                        }
                        return nameMap[donation.campaignId] || `项目 #${donation.campaignId}`
                      }
                      
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
                              <div className="text-[#3D3D3D] font-medium flex items-center gap-2">
                                {getProjectName()}
                                {isOnChain && (
                                  <Badge className="badge-sage text-xs">✓</Badge>
                                )}
                              </div>
                              <div className="text-sm text-[#B8A99A]">
                                {formatDate(donation.timestamp)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[#C4866B] font-bold">{donation.amount} MON</div>
                            {isOnChain ? (
                              <a 
                                href={`https://testnet.monadexplorer.com/address/${address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#B8A99A] hover:text-[#C4866B] flex items-center gap-1 justify-end"
                              >
                                查看链上记录
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <a href="#" className="text-xs text-[#B8A99A] hover:text-[#C4866B] flex items-center gap-1 justify-end">
                                {shortenAddress(donation.txHash)}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      )
                    })}

                    {displayDonations.length === 0 && !isLoading && (
                      <div className="text-center py-10">
                        <div className="text-5xl mb-4">🌸</div>
                        <p className="text-[#8A7B73] mb-2">还没有链上支持记录</p>
                        <p className="text-xs text-[#B8A99A] mb-4">
                          当前钱包: {address ? shortenAddress(address) : '未连接'}
                        </p>
                        <div className="flex gap-2 justify-center">
                          <Link href="/campaigns">
                            <Button className="btn-warm rounded-full">开始支持</Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            onClick={handleRefresh}
                            className="border-[#E8E2D9] text-[#5D4E47] rounded-full"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            刷新数据
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* 链上数据状态提示 */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-start gap-2 text-sm text-blue-700">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium mb-1">
                            {onChainDonations.length > 0 ? '✅ 显示链上真实数据' : '📝 等待链上数据'}
                          </div>
                          <div className="text-xs text-blue-600 space-y-1">
                            <div>合约地址: {CONTRACT_ADDRESSES.batchDonate}</div>
                            <div>钱包地址: {address ? shortenAddress(address) : '未连接'}</div>
                            <div>捐赠记录数: {onChainDonations.length}</div>
                            {onChainDonations.length === 0 && (
                              <p className="mt-2 text-blue-700">
                                💡 进行一次捐赠（项目详情页或批量支持），然后点击右上角刷新按钮
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
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
