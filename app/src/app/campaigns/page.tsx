'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Heart,
  Search,
  Filter,
  CheckCircle,
  Users,
  TrendingUp,
  Clock,
  Stethoscope,
  GraduationCap,
  Sparkles,
} from 'lucide-react'
import { mockCampaigns, formatAmount, formatDate, getCategoryStyle } from '@/lib/mock-data'
import { useState } from 'react'

const categories = [
  { name: '全部', icon: Heart },
  { name: '女性健康', icon: Stethoscope },
  { name: '女性教育', icon: GraduationCap },
  { name: '女性赋能', icon: Sparkles },
  { name: '心理健康', icon: Heart },
]

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')

  const filteredCampaigns = mockCampaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === '全部' || campaign.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen py-10 hero-pattern">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <Badge className="mb-4 px-4 py-2 badge-terracotta">
            <Heart className="w-4 h-4 mr-2" fill="currentColor" />
            女性公益项目
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-[#3D3D3D] mb-4">
            探索女性公益项目
          </h1>
          <p className="text-[#8A7B73] max-w-2xl leading-relaxed">
            所有项目均经过验证，每笔支持都会记录在 Monad 区块链上，
            确保透明可追溯。为农村女性的健康与教育贡献你的力量。
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8A99A]" />
            <Input
              placeholder="搜索项目名称或描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-white border-[#E8E2D9] text-[#3D3D3D] placeholder:text-[#B8A99A] focus:border-[#C4866B] h-11 rounded-full"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
                className={
                  selectedCategory === category.name
                    ? 'btn-warm whitespace-nowrap rounded-full'
                    : 'border-[#E8E2D9] text-[#5D4E47] hover:text-[#C4866B] hover:border-[#C4866B]/50 hover:bg-[#F5F2ED] whitespace-nowrap rounded-full'
                }
              >
                <category.icon className="w-3.5 h-3.5 mr-1" />
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center gap-2 mb-6 text-sm text-[#8A7B73]">
          <Filter className="w-4 h-4" />
          找到 {filteredCampaigns.length} 个项目
        </div>

        {/* Campaign Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => {
            const progress = Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)
            const style = getCategoryStyle(campaign.category)
            return (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                <Card className="warm-card card-shadow card-shadow-hover overflow-hidden h-full">
                  {/* Image placeholder */}
                  <div className="h-48 bg-gradient-to-br from-[#F5F2ED] to-[#E8E2D9] flex items-center justify-center relative">
                    <span className="text-6xl opacity-60">🌸</span>
                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <Badge
                        className={
                          campaign.status === 'active'
                            ? 'badge-sage'
                            : 'badge-warm'
                        }
                      >
                        {campaign.status === 'active' ? '进行中' : '已结束'}
                      </Badge>
                    </div>
                    {/* Verified badge */}
                    <div className="absolute top-3 left-3">
                      <Badge className="badge-terracotta">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        已验证
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <Badge className={`mb-3 ${style.bg} ${style.text} ${style.border}`}>
                      {campaign.category}
                    </Badge>

                    <h3 className="text-lg font-semibold text-[#3D3D3D] mb-2 line-clamp-1">
                      {campaign.title}
                    </h3>

                    <p className="text-[#8A7B73] text-sm mb-4 line-clamp-2">
                      {campaign.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#8A7B73]">筹款进度</span>
                        <span className="text-[#C4866B] font-semibold">
                          {progress}%
                        </span>
                      </div>
                      <div className="h-2.5 bg-[#F0EBE3] rounded-full overflow-hidden">
                        <div 
                          className="h-full progress-warm transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#5D4E47] font-medium">
                          {formatAmount(campaign.raisedAmount)}
                        </span>
                        <span className="text-[#B8A99A]">
                          目标 {formatAmount(campaign.targetAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E8E2D9]">
                      <div className="flex items-center gap-1 text-sm text-[#B8A99A]">
                        <Users className="w-4 h-4" />
                        {campaign.donorsCount} 人支持
                      </div>
                      <div className="flex items-center gap-1 text-sm text-[#8FA584]">
                        <TrendingUp className="w-4 h-4" />
                        {campaign.milestones.filter((m) => m.status === 'completed').length}
                        /{campaign.milestones.length} 里程碑
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mt-3 text-xs text-[#B8A99A]">
                      <Clock className="w-3 h-3" />
                      截止日期: {formatDate(campaign.deadline)}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌸</div>
            <h3 className="text-xl font-semibold text-[#3D3D3D] mb-2">
              没有找到匹配的项目
            </h3>
            <p className="text-[#8A7B73]">
              尝试调整搜索条件或筛选类别
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
