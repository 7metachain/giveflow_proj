'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
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
  X,
  Minimize2,
  Maximize2,
  Upload,
  FileCheck,
  Plus,
  TrendingUp,
  DollarSign,
  Brain,
  MessageCircle,
  Check,
  Minus,
  ListChecks,
} from 'lucide-react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useUser, type UserRole } from '@/lib/user-context'
import {
  mockCampaigns,
  formatAmount,
  shortenAddress,
  type Campaign,
} from '@/lib/mock-data'

// Tool definitions based on role
interface Tool {
  id: string
  label: string
  icon: typeof Heart
  action: string
  color: string
}

const donorTools: Tool[] = [
  { id: 'search', label: '找项目', icon: Search, action: '推荐一些值得支持的公益项目', color: 'emerald' },
  { id: 'batch', label: '批量捐', icon: ListChecks, action: '我想同时捐赠给多个项目', color: 'pink' },
  { id: 'track', label: '追踪', icon: Eye, action: '查看我的捐赠记录和资金流向', color: 'cyan' },
  { id: 'verify', label: '凭证', icon: FileCheck, action: '查看项目的支出凭证和AI审核结果', color: 'purple' },
]

const beneficiaryTools: Tool[] = [
  { id: 'create', label: '发起项目', icon: Plus, action: '我想发起一个新的公益项目', color: 'teal' },
  { id: 'upload', label: '上传凭证', icon: Upload, action: '我要上传支出凭证给AI审核', color: 'purple' },
  { id: 'manage', label: '项目进度', icon: TrendingUp, action: '查看我的项目进度和资金情况', color: 'orange' },
  { id: 'withdraw', label: '申请提款', icon: DollarSign, action: '凭证审核通过后申请提取资金', color: 'emerald' },
]

// Message types
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  action?: MessageAction
}

interface MessageAction {
  type: 'campaigns' | 'donate' | 'track' | 'connect_wallet' | 'upload_proof' | 'create_campaign' | 'batch_select' | 'batch_confirm'
  data?: Campaign[] | Campaign | TrackingData
}

interface TrackingData {
  campaign: Campaign
  donations: { amount: number; date: string; txHash: string }[]
  totalDonated: number
}

