'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  HandHeart,
  Sparkles,
  ArrowRight,
  Eye,
  Upload,
  TrendingUp,
  FileCheck,
  Users,
  Brain,
} from 'lucide-react'
import { useUser } from '@/lib/user-context'

export function RoleSelection() {
  const { setRole } = useUser()

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 px-4 py-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            <Sparkles className="w-4 h-4 mr-2" />
            AI + Monad Blockchain
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            欢迎来到 <span className="gradient-text">GiveFlow</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            选择你的角色，开始透明公益之旅
            <br />
            AI 助手将根据你的需求提供个性化服务
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Donor Card */}
          <Card
            className="bg-slate-900/50 border-emerald-500/20 hover:border-emerald-500/50 transition-all cursor-pointer group card-hover"
            onClick={() => setRole('donor')}
          >
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Heart className="w-10 h-10 text-white" fill="white" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">我要捐款</h2>
                <p className="text-slate-400 mb-6">
                  发现优质公益项目，追踪每一分钱的去向
                </p>

                {/* Features */}
                <div className="w-full space-y-3 mb-6">
                  {[
                    { icon: TrendingUp, text: '发现优质公益项目' },
                    { icon: Eye, text: '追踪资金流向与凭证' },
                    { icon: Brain, text: 'AI 助手智能推荐' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-emerald-500/5 rounded-lg"
                    >
                      <item.icon className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm text-slate-300">{item.text}</span>
                    </div>
                  ))}
                </div>

                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 group-hover:shadow-lg group-hover:shadow-emerald-500/25">
                  以捐赠者身份进入
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Beneficiary Card */}
          <Card
            className="bg-slate-900/50 border-teal-500/20 hover:border-teal-500/50 transition-all cursor-pointer group card-hover"
            onClick={() => setRole('beneficiary')}
          >
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <HandHeart className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">我要募捐</h2>
                <p className="text-slate-400 mb-6">
                  发起公益项目，透明管理资金使用
                </p>

                {/* Features */}
                <div className="w-full space-y-3 mb-6">
                  {[
                    { icon: Upload, text: '发起公益项目' },
                    { icon: FileCheck, text: '上传凭证，AI 审核后提款' },
                    { icon: Users, text: '透明展示资金用途' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-teal-500/5 rounded-lg"
                    >
                      <item.icon className="w-5 h-5 text-teal-400" />
                      <span className="text-sm text-slate-300">{item.text}</span>
                    </div>
                  ))}
                </div>

                <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 group-hover:shadow-lg group-hover:shadow-teal-500/25">
                  以募捐者身份进入
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-slate-500 mt-8">
          你可以随时在设置中切换角色。所有操作都记录在 Monad 区块链上，确保透明可信。
        </p>
      </div>
    </div>
  )
}
