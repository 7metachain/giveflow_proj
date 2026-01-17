'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Shield,
  Zap,
  ArrowRight,
} from 'lucide-react'
import { useUser } from '@/lib/user-context'
import { RoleSelection } from '@/components/role-selection'
import { mockCampaigns, formatAmount, getCategoryStyle, getCategoryImage } from '@/lib/mock-data'

// Supporter Home Page
function DonorHome() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 hero-pattern" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#D4785C]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#7BA089]/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl">
              <Badge className="mb-6 px-4 py-2 badge-terracotta text-sm font-medium">
                <Heart className="w-4 h-4 mr-2" fill="currentColor" />
                支持者专属
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-[#2D2420] mb-6 leading-tight">
                为她赋能，
                <br />
                <span className="gradient-text">改变生命</span>
              </h1>
              <p className="text-lg text-[#6B5B4F] mb-8 leading-relaxed">
                每一份支持都链上透明可查。AI 智能审核确保资金精准到位。
                让爱心抵达每一位需要帮助的女性。
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/campaigns">
                  <Button className="btn-warm rounded-full h-14 px-8 text-lg font-semibold">
                    探索项目
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" className="rounded-full h-14 px-6 border-[#E5DDD4] text-[#5D4E47] hover:bg-[#F7F3EE] text-lg">
                  了解更多
                </Button>
              </div>
              
              {/* Trust indicators */}
              <div className="flex items-center gap-6 mt-10 pt-8 border-t border-[#E5DDD4]">
                {[
                  { icon: Shield, text: '链上透明' },
                  { icon: Brain, text: 'AI 审核' },
                  { icon: Zap, text: '秒级确认' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-[#8B7B6E]">
                    <item.icon className="w-4 h-4 text-[#D4785C]" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="hidden lg:block relative">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Main image */}
                <div className="absolute inset-4 rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=600&fit=crop"
                    alt="Women empowerment"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                
                {/* Floating cards */}
                <div className="absolute -left-4 top-1/4 bg-white rounded-2xl p-4 shadow-xl float-animation">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#7BA089]/20 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-[#7BA089]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#8B7B6E]">已帮助</p>
                      <p className="text-lg font-bold text-[#2D2420]">5,000+</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -right-4 bottom-1/4 bg-white rounded-2xl p-4 shadow-xl float-animation" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D4785C]/20 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-[#D4785C]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#8B7B6E]">累计筹款</p>
                      <p className="text-lg font-bold text-[#2D2420]">64K+ MON</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-[#E5DDD4]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: '已筹款金额', value: '64,000+ MON', icon: DollarSign, color: '#D4785C' },
              { label: '受益女性', value: '5,000+', icon: Users, color: '#7BA089' },
              { label: '爱心支持者', value: '2,800+', icon: Heart, color: '#E8B4A0' },
              { label: '资金透明度', value: '100%', icon: Eye, color: '#96B8A5' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-6">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon className="w-7 h-7" style={{ color: stat.color }} />
                </div>
                <div className="text-3xl font-bold text-[#2D2420] mb-1">{stat.value}</div>
                <div className="text-sm text-[#8B7B6E]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <Badge className="mb-3 badge-sage">精选项目</Badge>
              <h2 className="text-3xl font-bold text-[#2D2420]">值得支持的公益项目</h2>
            </div>
            <Link href="/campaigns">
              <Button variant="ghost" className="text-[#D4785C] hover:text-[#C06048] hover:bg-[#D4785C]/10">
                查看全部 <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Campaign Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockCampaigns.slice(0, 3).map((campaign) => {
              const progress = Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)
              const style = getCategoryStyle(campaign.category)
              const imageClass = getCategoryImage(campaign.category)
              return (
                <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                  <Card className="warm-card card-shadow card-shadow-hover h-full overflow-hidden group">
                    {/* Card Image */}
                    <div className={`h-52 ${imageClass} relative`}>
                      <Image
                        src={campaign.imageUrl}
                        alt={campaign.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      <Badge className="absolute top-4 left-4 bg-white/90 text-[#2D2420] border-0">
                        <CheckCircle className="w-3 h-3 mr-1 text-[#7BA089]" />已验证
                      </Badge>
                    </div>
                    
                    <CardContent className="p-6">
                      <Badge className={`mb-3 ${style.bg} ${style.text} ${style.border}`}>
                        {campaign.category}
                      </Badge>
                      <h3 className="text-[#2D2420] font-semibold text-lg mb-2 group-hover:text-[#D4785C] transition-colors">
                        {campaign.title}
                      </h3>
                      <p className="text-[#8B7B6E] text-sm mb-4 line-clamp-2">{campaign.description}</p>
                      
                      {/* Progress */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#5D4E47] font-semibold">{formatAmount(campaign.raisedAmount)}</span>
                          <span className="text-[#D4785C] font-bold">{progress}%</span>
                        </div>
                        <div className="h-2.5 bg-[#F3EDE6] rounded-full overflow-hidden">
                          <div className="h-full progress-warm transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-xs text-[#8B7B6E]">目标 {formatAmount(campaign.targetAmount)}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-[#8B7B6E] pt-4 border-t border-[#E5DDD4]">
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
      </section>

      {/* Categories */}
      <section className="py-16 bg-[#F7F3EE]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2D2420] mb-3">探索公益领域</h2>
            <p className="text-[#8B7B6E]">选择你关心的领域，发现更多项目</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Stethoscope, name: '女性健康', desc: '疾病筛查 · 医疗援助', color: '#D4785C', count: 2 },
              { icon: GraduationCap, name: '女性教育', desc: 'STEM教育 · 职业培训', color: '#7BA089', count: 2 },
              { icon: Sparkles, name: '女性赋能', desc: '经济独立 · 创业支持', color: '#C99A88', count: 1 },
              { icon: Heart, name: '心理健康', desc: '心理咨询 · 情绪支持', color: '#96B8A5', count: 1 },
            ].map((cat) => (
              <Link key={cat.name} href={`/campaigns?category=${cat.name}`}>
                <Card className="warm-card card-shadow card-shadow-hover p-6 text-center group cursor-pointer h-full">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${cat.color}15` }}
                  >
                    <cat.icon className="w-8 h-8" style={{ color: cat.color }} />
                  </div>
                  <h3 className="text-[#2D2420] font-semibold mb-1">{cat.name}</h3>
                  <p className="text-xs text-[#8B7B6E] mb-2">{cat.desc}</p>
                  <Badge variant="secondary" className="bg-[#F3EDE6] text-[#8B7B6E]">{cat.count} 个项目</Badge>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="warm-card card-shadow overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <Badge className="mb-4 badge-terracotta w-fit">AI 智能助手</Badge>
                <h3 className="text-2xl font-bold text-[#2D2420] mb-4">
                  让 AI 帮你找到合适的项目 🌸
                </h3>
                <p className="text-[#8B7B6E] mb-6">
                  点击右下角的聊天按钮，告诉 AI 你关心什么领域，
                  它会帮你推荐最适合的公益项目。
                </p>
                <div className="flex gap-4">
                  <Button className="btn-warm rounded-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    开始对话
                  </Button>
                </div>
              </div>
              <div className="hidden md:block relative h-64 md:h-auto">
                <Image
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop"
                  alt="AI Assistant"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent" />
              </div>
            </div>
          </Card>
        </div>
      </section>
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
          <h1 className="text-4xl font-bold text-[#2D2420] mb-4">
            管理你的 <span className="text-[#7BA089]">女性公益项目</span>
          </h1>
          <p className="text-lg text-[#6B5B4F] max-w-2xl leading-relaxed">
            透明展示资金使用，AI 审核凭证，赢得支持者信任。
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { label: '发起项目', icon: Plus, color: '#7BA089', href: '/campaigns/create', desc: '创建女性公益项目' },
            { label: '上传凭证', icon: Upload, color: '#D4785C', href: '/proof/upload', desc: 'AI 审核后提款' },
            { label: '项目管理', icon: TrendingUp, color: '#E8B4A0', href: '/dashboard/beneficiary', desc: '查看筹款进度' },
            { label: '提款申请', icon: DollarSign, color: '#96B8A5', href: '/proof/upload', desc: '凭证通过后提取' },
          ].map((action) => (
            <Link key={action.label} href={action.href}>
              <Card className="warm-card card-shadow card-shadow-hover cursor-pointer h-full">
                <CardContent className="py-8 text-center">
                  <div 
                    className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${action.color}15` }}
                  >
                    <action.icon className="w-8 h-8" style={{ color: action.color }} />
                  </div>
                  <h3 className="text-[#2D2420] font-semibold mb-1">{action.label}</h3>
                  <p className="text-xs text-[#8B7B6E]">{action.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* My Projects */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-[#2D2420] mb-6">我的项目</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {mockCampaigns.slice(0, 2).map((campaign) => {
              const progress = Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)
              const style = getCategoryStyle(campaign.category)
              
              return (
                <Card key={campaign.id} className="warm-card card-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-[#2D2420] font-semibold mb-2">{campaign.title}</h3>
                        <Badge className={`${style.bg} ${style.text} ${style.border}`}>{campaign.category}</Badge>
                      </div>
                      <Badge className={campaign.status === 'active' ? 'badge-sage' : 'badge-warm'}>
                        {campaign.status === 'active' ? '进行中' : '已结束'}
                      </Badge>
                    </div>
                    
                    {/* Progress */}
                    <div className="space-y-2 mb-5">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#8B7B6E]">筹款进度</span>
                        <span className="text-[#D4785C] font-semibold">{progress}%</span>
                      </div>
                      <div className="h-2.5 bg-[#F3EDE6] rounded-full overflow-hidden">
                        <div className="h-full progress-warm" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Link href={`/campaigns/${campaign.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full border-[#E5DDD4] text-[#5D4E47] hover:bg-[#F7F3EE] rounded-full">
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
      </div>
    </div>
  )
}

export default function HomePage() {
  const { role, isRoleSelected } = useUser()

  if (!isRoleSelected) {
    return <RoleSelection />
  }

  return role === 'beneficiary' ? <BeneficiaryHome /> : <DonorHome />
}
