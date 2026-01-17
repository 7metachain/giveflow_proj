'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Send,
  Bot,
  User,
  Heart,
  Search,
  Eye,
  Wallet,
  CheckCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  TrendingUp,
} from 'lucide-react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  mockCampaigns,
  formatAmount,
  shortenAddress,
  type Campaign,
} from '@/lib/mock-data'

// Message types
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  action?: MessageAction
}

interface MessageAction {
  type: 'campaigns' | 'donate' | 'track' | 'connect_wallet'
  data?: Campaign[] | Campaign | TrackingData
}

interface TrackingData {
  campaign: Campaign
  donations: { amount: number; date: string; txHash: string }[]
  totalDonated: number
}

// Intent detection
function detectIntent(message: string): { intent: string; params: Record<string, string> } {
  const lowerMsg = message.toLowerCase()
  
  // Donation intent
  if (lowerMsg.includes('捐') || lowerMsg.includes('donate') || lowerMsg.includes('支持')) {
    const amountMatch = message.match(/(\d+)/);
    return { 
      intent: 'donate', 
      params: { amount: amountMatch ? amountMatch[1] : '' }
    }
  }
  
  // Search/recommend intent
  if (lowerMsg.includes('推荐') || lowerMsg.includes('找') || lowerMsg.includes('搜索') || 
      lowerMsg.includes('有什么') || lowerMsg.includes('项目') || lowerMsg.includes('医疗') ||
      lowerMsg.includes('教育') || lowerMsg.includes('灾害') || lowerMsg.includes('公益')) {
    return { intent: 'search', params: { query: message } }
  }
  
  // Tracking intent
  if (lowerMsg.includes('追踪') || lowerMsg.includes('查看') || lowerMsg.includes('资金') ||
      lowerMsg.includes('流向') || lowerMsg.includes('进度') || lowerMsg.includes('我的捐赠')) {
    return { intent: 'track', params: {} }
  }
  
  // Greeting
  if (lowerMsg.includes('你好') || lowerMsg.includes('hi') || lowerMsg.includes('hello') ||
      lowerMsg.includes('嗨') || lowerMsg.includes('开始')) {
    return { intent: 'greeting', params: {} }
  }
  
  return { intent: 'general', params: {} }
}

// Search campaigns by natural language
function searchCampaigns(query: string): Campaign[] {
  const lowerQuery = query.toLowerCase()
  
  return mockCampaigns.filter(campaign => {
    const matchTitle = campaign.title.toLowerCase().includes(lowerQuery)
    const matchDesc = campaign.description.toLowerCase().includes(lowerQuery)
    const matchCategory = campaign.category.toLowerCase().includes(lowerQuery)
    
    // Category keywords
    if (lowerQuery.includes('医疗') || lowerQuery.includes('健康')) {
      return campaign.category === '医疗健康'
    }
    if (lowerQuery.includes('教育') || lowerQuery.includes('学校') || lowerQuery.includes('孩子')) {
      return campaign.category === '教育助学'
    }
    if (lowerQuery.includes('灾害') || lowerQuery.includes('救援') || lowerQuery.includes('紧急')) {
      return campaign.category === '灾害救助'
    }
    
    return matchTitle || matchDesc || matchCategory
  }).slice(0, 3)
}

