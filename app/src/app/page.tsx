'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Heart,
  Brain,
  Zap,
  Eye,
  MessageCircle,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Users,
  TrendingUp,
  CheckCircle,
  Upload,
  FileCheck,
  Plus,
  DollarSign,
  Settings,
  HandHeart,
} from 'lucide-react'
import { useUser } from '@/lib/user-context'
import { RoleSelection } from '@/components/role-selection'
import { mockCampaigns, formatAmount } from '@/lib/mock-data'

// Donor Home Page
function DonorHome() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-12">
          <Badge className="mb-4 px-4 py-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            <Heart className="w-4 h-4 mr-2" fill="currentColor" />
            捐赠者模式
          </Badge>
          <h1 className="text-4xl font-bold text-white mb-4">
            发现值得支持的 <span className="gradient-text">公益项目</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl">
            每一笔捐赠都链上可查，AI 审核确保资金用途透明。
            点击右下角的 AI 助手，用自然语言完成捐赠！
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {[
            { label: '已筹款金额', value: '$127K+', icon: DollarSign, color: 'emerald' },
            { label: '爱心捐赠者', value: '890+', icon: Users, color: 'teal' },
            { label: '活跃项目', value: '12', icon: Heart, color: 'pink' },
            { label: '透明度', value: '100%', icon: Eye, color: 'cyan' },
          ].map((stat) => (
            <Card key={stat.label} className="bg-slate-900/50 border-emerald-500/20">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-slate-500">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Campaigns */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">推荐项目</h2>
            <Link href="/campaigns">
              <Button variant="outline" size="sm" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                查看全部 <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {mockCampaigns.map((campaign) => {
              const progress = Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)
              return (
                <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                  <Card className="bg-slate-900/50 border-emerald-500/20 card-hover h-full">
                    <div className="h-40 bg-gradient-to-br from-emerald-900/50 to-teal-900/50 flex items-center justify-center">
                      <Heart className="w-12 h-12 text-emerald-500/30" />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-emerald-500/10 text-emerald-400 text-xs">{campaign.category}</Badge>
                        <Badge className="bg-teal-500/10 text-teal-400 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />已验证
                        </Badge>
                      </div>
                      <h3 className="text-white font-semibold mb-2">{campaign.title}</h3>
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{campaign.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">{formatAmount(campaign.raisedAmount)}</span>
                          <span className="text-emerald-400">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5 bg-slate-700" />
                      </div>
                      <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                        <span><Users className="w-3 h-3 inline mr-1" />{campaign.donorsCount} 人支持</span>
                        <span><TrendingUp className="w-3 h-3 inline mr-1" />{campaign.milestones.filter(m => m.status === 'completed').length}/{campaign.milestones.length} 里程碑</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Quick Tip */}
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium mb-1">试试 AI 助手</h4>
                <p className="text-sm text-slate-400">
                  点击右下角的聊天按钮，用自然语言搜索项目、完成捐赠、追踪资金流向！
                </p>
              </div>
              <Button className="bg-emerald-500 hover:bg-emerald-600 flex-shrink-0">
                <Sparkles className="w-4 h-4 mr-2" />
                开始对话
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Beneficiary Home Page
function BeneficiaryHome() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-12">
          <Badge className="mb-4 px-4 py-2 bg-teal-500/10 text-teal-400 border-teal-500/30">
            <HandHeart className="w-4 h-4 mr-2" />
            募捐者模式
          </Badge>
          <h1 className="text-4xl font-bold text-white mb-4">
            管理你的 <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">公益项目</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl">
            透明展示资金使用，AI 审核凭证，赢得支持者信任。
            点击右下角的 AI 助手，快速完成项目管理！
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {[
            { label: '发起项目', icon: Plus, color: 'teal', href: '#', desc: '创建新的公益项目' },
            { label: '上传凭证', icon: Upload, color: 'purple', href: '/proof/upload', desc: 'AI 审核后提款' },
            { label: '项目管理', icon: TrendingUp, color: 'orange', href: '/dashboard/beneficiary', desc: '查看筹款进度' },
            { label: '提款申请', icon: DollarSign, color: 'emerald', href: '/proof/upload', desc: '凭证通过后提取' },
          ].map((action) => (
            <Link key={action.label} href={action.href}>
              <Card className={`bg-slate-900/50 border-${action.color}-500/20 hover:border-${action.color}-500/40 transition-all cursor-pointer h-full`}>
                <CardContent className="py-6 text-center">
                  <div className={`w-14 h-14 mx-auto rounded-xl bg-${action.color}-500/10 flex items-center justify-center mb-4`}>
                    <action.icon className={`w-7 h-7 text-${action.color}-400`} />
                  </div>
                  <h3 className="text-white font-semibold mb-1">{action.label}</h3>
                  <p className="text-xs text-slate-500">{action.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* My Projects Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">我的项目</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {mockCampaigns.slice(0, 2).map((campaign) => {
              const progress = Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)
              const completedMilestones = campaign.milestones.filter(m => m.status === 'completed').length
              const pendingWithdrawal = campaign.milestones
                .filter(m => m.status === 'in_progress')
                .reduce((sum, m) => sum + (m.targetAmount - m.releasedAmount), 0)
              
              return (
                <Card key={campaign.id} className="bg-slate-900/50 border-teal-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold mb-1">{campaign.title}</h3>
                        <Badge className="bg-teal-500/10 text-teal-400 text-xs">{campaign.category}</Badge>
                      </div>
                      <Badge className={campaign.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}>
                        {campaign.status === 'active' ? '进行中' : '已结束'}
                      </Badge>
                    </div>
                    
                    {/* Progress */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">筹款进度</span>
                        <span className="text-teal-400">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 bg-slate-700" />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{formatAmount(campaign.raisedAmount)}</span>
                        <span>目标 {formatAmount(campaign.targetAmount)}</span>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                        <div className="text-lg font-bold text-white">{campaign.donorsCount}</div>
                        <div className="text-xs text-slate-500">支持者</div>
                      </div>
                      <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                        <div className="text-lg font-bold text-emerald-400">{completedMilestones}/{campaign.milestones.length}</div>
                        <div className="text-xs text-slate-500">里程碑</div>
                      </div>
                      <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                        <div className="text-lg font-bold text-yellow-400">${pendingWithdrawal}</div>
                        <div className="text-xs text-slate-500">待提取</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/campaigns/${campaign.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-400 hover:text-white">
                          查看详情
                        </Button>
                      </Link>
                      <Link href="/proof/upload" className="flex-1">
                        <Button size="sm" className="w-full bg-teal-500 hover:bg-teal-600">
                          <Upload className="w-4 h-4 mr-1" />
                          上传凭证
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* AI Assistant Tip */}
        <Card className="bg-teal-500/5 border-teal-500/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-teal-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium mb-1">AI 助手帮你管理</h4>
                <p className="text-sm text-slate-400">
                  点击右下角聊天按钮，说"上传凭证"或"查看项目进度"，AI 助手会帮你完成！
                </p>
              </div>
              <Button className="bg-teal-500 hover:bg-teal-600 flex-shrink-0">
                <Sparkles className="w-4 h-4 mr-2" />
                开始对话
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { role, isRoleSelected } = useUser()

  // Show role selection if no role selected
  if (!isRoleSelected) {
    return <RoleSelection />
  }

  // Show appropriate home page based on role
  return role === 'beneficiary' ? <BeneficiaryHome /> : <DonorHome />
}
