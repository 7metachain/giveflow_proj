'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  Sparkles,
  ArrowRight,
  Eye,
  Upload,
  TrendingUp,
  FileCheck,
  Users,
  Brain,
  Stethoscope,
  GraduationCap,
  Shield,
  Zap,
} from 'lucide-react'
import { useUser } from '@/lib/user-context'

export function RoleSelection() {
  const { setRole } = useUser()

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 hero-pattern" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-[#D4785C]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#7BA089]/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E8B4A0]/5 rounded-full blur-3xl" />
      
      <div className="max-w-5xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-6 px-5 py-2.5 badge-terracotta text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            AI + Monad 区块链驱动
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-[#2D2420] mb-6">
            欢迎来到{' '}
            <span className="gradient-text">SHE³</span>
          </h1>
          <p className="text-xl text-[#6B5B4F] max-w-2xl mx-auto leading-relaxed">
            为亚洲农村女性健康与教育赋能
          </p>
          <p className="text-[#8B7B6E] mt-2">
            选择你的角色，开始温暖公益之旅
          </p>
        </div>

        {/* Hero Image */}
        <div className="flex justify-center mb-12">
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#D4785C]/20 to-[#7BA089]/20 animate-pulse" />
            <Image
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop"
              alt="Woman healthcare"
              fill
              className="object-cover rounded-full border-4 border-white shadow-xl"
            />
            {/* Floating badges */}
            <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg float-animation">
              <Heart className="w-5 h-5 text-[#D4785C]" fill="#D4785C" />
            </div>
            <div className="absolute -bottom-2 -left-2 bg-white rounded-full p-2 shadow-lg float-animation" style={{ animationDelay: '1s' }}>
              <Shield className="w-5 h-5 text-[#7BA089]" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 md:gap-16 mb-12">
          {[
            { icon: Stethoscope, label: '女性健康', value: '3,000+', suffix: '受益', color: '#D4785C' },
            { icon: GraduationCap, label: '女性教育', value: '1,500+', suffix: '获助', color: '#7BA089' },
            { icon: Heart, label: '爱心支持', value: '2,800+', suffix: '参与', color: '#E8B4A0' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
              <div className="text-2xl font-bold text-[#2D2420]">{stat.value}</div>
              <div className="text-sm text-[#8B7B6E]">{stat.suffix}</div>
            </div>
          ))}
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Supporter Card */}
          <Card
            className="warm-card card-shadow card-shadow-hover cursor-pointer group overflow-hidden"
            onClick={() => setRole('donor')}
          >
            <div className="h-2 bg-gradient-to-r from-[#D4785C] to-[#E8B4A0]" />
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#D4785C] to-[#E8B4A0] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-xl">
                  <Heart className="w-12 h-12 text-white" fill="white" />
                </div>
                
                <h2 className="text-2xl font-bold text-[#2D2420] mb-2">我要支持她</h2>
                <p className="text-[#6B5B4F] mb-6">
                  发现女性公益项目，追踪每一分爱心的去向
                </p>

                {/* Features */}
                <div className="w-full space-y-3 mb-6">
                  {[
                    { icon: TrendingUp, text: '发现农村女性健康与教育项目' },
                    { icon: Eye, text: '追踪资金流向与审核凭证' },
                    { icon: Brain, text: 'AI 助手智能匹配项目' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-[#FBF8F4] rounded-xl border border-[#E5DDD4] group-hover:border-[#D4785C]/30 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#D4785C]/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-[#D4785C]" />
                      </div>
                      <span className="text-sm text-[#5D4E47] text-left">{item.text}</span>
                    </div>
                  ))}
                </div>

                <Button className="w-full btn-warm rounded-full h-14 text-lg font-semibold">
                  成为支持者
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Initiator Card */}
          <Card
            className="warm-card card-shadow card-shadow-hover cursor-pointer group overflow-hidden"
            onClick={() => setRole('beneficiary')}
          >
            <div className="h-2 bg-gradient-to-r from-[#7BA089] to-[#96B8A5]" />
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#7BA089] to-[#96B8A5] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-xl">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-[#2D2420] mb-2">我要发起项目</h2>
                <p className="text-[#6B5B4F] mb-6">
                  为女性群体发起公益项目，透明管理善款
                </p>

                {/* Features */}
                <div className="w-full space-y-3 mb-6">
                  {[
                    { icon: Upload, text: '发起女性公益项目' },
                    { icon: FileCheck, text: '上传凭证，AI 审核后提款' },
                    { icon: Users, text: '透明展示每笔资金用途' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-[#F5F8F5] rounded-xl border border-[#D9E0D6] group-hover:border-[#7BA089]/30 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#7BA089]/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-[#7BA089]" />
                      </div>
                      <span className="text-sm text-[#5D4E47] text-left">{item.text}</span>
                    </div>
                  ))}
                </div>

                <Button className="w-full btn-sage rounded-full h-14 text-lg font-semibold">
                  成为发起人
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-10">
          <div className="inline-flex items-center gap-6 text-sm text-[#8B7B6E] bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#D4785C]" />
              随时切换角色
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#7BA089]" />
              Monad 链上存证
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#E8B4A0]" />
              100% 透明
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