// Generate AI response
function generateResponse(intent: string, params: Record<string, string>, isConnected: boolean): { content: string; action?: MessageAction } {
  switch (intent) {
    case 'greeting':
      return {
        content: `你好！我是 GiveFlow AI 助手 💚\n\n我可以帮你：\n• 🔍 **发现项目** - 告诉我你关心的领域，我帮你找到合适的公益项目\n• 💰 **一键捐赠** - 用自然语言完成捐赠，如"我想捐 50 美元给医疗项目"\n• 👁️ **追踪资金** - 查看你捐赠的每一分钱的去向\n\n试试说："推荐一些医疗相关的公益项目" 或 "查看我的捐赠记录"`,
      }
    
    case 'search':
      const campaigns = searchCampaigns(params.query || '')
      if (campaigns.length === 0) {
        return {
          content: `抱歉，没有找到完全匹配的项目。这是我们当前的热门项目：`,
          action: { type: 'campaigns', data: mockCampaigns.slice(0, 3) }
        }
      }
      return {
        content: `根据你的描述，我为你找到了 ${campaigns.length} 个相关项目：\n\n每个项目都经过 **链上验证**，资金使用透明可追溯。点击任意项目可以查看详情，或直接告诉我你想捐赠的金额！`,
        action: { type: 'campaigns', data: campaigns }
      }
    
    case 'donate':
      if (!isConnected) {
        return {
          content: `要进行捐赠，请先连接你的钱包 🔐\n\n连接后，你可以直接说 "我想给乡村医疗项目捐 100 美元"，我会帮你完成整个流程！`,
          action: { type: 'connect_wallet' }
        }
      }
      const amount = params.amount || '50'
      return {
        content: `太棒了！你想支持 **${amount} MON** 💚\n\n请选择一个项目进行支持，或者告诉我你感兴趣的领域（如女性健康、教育、赋能），我帮你匹配最适合的项目。\n\n支持完成后，你可以随时查看资金的链上流向！`,
        action: { type: 'campaigns', data: mockCampaigns.slice(0, 3) }
      }
    
    case 'track':
      if (!isConnected) {
        return {
          content: `要查看捐赠记录，请先连接你的钱包 🔐`,
          action: { type: 'connect_wallet' }
        }
      }
      const trackingData: TrackingData = {
        campaign: mockCampaigns[0],
        donations: [
          { amount: 50, date: '2026-01-15', txHash: '0xabc123...' },
          { amount: 25, date: '2026-01-10', txHash: '0xdef456...' },
        ],
        totalDonated: 75
      }
      return {
        content: `这是你的捐赠追踪报告 📊\n\n你已累计捐赠 **$${trackingData.totalDonated}**，支持了 **1** 个公益项目。\n\n所有捐赠记录都已存证于 Monad 区块链，永久可查。下方是你支持的项目的资金流向：`,
        action: { type: 'track', data: trackingData }
      }
    
    default:
      return {
        content: `我理解你的问题！作为 GiveFlow AI 助手，我专注于帮你完成公益捐赠。\n\n你可以试试：\n• "推荐一些教育类的公益项目"\n• "我想捐 100 美元"\n• "查看我的捐赠记录和资金流向"`,
      }
  }
}

// Campaign Card Component
function CampaignCard({ campaign, onSelect }: { campaign: Campaign; onSelect: (c: Campaign) => void }) {
  const progress = Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)
  
  return (
    <Card 
      className="bg-slate-800/50 border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer"
      onClick={() => onSelect(campaign)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge className="bg-emerald-500/10 text-emerald-400 text-xs">
            {campaign.category}
          </Badge>
          <Badge className="bg-teal-500/10 text-teal-400 text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            已验证
          </Badge>
        </div>
        <h4 className="text-white font-medium mb-1 text-sm">{campaign.title}</h4>
        <p className="text-slate-400 text-xs mb-3 line-clamp-2">{campaign.description}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{formatAmount(campaign.raisedAmount)}</span>
            <span className="text-emerald-400">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-slate-700" />
        </div>
        
        <Button 
          size="sm" 
          className="w-full mt-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
        >
          <Heart className="w-3 h-3 mr-1" />
          支持这个项目
        </Button>
      </CardContent>
    </Card>
  )
}

