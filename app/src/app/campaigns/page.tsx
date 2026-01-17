'use client'

import Link from 'next/link'
import Image from 'next/image'
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
  Plus,
} from 'lucide-react'
import { mockCampaigns, formatAmount, formatDate, getCategoryStyle, getCategoryImage } from '@/lib/mock-data'
import { useState, useEffect } from 'react'

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
  const [campaigns, setCampaigns] = useState(mockCampaigns)
  const [isLoading, setIsLoading] = useState(false)

  // 从API加载项目列表
  useEffect(() => {
    async function fetchCampaigns() {
      setIsLoading(true)
      try {
        const response = await fetch('/api/campaigns')
        const data = await response.json()
        if (data.success) {
          setCampaigns(data.campaigns)
        }
      } catch (error) {
        console.error('Failed to fetch campaigns:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === '全部' || campaign.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-[#FBF8F4] via-[#F8F0E8] to-[#F0EBE6] py-16">
        <div className="absolute inset-0 hero-pattern" />
        <div className="container mx-auto px-4 relative">
          <Badge className="mb-4 px-4 py-2 badge-terracotta">
            <Heart className="w-4 h-4 mr-2" fill="currentColor" />
            女性公益项目
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-[#2D2420] mb-4">
            探索女性公益项目
          </h1>
          <p className="text-[#6B5B4F] max-w-2xl leading-relaxed text-lg">
            所有项目均经过验证，每笔支持都会记录在 Monad 区块链上，
            确保透明可追溯。
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Header with Create Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#2D2420]">所有项目</h2>
          <Link href="/campaigns/create">
            <Button className="btn-warm shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              发起项目
            </Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 -mt-6 relative z-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7B6E]" />
            <Input
              placeholder="搜索项目名称或描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-white border-[#E5DDD4] text-[#2D2420] placeholder:text-[#8B7B6E] focus:border-[#D4785C] h-12 rounded-full shadow-sm"
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
                    ? 'btn-warm whitespace-nowrap rounded-full h-10'
                    : 'border-[#E5DDD4] bg-white text-[#5D4E47] hover:text-[#D4785C] hover:border-[#D4785C]/50 hover:bg-[#FBF8F4] whitespace-nowrap rounded-full h-10'
                }
              >
                <category.icon className="w-4 h-4 mr-1.5" />
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center gap-2 mb-8 text-sm text-[#8B7B6E]">
          <Filter className="w-4 h-4" />
          找到 {filteredCampaigns.length} 个项目
        </div>

        {/* Campaign Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCampaigns.map((campaign) => {
            const progress = Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)
            const style = getCategoryStyle(campaign.category)
            const imageClass = getCategoryImage(campaign.category)
            return (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                <Card className="warm-card card-shadow card-shadow-hover overflow-hidden h-full group">
                  {/* Image */}
                  <div className={`h-52 ${imageClass} relative overflow-hidden`}>
                    <Image
                      src={campaign.imageUrl}
                      alt={campaign.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    {/* Status badge */}
                    <div className="absolute top-4 right-4">
                      <Badge
                        className={
                          campaign.status === 'active'
                            ? 'bg-white/90 text-[#7BA089] border-0'
                            : 'bg-white/90 text-[#8B7B6E] border-0'
                        }
                      >
                        {campaign.status === 'active' ? '进行中' : '已结束'}
                      </Badge>
                    </div>
                    {/* Verified badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 text-[#2D2420] border-0">
                        <CheckCircle className="w-3 h-3 mr-1 text-[#7BA089]" />
                        已验证
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <Badge className={`mb-3 ${style.bg} ${style.text} ${style.border}`}>
                      {campaign.category}
                    </Badge>

                    <h3 className="text-lg font-semibold text-[#2D2420] mb-2 line-clamp-1 group-hover:text-[#D4785C] transition-colors">
                      {campaign.title}
                    </h3>

                    <p className="text-[#6B5B4F] text-sm mb-4 line-clamp-2">
                      {campaign.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#8B7B6E]">筹款进度</span>
                        <span className="text-[#D4785C] font-bold">
                          {progress}%
                        </span>
                      </div>
                      <div className="h-2.5 bg-[#F3EDE6] rounded-full overflow-hidden">
                        <div 
                          className="h-full progress-warm transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#2D2420] font-semibold">
                          {formatAmount(campaign.raisedAmount)}
                        </span>
                        <span className="text-[#8B7B6E]">
                          目标 {formatAmount(campaign.targetAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E5DDD4]">
                      <div className="flex items-center gap-1 text-sm text-[#8B7B6E]">
                        <Users className="w-4 h-4" />
                        {campaign.donorsCount} 人支持
                      </div>
                      <div className="flex items-center gap-1 text-sm text-[#7BA089]">
                        <TrendingUp className="w-4 h-4" />
                        {campaign.milestones.filter((m) => m.status === 'completed').length}
                        /{campaign.milestones.length} 里程碑
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mt-3 text-xs text-[#8B7B6E]">
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
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#F3EDE6] flex items-center justify-center">
              <Heart className="w-10 h-10 text-[#D4785C]/40" />
            </div>
            <h3 className="text-xl font-semibold text-[#2D2420] mb-2">
              没有找到匹配的项目
            </h3>
            <p className="text-[#8B7B6E]">
              尝试调整搜索条件或筛选类别
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