// Generate AI response based on role
function generateResponse(
  intent: string, 
  params: Record<string, string>, 
  isConnected: boolean,
  role: UserRole
): { content: string; action?: MessageAction } {
  
  // Beneficiary specific responses
  if (role === 'beneficiary') {
    if (intent === 'greeting') {
      return {
        content: `你好！我是 GiveFlow AI 助手 💚\n\n作为募捐者，我可以帮你：\n• ➕ **发起项目** - 创建新的公益筹款项目\n• 📤 **上传凭证** - AI 审核后申请资金释放\n• 📊 **管理项目** - 查看筹款进度和支持者\n• 💰 **申请提款** - 凭证通过后提取资金\n\n试试说："我想发起一个医疗救助项目" 或 "上传凭证申请提款"`,
      }
    }
    
    if (intent === 'create_campaign' || intent.includes('发起') || intent.includes('创建')) {
      return {
        content: `好的，我来帮你发起公益项目！📝\n\n请告诉我以下信息：\n1. 项目名称\n2. 筹款目标金额\n3. 项目描述（帮助哪些人，解决什么问题）\n4. 预计完成时间\n\n或者你可以直接跳转到项目创建页面，填写完整信息。`,
        action: { type: 'create_campaign' }
      }
    }
    
    if (intent === 'upload' || intent.includes('凭证') || intent.includes('提款')) {
      if (!isConnected) {
        return {
          content: `要上传凭证申请提款，请先连接钱包 🔐`,
          action: { type: 'connect_wallet' }
        }
      }
      return {
        content: `好的，我帮你上传支出凭证！📄\n\n流程说明：\n1. 上传发票/收据图片\n2. AI 自动识别金额、日期、用途\n3. 审核通过后，资金将释放到你的钱包\n\n点击下方按钮跳转到凭证上传页面：`,
        action: { type: 'upload_proof' }
      }
    }
    
    if (intent === 'manage' || intent.includes('进度') || intent.includes('管理')) {
      if (!isConnected) {
        return {
          content: `要查看项目管理，请先连接钱包 🔐`,
          action: { type: 'connect_wallet' }
        }
      }
      return {
        content: `这是你的项目管理概览 📊\n\n**乡村医疗救助计划**\n• 筹款进度: 75% ($7,500 / $10,000)\n• 支持者: 156 人\n• 待提款: $2,500（需上传凭证）\n\n里程碑状态：\n✅ 第一批药品采购 - 已完成\n🔄 医疗设备购置 - 进行中\n⏳ 村医培训费用 - 待开始`,
        action: { type: 'track', data: {
          campaign: mockCampaigns[0],
          donations: [],
          totalDonated: 7500
        }}
      }
    }
  }
  
  // Donor specific responses
  if (role === 'donor') {
    if (intent === 'greeting') {
      return {
        content: `你好！我是 GiveFlow AI 助手 💚\n\n作为捐赠者，我可以帮你：\n• 🔍 **发现项目** - 告诉我你关心的领域\n• 💰 **一键捐赠** - 用自然语言完成捐赠\n• 👁️ **追踪资金** - 查看每一分钱的去向\n\n试试说："推荐一些医疗相关的项目" 或 "查看我的捐赠记录"`,
      }
    }
    
    if (intent === 'search') {
      const campaigns = mockCampaigns.slice(0, 3)
      return {
        content: `根据你的描述，我为你找到了 ${campaigns.length} 个相关项目 🎯\n\n每个项目都经过 **链上验证**，资金使用透明。点击可查看详情，或告诉我你想捐赠的金额！`,
        action: { type: 'campaigns', data: campaigns }
      }
    }
    
    if (intent === 'donate') {
      if (!isConnected) {
        return {
          content: `要进行捐赠，请先连接钱包 🔐`,
          action: { type: 'connect_wallet' }
        }
      }
      return {
        content: `太棒了！💚 选择一个项目进行捐赠：`,
        action: { type: 'campaigns', data: mockCampaigns.slice(0, 3) }
      }
    }
    
    if (intent === 'batch') {
      if (!isConnected) {
        return {
          content: `要进行批量捐赠，请先连接钱包 🔐`,
          action: { type: 'connect_wallet' }
        }
      }
      return {
        content: `批量捐赠模式 🎯\n\n选择多个项目，一次性完成捐赠！\n勾选你想支持的项目（最多5个），然后设置每个项目的捐赠金额：`,
        action: { type: 'batch_select', data: mockCampaigns }
      }
    }
    
    if (intent === 'track') {
      if (!isConnected) {
        return {
          content: `要查看捐赠记录，请先连接钱包 🔐`,
          action: { type: 'connect_wallet' }
        }
      }
      return {
        content: `这是你的捐赠追踪报告 📊\n\n累计捐赠 **$75**，支持了 **1** 个项目。\n所有记录都已存证于 Monad 区块链 ⛓️`,
        action: { type: 'track', data: {
          campaign: mockCampaigns[0],
          donations: [
            { amount: 50, date: '2026-01-15', txHash: '0xabc...' },
            { amount: 25, date: '2026-01-10', txHash: '0xdef...' },
          ],
          totalDonated: 75
        }}
      }
    }
    
    if (intent === 'verify') {
      return {
        content: `这是你捐赠项目的凭证审核记录 📋\n\n**乡村医疗救助计划** 已有 1 份凭证通过 AI 审核：\n\n✅ 药品采购发票 - $3,000\n• AI 置信度: 94%\n• 审核时间: 2026-01-10\n• 结论: 金额匹配，用途合规\n\n所有凭证审核结果都记录在链上，确保透明可信 ⛓️`,
      }
    }
  }
  
  // Default response
  return {
    content: role === 'beneficiary' 
      ? `我可以帮你管理公益项目！试试：\n• "发起新项目"\n• "上传凭证提款"\n• "查看项目进度"`
      : `我可以帮你完成公益捐赠！试试：\n• "推荐公益项目"\n• "我想捐款"\n• "查看资金流向"`,
  }
}