// Tracking Card Component
function TrackingCard({ data }: { data: TrackingData }) {
  const campaign = data.campaign
  
  return (
    <Card className="bg-slate-800/50 border-teal-500/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-white font-medium text-sm">{campaign.title}</h4>
            <div className="text-xs text-slate-400">你已捐赠 ${data.totalDonated}</div>
          </div>
        </div>
        
        {/* Milestones */}
        <div className="space-y-2 mb-4">
          <div className="text-xs text-slate-400 mb-2">资金流向追踪:</div>
          {campaign.milestones.map((milestone, index) => (
            <div key={milestone.id} className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                milestone.status === 'completed' 
                  ? 'bg-emerald-500 text-white' 
                  : milestone.status === 'in_progress'
                  ? 'bg-teal-500 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {milestone.status === 'completed' ? '✓' : index + 1}
              </div>
              <div className="flex-1">
                <div className="text-xs text-slate-300">{milestone.title}</div>
                <Progress 
                  value={(milestone.releasedAmount / milestone.targetAmount) * 100} 
                  className="h-1 mt-1 bg-slate-700" 
                />
              </div>
              <div className="text-xs text-slate-400">
                ${milestone.releasedAmount}/${milestone.targetAmount}
              </div>
            </div>
          ))}
        </div>
        
        {/* Recent donations */}
        <div className="border-t border-slate-700 pt-3">
          <div className="text-xs text-slate-400 mb-2">你的捐赠记录:</div>
          {data.donations.map((d, i) => (
            <div key={i} className="flex items-center justify-between py-1 text-xs">
              <span className="text-slate-300">${d.amount}</span>
              <span className="text-slate-500">{d.date}</span>
              <a href="#" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                {d.txHash}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function ChatInterface() {
  const { address, isConnected } = useAccount()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = generateResponse('greeting', {}, isConnected)
      setMessages([{
        id: '1',
        role: 'assistant',
        content: greeting.content,
        timestamp: new Date(),
      }])
    }
  }, [])

  // Handle send message
  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI thinking
    await new Promise(r => setTimeout(r, 800 + Math.random() * 700))

    const { intent, params } = detectIntent(input)
    const response = generateResponse(intent, params, isConnected)

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      action: response.action,
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsTyping(false)
  }

  // Handle campaign selection
  const handleCampaignSelect = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    const message = `我想了解更多关于"${campaign.title}"这个项目的信息`
    setInput(message)
  }

  // Quick actions
  const quickActions = [
    { label: '推荐项目', icon: Search, action: '推荐一些值得支持的公益项目' },
    { label: '我要捐款', icon: Heart, action: '我想进行一次捐赠' },
    { label: '追踪资金', icon: Eye, action: '查看我的捐赠记录和资金流向' },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold">GiveFlow AI</h2>
            <div className="flex items-center gap-1 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              在线 · 随时为你服务
            </div>
          </div>
        </div>
        
        {/* Wallet Status */}
        {isConnected ? (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            <Wallet className="w-3 h-3 mr-1" />
            {address ? shortenAddress(address) : 'Connected'}
          </Badge>
        ) : (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <Button
                size="sm"
                onClick={openConnectModal}
                className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
              >
                <Wallet className="w-4 h-4 mr-1" />
                连接钱包
              </Button>
            )}
          </ConnectButton.Custom>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
              {/* Avatar */}
              <div className={`flex items-start gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-slate-700' 
                    : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-slate-300" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                
                {/* Message Content */}
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user' 
                    ? 'bg-emerald-500/20 text-white' 
                    : 'bg-slate-800/80 text-slate-200'
                }`}>
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content.split('**').map((part, i) => 
                      i % 2 === 1 ? <strong key={i} className="text-emerald-400">{part}</strong> : part
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action Cards */}
              {message.action && (
                <div className="mt-3 ml-10">
                  {message.action.type === 'campaigns' && (
                    <div className="grid gap-3">
                      {(message.action.data as Campaign[]).map((campaign) => (
                        <CampaignCard 
                          key={campaign.id} 
                          campaign={campaign} 
                          onSelect={handleCampaignSelect}
                        />
                      ))}
                    </div>
                  )}
                  
                  {message.action.type === 'track' && (
                    <TrackingCard data={message.action.data as TrackingData} />
                  )}
                  
                  {message.action.type === 'connect_wallet' && (
                    <Card className="bg-slate-800/50 border-emerald-500/20">
                      <CardContent className="p-4 text-center">
                        <Wallet className="w-10 h-10 mx-auto mb-3 text-emerald-400" />
                        <p className="text-sm text-slate-400 mb-3">
                          连接钱包以开始捐赠
                        </p>
                        <ConnectButton.Custom>
                          {({ openConnectModal }) => (
                            <Button
                              onClick={openConnectModal}
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                            >
                              连接钱包
                            </Button>
                          )}
                        </ConnectButton.Custom>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-800/80 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={() => {
                  setInput(action.action)
                  setTimeout(handleSend, 100)
                }}
                className="whitespace-nowrap border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 flex-shrink-0"
              >
                <action.icon className="w-4 h-4 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-emerald-500/20">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="输入消息... 例如: 推荐医疗相关的公益项目"
            className="flex-1 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-4"
          >
            {isTyping ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-slate-500">
          <Sparkles className="w-3 h-3" />
          Powered by AI + Monad Blockchain
        </div>
      </div>
    </div>
  )
}
