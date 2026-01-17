'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Heart,
  Search,
  Filter,
  CheckCircle,
  Users,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { mockCampaigns, formatAmount, formatDate } from '@/lib/mock-data'
import { useState } from 'react'

const categories = ['全部', '医疗健康', '教育助学', '灾害救助', '环境保护', '扶贫济困']

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
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            探索公益项目
          </h1>
          <p className="text-slate-400 max-w-2xl">
            所有项目均经过验证，每笔捐赠都会记录在 Monad 区块链上，
            确保透明可追溯。
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="搜索项目名称或描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white whitespace-nowrap'
                    : 'border-slate-700 text-slate-400 hover:text-white hover:border-emerald-500/50 whitespace-nowrap'
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center gap-2 mb-6 text-sm text-slate-400">
          <Filter className="w-4 h-4" />
          找到 {filteredCampaigns.length} 个项目
        </div>

        {/* Campaign Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
              <Card className="bg-slate-900/50 border-emerald-500/20 card-hover overflow-hidden h-full">
                {/* Image placeholder */}
                <div className="h-48 bg-gradient-to-br from-emerald-900/50 to-teal-900/50 flex items-center justify-center relative">
                  <Heart className="w-16 h-16 text-emerald-500/30" />
                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    <Badge
                      className={
                        campaign.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                      }
                    >
                      {campaign.status === 'active' ? '进行中' : '已结束'}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      variant="secondary"
                      className="bg-emerald-500/10 text-emerald-400 border-0"
                    >
                      {campaign.category}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-teal-500/10 text-teal-400 border-0"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      已验证
                    </Badge>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                    {campaign.title}
                  </h3>

                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {campaign.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">筹款进度</span>
                      <span className="text-emerald-400 font-medium">
                        {Math.round(
                          (campaign.raisedAmount / campaign.targetAmount) * 100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (campaign.raisedAmount / campaign.targetAmount) * 100
                      }
                      className="h-2 bg-slate-800"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-white font-medium">
                        {formatAmount(campaign.raisedAmount)}
                      </span>
                      <span className="text-slate-500">
                        目标 {formatAmount(campaign.targetAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-1 text-sm text-slate-400">
                      <Users className="w-4 h-4" />
                      {campaign.donorsCount} 人参与
                    </div>
                    <div className="flex items-center gap-1 text-sm text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                      {
                        campaign.milestones.filter((m) => m.status === 'completed')
                          .length
                      }
                      /{campaign.milestones.length} 里程碑
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-3 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    截止日期: {formatDate(campaign.deadline)}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              没有找到匹配的项目
            </h3>
            <p className="text-slate-400">
              尝试调整搜索条件或筛选类别
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
