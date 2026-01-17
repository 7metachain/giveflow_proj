'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Heart,
  Brain,
  Eye,
  MessageCircle,
  Sparkles,
  ChevronRight,
  Users,
  TrendingUp,
  CheckCircle,
  Upload,
  Plus,
  DollarSign,
  Stethoscope,
  GraduationCap,
} from 'lucide-react'
import { useUser } from '@/lib/user-context'
import { RoleSelection } from '@/components/role-selection'
import { mockCampaigns, formatAmount, getCategoryStyle } from '@/lib/mock-data'

// Supporter Home Page
function DonorHome() {
  return (
    <div className="min-h-[calc(100vh-4rem)] hero-pattern">
      <div className="container mx-auto px-4 py-10">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <Badge className="mb-4 px-4 py-2 badge-terracotta">
              <Heart className="w-4 h-4 mr-2" />
              支持者模式
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#3D3D3D] mb-5 leading-tight">
              为她赋能，
              <br />
              <span className="gradient-text">改变生命</span>
            </h1>
            <p className="text-lg text-[#8A7B73] mb-8 leading-relaxed">
              每一份支持都链上可查，AI 审核确保资金透明。
              让爱心抵达每一位需要帮助的农村女性。
            </p>
            <div className="flex gap-3">
              <Link href="/campaigns">
                <Button className="btn-warm rounded-full h-12 px-8 text-base font-semibold pulse-warm">
                  探索项目
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" className="rounded-full h-12 px-6 border-[#E8E2D9] text-[#5D4E47] hover:bg-[#F5F2ED]">
                了解更多
              </Button>
            </div>
          </div>
          
          {/* Hero Illustration */}
          <div className="hidden lg:flex justify-center">
            <div className="illustration-container p-12 w-80 h-80 flex items-center justify-center float-animation">
              <div className="text-center">
                <div className="text-8xl mb-4">👩‍🌾</div>
                <p className="text-[#8A7B73] text-sm">关爱农村女性健康</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-5 mb-14">
          {[
            { label: '已筹款金额', value: '$64,000+', icon: DollarSign, color: '#C4866B' },
            { label: '受益女性', value: '5,000+', icon: Users, color: '#A8B5A0' },
            { label: '爱心支持者', value: '2,800+', icon: Heart, color: '#D4A59A' },
            { label: '资金透明度', value: '100%', icon: Eye, color: '#8FA584' },
          ].map((stat) => (
            <Card key={stat.label} className="warm-card card-shadow">
              <CardContent className="py-5">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#3D3D3D]">{stat.value}</div>
                    <div className="text-xs text-[#B8A99A]">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { icon: Stethoscope, label: '女性健康', active: true },
            { icon: GraduationCap, label: '女性教育', active: false },
            { icon: Sparkles, label: '女性赋能', active: false },
            { icon: Heart, label: '心理健康', active: false },
          ].map((cat) => (
            <Button
              key={cat.label}
              variant={cat.active ? "default" : "outline"}
              size="sm"
              className={cat.active 
                ? "btn-warm rounded-full" 
                : "rounded-full border-[#E8E2D9] text-[#5D4E47] hover:bg-[#F5F2ED]"
              }
            >
              <cat.icon className="w-3.5 h-3.5 mr-1.5" />
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Featured Campaigns */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#3D3D3D]">推荐项目</h2>
            <Link href="/campaigns">
              <Button variant="ghost" size="sm" className="text-[#C4866B] hover:text-[#B5776C] hover:bg-[#C4866B]/10">
                查看全部 <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {mockCampaigns.slice(0, 3).map((campaign) => {
              const progress = Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)
              const style = getCategoryStyle(campaign.category)
              return (
                <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                  <Card className="warm-card card-shadow card-shadow-hover h-full overflow-hidden">
                    {/* Card Image Area */}
                    <div className="h-44 bg-gradient-to-br from-[#F5F2ED] to-[#E8E2D9] flex items-center justify-center relative">
                      <span className="text-6xl opacity-60">🌸</span>
                      <Badge className="absolute top-3 left-3 badge-terracotta">
                        <CheckCircle className="w-3 h-3 mr-1" />已验证
                      </Badge>
                    </div>
                    <CardContent className="p-5">
                      <Badge className={`mb-3 ${style.bg} ${style.text} ${style.border}`}>
                        {campaign.category}
                      </Badge>
                      <h3 className="text-[#3D3D3D] font-semibold mb-2 text-lg">{campaign.title}</h3>
                      <p className="text-[#8A7B73] text-sm mb-4 line-clamp-2">{campaign.description}</p>
                      
                      {/* Progress Section */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#5D4E47] font-medium">{formatAmount(campaign.raisedAmount)}</span>
                          <span className="text-[#C4866B] font-semibold">{progress}%</span>
                        </div>
                        <div className="h-2 bg-[#F0EBE3] rounded-full overflow-hidden">
                          <div 
                            className="h-full progress-warm transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-[#B8A99A]">目标 {formatAmount(campaign.targetAmount)}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-[#B8A99A] pt-3 border-t border-[#E8E2D9]">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {campaign.donorsCount} 人支持
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {campaign.milestones.filter(m => m.status === 'completed').length}/{campaign.milestones.length} 里程碑
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* CTA Card */}
        <Card className="warm-card card-shadow bg-gradient-to-r from-[#FAF7F2] to-[#F5F2ED]">
          <CardContent className="py-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C4866B] to-[#D4A59A] flex items-center justify-center flex-shrink-0 shadow-md">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-[#3D3D3D] font-semibold mb-1 text-lg">试试 AI 助手 🌸</h4>
                <p className="text-sm text-[#8A7B73]">
                  点击右下角的聊天按钮，说"我想支持女性健康项目"或"推荐教育项目"！
                </p>
              </div>
              <Button className="btn-warm rounded-full flex-shrink-0 h-11 px-6">
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

// Initiator Home Page
function BeneficiaryHome() {
  return (
    <div className="min-h-[calc(100vh-4rem)] hero-pattern">
      <div className="container mx-auto px-4 py-10">
        {/* Hero */}
        <div className="mb-12">
          <Badge className="mb-4 px-4 py-2 badge-sage">
            <Sparkles className="w-4 h-4 mr-2" />
            项目发起人模式
          </Badge>
          <h1 className="text-4xl font-bold text-[#3D3D3D] mb-4">
            管理你的 <span className="text-[#8FA584]">女性公益项目</span>
          </h1>
          <p className="text-lg text-[#8A7B73] max-w-2xl leading-relaxed">
            透明展示资金使用，AI 审核凭证，赢得支持者信任。
            点击右下角的 AI 助手，快速完成项目管理！
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-5 mb-12">
          {[
            { label: '发起项目', icon: Plus, color: '#A8B5A0', href: '#', desc: '创建女性公益项目' },
            { label: '上传凭证', icon: Upload, color: '#C4866B', href: '/proof/upload', desc: 'AI 审核后提款' },
            { label: '项目管理', icon: TrendingUp, color: '#D4A59A', href: '/dashboard/beneficiary', desc: '查看筹款进度' },
            { label: '提款申请', icon: DollarSign, color: '#8FA584', href: '/proof/upload', desc: '凭证通过后提取' },
          ].map((action) => (
            <Link key={action.label} href={action.href}>
              <Card className="warm-card card-shadow card-shadow-hover cursor-pointer h-full">
                <CardContent className="py-7 text-center">
                  <div 
                    className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${action.color}15` }}
                  >
                    <action.icon className="w-7 h-7" style={{ color: action.color }} />
                  </div>
                  <h3 className="text-[#3D3D3D] font-semibold mb-1">{action.label}</h3>
                  <p className="text-xs text-[#B8A99A]">{action.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* My Projects */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-[#3D3D3D] mb-6">我的项目</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {mockCampaigns.slice(0, 2).map((campaign) => {
              const progress = Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)
              const completedMilestones = campaign.milestones.filter(m => m.status === 'completed').length
              const pendingWithdrawal = campaign.milestones
                .filter(m => m.status === 'in_progress')
                .reduce((sum, m) => sum + (m.targetAmount - m.releasedAmount), 0)
              const style = getCategoryStyle(campaign.category)
              
              return (
                <Card key={campaign.id} className="warm-card card-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-[#3D3D3D] font-semibold mb-2">{campaign.title}</h3>
                        <Badge className={`${style.bg} ${style.text} ${style.border}`}>
                          {campaign.category}
                        </Badge>
                      </div>
                      <Badge className={campaign.status === 'active' ? 'badge-sage' : 'badge-warm'}>
                        {campaign.status === 'active' ? '进行中' : '已结束'}
                      </Badge>
                    </div>
                    
                    {/* Progress */}
                    <div className="space-y-2 mb-5">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#8A7B73]">筹款进度</span>
                        <span className="text-[#C4866B] font-semibold">{progress}%</span>
                      </div>
                      <div className="h-2.5 bg-[#F0EBE3] rounded-full overflow-hidden">
                        <div 
                          className="h-full progress-warm"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-[#B8A99A]">
                        <span>{formatAmount(campaign.raisedAmount)}</span>
                        <span>目标 {formatAmount(campaign.targetAmount)}</span>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="text-center p-3 bg-[#F5F2ED] rounded-xl">
                        <div className="text-lg font-bold text-[#3D3D3D]">{campaign.donorsCount}</div>
                        <div className="text-xs text-[#B8A99A]">支持者</div>
                      </div>
                      <div className="text-center p-3 bg-[#F5F7F4] rounded-xl">
                        <div className="text-lg font-bold text-[#8FA584]">{completedMilestones}/{campaign.milestones.length}</div>
                        <div className="text-xs text-[#B8A99A]">里程碑</div>
                      </div>
                      <div className="text-center p-3 bg-[#FDF8F6] rounded-xl">
                        <div className="text-lg font-bold text-[#C4866B]">${pendingWithdrawal}</div>
                        <div className="text-xs text-[#B8A99A]">待提取</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Link href={`/campaigns/${campaign.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full border-[#E8E2D9] text-[#5D4E47] hover:bg-[#F5F2ED] rounded-full">
                          查看详情
                        </Button>
                      </Link>
                      <Link href="/proof/upload" className="flex-1">
                        <Button size="sm" className="w-full btn-sage rounded-full">
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

        {/* AI Tip */}
        <Card className="warm-card card-shadow bg-gradient-to-r from-[#F5F7F4] to-[#F0F3EE]">
          <CardContent className="py-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A8B5A0] to-[#8FA584] flex items-center justify-center flex-shrink-0 shadow-md">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-[#3D3D3D] font-semibold mb-1 text-lg">AI 助手帮你管理 ✨</h4>
                <p className="text-sm text-[#8A7B73]">
                  点击右下角聊天按钮，说"上传凭证"或"查看项目进度"，AI 助手会帮你完成！
                </p>
              </div>
              <Button className="btn-sage rounded-full flex-shrink-0 h-11 px-6">
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

// Arrow Right component for hero
function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  )
}

export default function HomePage() {
  const { role, isRoleSelected } = useUser()

  if (!isRoleSelected) {
    return <RoleSelection />
  }

  return role === 'beneficiary' ? <BeneficiaryHome /> : <DonorHome />
}