// Detect intent from message
function detectIntent(message: string, role: UserRole): { intent: string; params: Record<string, string> } {
  const lowerMsg = message.toLowerCase()
  
  if (role === 'beneficiary') {
    if (lowerMsg.includes('发起') || lowerMsg.includes('创建') || lowerMsg.includes('新项目')) {
      return { intent: 'create_campaign', params: {} }
    }
    if (lowerMsg.includes('凭证') || lowerMsg.includes('上传') || lowerMsg.includes('提款') || lowerMsg.includes('申请') || lowerMsg.includes('审核')) {
      return { intent: 'upload', params: {} }
    }
    if (lowerMsg.includes('进度') || lowerMsg.includes('管理') || lowerMsg.includes('项目') || lowerMsg.includes('资金')) {
      return { intent: 'manage', params: {} }
    }
  }
  
  if (role === 'donor') {
    if (lowerMsg.includes('推荐') || lowerMsg.includes('找') || lowerMsg.includes('搜索') || 
        lowerMsg.includes('医疗') || lowerMsg.includes('教育') || lowerMsg.includes('发现')) {
      return { intent: 'search', params: { query: message } }
    }
    if (lowerMsg.includes('批量') || lowerMsg.includes('多个') || lowerMsg.includes('同时')) {
      return { intent: 'batch', params: {} }
    }
    if (lowerMsg.includes('捐') || lowerMsg.includes('donate') || lowerMsg.includes('支持')) {
      return { intent: 'donate', params: {} }
    }
    if (lowerMsg.includes('追踪') || lowerMsg.includes('记录') || lowerMsg.includes('流向') || lowerMsg.includes('我的')) {
      return { intent: 'track', params: {} }
    }
    if (lowerMsg.includes('凭证') || lowerMsg.includes('审核') || lowerMsg.includes('验证') || lowerMsg.includes('查看')) {
      return { intent: 'verify', params: {} }
    }
  }
  
  if (lowerMsg.includes('你好') || lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('开始')) {
    return { intent: 'greeting', params: {} }
  }
  
  return { intent: 'general', params: {} }
}

// Campaign Card
function CampaignCard({ campaign, onClick }: { campaign: Campaign; onClick: () => void }) {
  const progress = Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)
  return (
    <div 
      className="p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-colors cursor-pointer border border-transparent hover:border-emerald-500/30"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <Badge className="bg-emerald-500/10 text-emerald-400 text-xs">{campaign.category}</Badge>
        <span className="text-xs text-emerald-400">{progress}%</span>
      </div>
      <h4 className="text-white text-sm font-medium mb-1">{campaign.title}</h4>
      <Progress value={progress} className="h-1 bg-slate-700" />
      <div className="flex justify-between mt-1 text-xs text-slate-400">
        <span>{formatAmount(campaign.raisedAmount)}</span>
        <span>目标 {formatAmount(campaign.targetAmount)}</span>
      </div>
    </div>
  )
}

// Batch donation selection state
interface BatchSelection {
  campaignId: string
  selected: boolean
  amount: number
}

