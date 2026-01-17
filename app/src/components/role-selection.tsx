'use client'

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
} from 'lucide-react'
import { useUser } from '@/lib/user-context'

export function RoleSelection() {
  const { setRole } = useUser()

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 hero-pattern">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 px-4 py-2 badge-terracotta">
            <Sparkles className="w-4 h-4 mr-2" />
            AI + Monad 区块链
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-[#3D3D3D] mb-4">
            欢迎来到{' '}
            <span className="gradient-text she3-logo">SHE<sup className="text-[#C4866B]">³</sup></span>
          </h1>
          <p className="text-lg text-[#8A7B73] max-w-2xl mx-auto leading-relaxed">
            为农村女性健康与教育赋能
            <br />
            <span className="text-[#5D4E47]">选择你的角色，开始温暖公益之旅</span>
          </p>
        </div>

        {/* Illustration */}
        <div className="flex justify-center mb-10">
          <div className="illustration-container p-8 float-animation">
            <div className="text-7xl">👩‍⚕️</div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-10">
          {[
            { icon: Stethoscope, label: '女性健康', value: '3,000+', suffix: '人受益' },
            { icon: GraduationCap, label: '女性教育', value: '1,500+', suffix: '人获助' },
            { icon: Heart, label: '爱心支持者', value: '2,800+', suffix: '人参与' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="flex items-center justify-center gap-2 text-[#B8A99A] text-sm mb-1">
                <stat.icon className="w-4 h-4" />
                {stat.label}
              </div>
              <div className="text-xl font-bold text-[#5D4E47]">
                {stat.value}
                <span className="text-sm font-normal text-[#B8A99A] ml-1">{stat.suffix}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Supporter Card */}
          <Card
            className="warm-card card-shadow card-shadow-hover cursor-pointer group"
            onClick={() => setRole('donor')}
          >
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C4866B] to-[#D4A59A] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-lg">
                  <Heart className="w-10 h-10 text-white" fill="white" />
                </div>
                
                <h2 className="text-2xl font-bold text-[#3D3D3D] mb-2">我要支持她</h2>
                <p className="text-[#8A7B73] mb-6">
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
                      className="flex items-center gap-3 p-3 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9]"
                    >
                      <item.icon className="w-5 h-5 text-[#C4866B]" />
                      <span className="text-sm text-[#5D4E47]">{item.text}</span>
                    </div>
                  ))}
                </div>

                <Button className="w-full btn-warm rounded-full h-12 text-base font-semibold group-hover:shadow-lg">
                  成为支持者
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Initiator Card */}
          <Card
            className="warm-card card-shadow card-shadow-hover cursor-pointer group"
            onClick={() => setRole('beneficiary')}
          >
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#A8B5A0] to-[#8FA584] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-lg">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-[#3D3D3D] mb-2">我要发起项目</h2>
                <p className="text-[#8A7B73] mb-6">
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
                      className="flex items-center gap-3 p-3 bg-[#F5F7F4] rounded-xl border border-[#D9E0D6]"
                    >
                      <item.icon className="w-5 h-5 text-[#8FA584]" />
                      <span className="text-sm text-[#5D4E47]">{item.text}</span>
                    </div>
                  ))}
                </div>

                <Button className="w-full btn-sage rounded-full h-12 text-base font-semibold group-hover:shadow-lg">
                  成为发起人
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-[#B8A99A] mt-8">
          你可以随时切换角色 • 所有操作都记录在 Monad 区块链上 • 确保透明可信
        </p>
      </div>
    </div>
  )
}