export function GlobalChatbot() {
  const { role } = useUser()
  const { address, isConnected } = useAccount()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Batch donation state
  const [batchSelections, setBatchSelections] = useState<BatchSelection[]>([])
  const [showBatchConfirm, setShowBatchConfirm] = useState(false)
  const [isDonating, setIsDonating] = useState(false)

  const tools = role === 'beneficiary' ? beneficiaryTools : donorTools
  
  // Initialize batch selections
  const initBatchSelections = (campaigns: Campaign[]) => {
    setBatchSelections(campaigns.map(c => ({
      campaignId: c.id,
      selected: false,
      amount: 10
    })))
  }
  
  // Toggle campaign selection
  const toggleBatchSelection = (campaignId: string) => {
    setBatchSelections(prev => prev.map(s => 
      s.campaignId === campaignId ? { ...s, selected: !s.selected } : s
    ))
  }
  
  // Update amount
  const updateBatchAmount = (campaignId: string, amount: number) => {
    setBatchSelections(prev => prev.map(s => 
      s.campaignId === campaignId ? { ...s, amount: Math.max(1, amount) } : s
    ))
  }
  
  // Get selected count
  const selectedCount = batchSelections.filter(s => s.selected).length
  const totalAmount = batchSelections.filter(s => s.selected).reduce((sum, s) => sum + s.amount, 0)
  
  // Execute batch donation
  const executeBatchDonation = async () => {
    setIsDonating(true)
    await new Promise(r => setTimeout(r, 2000))
    
    const selectedItems = batchSelections.filter(s => s.selected)
    const campaigns = selectedItems.map(s => mockCampaigns.find(c => c.id === s.campaignId)!)
    
    const successMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `🎉 批量捐赠成功！\n\n你已向 ${selectedItems.length} 个项目捐赠共计 **$${totalAmount}**\n\n${campaigns.map((c, i) => `✅ ${c.title} - $${selectedItems[i].amount}`).join('\n')}\n\n所有交易已记录在 Monad 区块链上 ⛓️\n利用 Monad 的并行执行特性，${selectedItems.length} 笔交易同时完成！`,
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, successMessage])
    setShowBatchConfirm(false)
    setBatchSelections([])
    setIsDonating(false)
  }

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize with greeting when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = generateResponse('greeting', {}, isConnected, role)
      setMessages([{
        id: '1',
        role: 'assistant',
        content: greeting.content,
        timestamp: new Date(),
      }])
    }
  }, [isOpen, role])

  // Handle send
  const handleSend = async (customMessage?: string) => {
    const messageText = customMessage || input
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    await new Promise(r => setTimeout(r, 600 + Math.random() * 400))

    const { intent, params } = detectIntent(messageText, role)
    const response = generateResponse(intent, params, isConnected, role)

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

  // Handle tool click
  const handleToolClick = (tool: Tool) => {
    handleSend(tool.action)
  }

  if (!role) return null

  const accentColor = role === 'beneficiary' ? 'teal' : 'emerald'

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r ${
            role === 'beneficiary' 
              ? 'from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600' 
              : 'from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
          } shadow-lg flex items-center justify-center transition-all hover:scale-110`}
          style={{ boxShadow: `0 0 20px ${role === 'beneficiary' ? 'rgba(20, 184, 166, 0.4)' : 'rgba(16, 185, 129, 0.4)'}` }}
        >
          <MessageCircle className="w-6 h-6 text-white" />
          {/* Notification dot */}
          <span className="absolute top-0 right-0 w-3 h-3 bg-pink-500 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`fixed z-50 transition-all duration-300 ${
            isMinimized 
              ? 'bottom-6 right-6 w-72' 
              : 'bottom-6 right-6 w-96 h-[600px] max-h-[80vh]'
          }`}
        >
          <Card className={`h-full bg-slate-900/95 backdrop-blur-xl border-${accentColor}-500/30 shadow-2xl flex flex-col overflow-hidden`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-3 border-b border-${accentColor}-500/20 bg-slate-900/80`}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                  role === 'beneficiary' ? 'from-teal-500 to-cyan-500' : 'from-emerald-500 to-teal-500'
                } flex items-center justify-center`}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white text-sm font-semibold">GiveFlow AI</h3>
                  <span className={`text-xs text-${accentColor}-400`}>
                    {role === 'beneficiary' ? '募捐者助手' : '捐赠者助手'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 text-slate-400 hover:text-white rounded"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className={`flex items-start gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                            message.role === 'user' 
                              ? 'bg-slate-700' 
                              : `bg-gradient-to-br ${role === 'beneficiary' ? 'from-teal-500 to-cyan-500' : 'from-emerald-500 to-teal-500'}`
                          }`}>
                            {message.role === 'user' ? (
                              <User className="w-3 h-3 text-slate-300" />
                            ) : (
                              <Bot className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className={`rounded-xl px-3 py-2 ${
                            message.role === 'user' 
                              ? `bg-${accentColor}-500/20 text-white` 
                              : 'bg-slate-800/80 text-slate-200'
                          }`}>
                            <div className="text-xs whitespace-pre-wrap leading-relaxed">
                              {message.content.split('**').map((part, i) => 
                                i % 2 === 1 ? <strong key={i} className={`text-${accentColor}-400`}>{part}</strong> : part
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Action cards */}
                        {message.action && (
                          <div className="mt-2 ml-8 space-y-2">
                            {message.action.type === 'campaigns' && (
                              (message.action.data as Campaign[]).map((campaign) => (
                                <CampaignCard 
                                  key={campaign.id} 
                                  campaign={campaign}
                                  onClick={() => window.location.href = `/campaigns/${campaign.id}`}
                                />
                              ))
                            )}
                            
                            {/* Batch Select UI */}
                            {message.action.type === 'batch_select' && !showBatchConfirm && (
                              <div className="space-y-2">
                                {(message.action.data as Campaign[]).map((campaign) => {
                                  const selection = batchSelections.find(s => s.campaignId === campaign.id)
                                  const isSelected = selection?.selected || false
                                  const progress = Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)
                                  
                                  // Initialize if needed
                                  if (batchSelections.length === 0) {
                                    initBatchSelections(message.action!.data as Campaign[])
                                  }
                                  
                                  return (
                                    <div
                                      key={campaign.id}
                                      className={`p-3 rounded-lg transition-all ${
                                        isSelected 
                                          ? 'bg-emerald-500/20 border border-emerald-500/50' 
                                          : 'bg-slate-800/50 border border-transparent hover:border-slate-700'
                                      }`}
                                    >
                                      <div className="flex items-start gap-2">
                                        <button
                                          onClick={() => toggleBatchSelection(campaign.id)}
                                          className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                                            isSelected 
                                              ? 'bg-emerald-500 border-emerald-500' 
                                              : 'border-slate-600 hover:border-slate-500'
                                          }`}
                                        >
                                          {isSelected && <Check className="w-3 h-3 text-white" />}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="text-white text-xs font-medium truncate">{campaign.title}</span>
                                            <Badge className="bg-slate-700 text-slate-300 text-[10px]">{campaign.category}</Badge>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Progress value={progress} className="h-1 flex-1 bg-slate-700" />
                                            <span className="text-[10px] text-slate-400">{progress}%</span>
                                          </div>
                                          {isSelected && (
                                            <div className="flex items-center gap-2 mt-2">
                                              <span className="text-[10px] text-slate-400">金额:</span>
                                              <div className="flex items-center gap-1">
                                                <button
                                                  onClick={() => updateBatchAmount(campaign.id, (selection?.amount || 10) - 5)}
                                                  className="w-5 h-5 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center"
                                                >
                                                  <Minus className="w-3 h-3 text-slate-300" />
                                                </button>
                                                <span className="text-xs text-emerald-400 font-medium w-10 text-center">
                                                  ${selection?.amount || 10}
                                                </span>
                                                <button
                                                  onClick={() => updateBatchAmount(campaign.id, (selection?.amount || 10) + 5)}
                                                  className="w-5 h-5 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center"
                                                >
                                                  <Plus className="w-3 h-3 text-slate-300" />
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                                
                                {/* Batch summary & confirm */}
                                {selectedCount > 0 && (
                                  <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs text-slate-400">已选 {selectedCount} 个项目</span>
                                      <span className="text-sm font-bold text-emerald-400">总计 ${totalAmount}</span>
                                    </div>
                                    <Button
                                      onClick={() => setShowBatchConfirm(true)}
                                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-sm h-8"
                                    >
                                      <Heart className="w-3 h-3 mr-1" fill="white" />
                                      确认批量捐赠
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Batch Confirm UI */}
                            {showBatchConfirm && (
                              <div className="p-4 bg-slate-800/50 rounded-lg border border-emerald-500/30 space-y-3">
                                <h4 className="text-white text-sm font-semibold text-center">确认批量捐赠</h4>
                                <div className="space-y-1.5">
                                  {batchSelections.filter(s => s.selected).map(s => {
                                    const campaign = mockCampaigns.find(c => c.id === s.campaignId)
                                    return (
                                      <div key={s.campaignId} className="flex justify-between text-xs">
                                        <span className="text-slate-400 truncate max-w-[60%]">{campaign?.title}</span>
                                        <span className="text-white">${s.amount}</span>
                                      </div>
                                    )
                                  })}
                                </div>
                                <div className="border-t border-slate-700 pt-2">
                                  <div className="flex justify-between text-sm font-semibold">
                                    <span className="text-white">总计</span>
                                    <span className="text-emerald-400">${totalAmount}</span>
                                  </div>
                                </div>
                                <p className="text-[10px] text-slate-500 text-center">
                                  利用 Monad 并行执行，{selectedCount} 笔交易将同时完成
                                </p>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowBatchConfirm(false)}
                                    className="flex-1 border-slate-700 text-slate-400 h-8"
                                    disabled={isDonating}
                                  >
                                    返回
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={executeBatchDonation}
                                    disabled={isDonating}
                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 h-8"
                                  >
                                    {isDonating ? (
                                      <>
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                        处理中...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        确认
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            {message.action.type === 'connect_wallet' && (
                              <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                                <ConnectButton.Custom>
                                  {({ openConnectModal }) => (
                                    <Button
                                      size="sm"
                                      onClick={openConnectModal}
                                      className={`bg-gradient-to-r ${
                                        role === 'beneficiary' ? 'from-teal-500 to-cyan-500' : 'from-emerald-500 to-teal-500'
                                      }`}
                                    >
                                      <Wallet className="w-4 h-4 mr-1" />
                                      连接钱包
                                    </Button>
                                  )}
                                </ConnectButton.Custom>
                              </div>
                            )}
                            {message.action.type === 'upload_proof' && (
                              <Button
                                size="sm"
                                onClick={() => window.location.href = '/proof/upload'}
                                className="w-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30"
                              >
                                <Upload className="w-4 h-4 mr-1" />
                                前往上传凭证
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex items-start gap-2">
                      <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${
                        role === 'beneficiary' ? 'from-teal-500 to-cyan-500' : 'from-emerald-500 to-teal-500'
                      } flex items-center justify-center`}>
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <div className="bg-slate-800/80 rounded-xl px-3 py-2">
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 bg-${accentColor}-400 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
                          <span className={`w-1.5 h-1.5 bg-${accentColor}-400 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
                          <span className={`w-1.5 h-1.5 bg-${accentColor}-400 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Tools */}
                <div className={`px-3 py-2 border-t border-${accentColor}-500/10`}>
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {tools.map((tool) => (
                      <Button
                        key={tool.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleToolClick(tool)}
                        className={`flex-shrink-0 text-xs border-${tool.color}-500/30 text-${tool.color}-400 hover:bg-${tool.color}-500/10 px-2 py-1 h-7`}
                      >
                        <tool.icon className="w-3 h-3 mr-1" />
                        {tool.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className={`p-3 border-t border-${accentColor}-500/20`}>
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder={role === 'beneficiary' ? '问我关于项目管理的问题...' : '问我关于捐赠的问题...'}
                      className="flex-1 bg-slate-800/50 border-slate-700 text-white text-sm placeholder:text-slate-500 focus:border-emerald-500 h-9"
                    />
                    <Button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isTyping}
                      size="sm"
                      className={`bg-gradient-to-r ${
                        role === 'beneficiary' ? 'from-teal-500 to-cyan-500' : 'from-emerald-500 to-teal-500'
                      } px-3 h-9`}
                    >
                      {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Minimized state */}
            {isMinimized && (
              <div className="p-3">
                <p className="text-xs text-slate-400 text-center">
                  点击展开继续对话
                </p>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  )
}
