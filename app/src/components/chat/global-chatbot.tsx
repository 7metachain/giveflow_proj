'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Send,
  User,
  Heart,
  Search,
  Eye,
  Wallet,
  CheckCircle,
  Loader2,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  Upload,
  FileCheck,
  Plus,
  TrendingUp,
  DollarSign,
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
  getCategoryStyle,
  type Campaign,
} from '@/lib/mock-data'

// Tool definitions
interface Tool {
  id: string
  label: string
  icon: typeof Heart
  action: string
}

const donorTools: Tool[] = [
  { id: 'search', label: '找项目', icon: Search, action: '推荐一些女性公益项目' },
  { id: 'batch', label: '批量支持', icon: ListChecks, action: '我想同时支持多个项目' },
  { id: 'track', label: '追踪', icon: Eye, action: '查看我的捐赠记录和资金流向' },
  { id: 'verify', label: '凭证', icon: FileCheck, action: '查看项目的支出凭证和AI审核结果' },
]

const beneficiaryTools: Tool[] = [
  { id: 'create', label: '发起项目', icon: Plus, action: '我想发起一个女性公益项目' },
  { id: 'upload', label: '上传凭证', icon: Upload, action: '我要上传支出凭证给AI审核' },
  { id: 'manage', label: '项目进度', icon: TrendingUp, action: '查看我的项目进度和资金情况' },
  { id: 'withdraw', label: '申请提款', icon: DollarSign, action: '凭证审核通过后申请提取资金' },
]

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  action?: MessageAction
}

interface MessageAction {
  type: 'campaigns' | 'donate' | 'track' | 'connect_wallet' | 'upload_proof' | 'create_campaign' | 'batch_select' | 'batch_confirm' | 'search_campaigns' | 'track_donations'
  data?: Campaign[] | Campaign | TrackingData
  params?: Record<string, unknown>
}

interface TrackingData {
  campaign: Campaign
  donations: { amount: number; date: string; txHash: string }[]
  totalDonated: number
}

// Call the AI API
async function callAI(messages: { role: 'user' | 'assistant'; content: string }[]): Promise<{ message: string; action: MessageAction | null }> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    })
    
    if (!response.ok) {
      throw new Error('API request failed')
    }
    
    const data = await response.json()
    return {
      message: data.message || '抱歉，我没有理解你的问题。',
      action: data.action ? { type: data.action.type, params: data.action.params } : null,
    }
  } catch (error) {
    console.error('AI call failed:', error)
    return {
      message: '抱歉，我遇到了一点问题。请再试一次！',
      action: null,
    }
  }
}

// Map action to UI data
function processAction(action: MessageAction | null, isConnected: boolean): MessageAction | undefined {
  if (!action) return undefined
  
  switch (action.type) {
    case 'search_campaigns':
      const category = action.params?.category as string | undefined
      let campaigns = mockCampaigns
      if (category) {
        campaigns = mockCampaigns.filter(c => c.category.includes(category))
      }
      return { type: 'campaigns', data: campaigns.slice(0, 3) }
    
    case 'donate':
      if (!isConnected) {
        return { type: 'connect_wallet' }
      }
      return { type: 'campaigns', data: mockCampaigns.slice(0, 3) }
    
    case 'track_donations':
      if (!isConnected) {
        return { type: 'connect_wallet' }
      }
      return { type: 'track', data: {
        campaign: mockCampaigns[0],
        donations: [
          { amount: 100, date: '2026-01-15', txHash: '0xabc...' },
          { amount: 50, date: '2026-01-10', txHash: '0xdef...' },
        ],
        totalDonated: 150
      }}
    
    case 'connect_wallet':
      return { type: 'connect_wallet' }
    
    default:
      return undefined
  }
}

function CampaignCard({ campaign, onClick }: { campaign: Campaign; onClick: () => void }) {
  const progress = Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)
  const style = getCategoryStyle(campaign.category)
  return (
    <div 
      className="p-3 bg-[#FAF7F2] rounded-xl hover:bg-[#F5F2ED] transition-colors cursor-pointer border border-[#E8E2D9]"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <Badge className={`${style.bg} ${style.text} ${style.border} text-xs`}>{campaign.category}</Badge>
        <span className="text-xs text-[#C4866B] font-medium">{progress}%</span>
      </div>
      <h4 className="text-[#3D3D3D] text-sm font-medium mb-1">{campaign.title}</h4>
      <div className="h-1.5 bg-[#E8E2D9] rounded-full overflow-hidden">
        <div className="h-full progress-warm" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between mt-1.5 text-xs text-[#B8A99A]">
        <span>{formatAmount(campaign.raisedAmount)}</span>
        <span>目标 {formatAmount(campaign.targetAmount)}</span>
      </div>
    </div>
  )
}

interface BatchSelection {
  campaignId: string
  selected: boolean
  amount: number
}

export function GlobalChatbot() {
  const { role } = useUser()
  const { isConnected } = useAccount()
  const [isOpen, setIsOpen] = useState(true) // 默认打开
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [batchSelections, setBatchSelections] = useState<BatchSelection[]>([])
  const [showBatchConfirm, setShowBatchConfirm] = useState(false)
  const [isDonating, setIsDonating] = useState(false)

  // Conversation history for AI
  const [conversationHistory, setConversationHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])

  const tools = role === 'beneficiary' ? beneficiaryTools : donorTools
  
  const initBatchSelections = (campaigns: Campaign[]) => {
    setBatchSelections(campaigns.map(c => ({ campaignId: c.id, selected: false, amount: 10 })))
  }
  
  const toggleBatchSelection = (campaignId: string) => {
    setBatchSelections(prev => prev.map(s => 
      s.campaignId === campaignId ? { ...s, selected: !s.selected } : s
    ))
  }
  
  const updateBatchAmount = (campaignId: string, amount: number) => {
    setBatchSelections(prev => prev.map(s => 
      s.campaignId === campaignId ? { ...s, amount: Math.max(1, amount) } : s
    ))
  }
  
  const selectedCount = batchSelections.filter(s => s.selected).length
  const totalAmount = batchSelections.filter(s => s.selected).reduce((sum, s) => sum + s.amount, 0)
  
  const executeBatchDonation = async () => {
    setIsDonating(true)
    await new Promise(r => setTimeout(r, 2000))
    
    const selectedItems = batchSelections.filter(s => s.selected)
    const campaigns = selectedItems.map(s => mockCampaigns.find(c => c.id === s.campaignId)!)
    
    const successMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `🎉 批量支持成功！\n\n你已向 ${selectedItems.length} 个女性公益项目支持共计 **${totalAmount} MON**\n\n${campaigns.map((c, i) => `✅ ${c.title} - ${selectedItems[i].amount} MON`).join('\n')}\n\n所有交易已记录在 Monad 区块链上 ⛓️\n感谢你为女性公益贡献力量！🌸`,
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, successMessage])
    setShowBatchConfirm(false)
    setBatchSelections([])
    setIsDonating(false)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initial greeting when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = role === 'beneficiary' 
        ? `你好！我是 SHE³ AI 助手 🌸\n\n作为项目发起人，我可以帮你：\n• ➕ **发起项目** - 创建女性健康/教育公益项目\n• 📤 **上传凭证** - AI 审核后申请资金释放\n• 📊 **管理项目** - 查看筹款进度和支持者\n\n有什么我可以帮你的吗？`
        : `你好！我是 SHE³ AI 助手 🌸\n\n我可以帮你发现和支持女性公益项目：\n• 🩺 **女性健康** - 疾病筛查、医疗援助\n• 📚 **女性教育** - 职业培训、学业资助\n• 💜 **女性赋能** - 心理援助、经济独立\n\n告诉我你关心什么领域，我来帮你推荐项目！`
      
      setMessages([{ id: '1', role: 'assistant', content: greeting, timestamp: new Date() }])
    }
  }, [isOpen, role, messages.length])

  const handleSend = async (customMessage?: string) => {
    const messageText = customMessage || input
    if (!messageText.trim()) return

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: messageText, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Update conversation history
    const newHistory = [...conversationHistory, { role: 'user' as const, content: messageText }]
    setConversationHistory(newHistory)

    // Call the actual AI API
    const response = await callAI(newHistory)
    
    // Update conversation history with assistant response
    setConversationHistory(prev => [...prev, { role: 'assistant' as const, content: response.message }])

    // Process the action to get UI data
    const processedAction = processAction(response.action, isConnected)

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.message,
      timestamp: new Date(),
      action: processedAction,
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsTyping(false)
  }

  const handleToolClick = (tool: Tool) => {
    handleSend(tool.action)
  }

  if (!role) return null

  return (
    <>
      {/* Chat Button - 更醒目的设计 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gradient-to-r from-[#D4785C] to-[#E8B4A0] text-white pl-4 pr-5 py-3 rounded-full shadow-xl transition-all hover:scale-105 hover:shadow-2xl group"
          style={{ 
            boxShadow: '0 8px 32px rgba(212, 120, 92, 0.4)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#7BA089] rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#7BA089] rounded-full" />
          </div>
          <span className="font-semibold text-base">AI 助手</span>
          <Sparkles className="w-4 h-4 opacity-80 group-hover:animate-spin" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed z-50 transition-all duration-300 ${isMinimized ? 'bottom-6 right-6 w-72' : 'bottom-6 right-6 w-96 h-[600px] max-h-[80vh]'}`}>
          <Card className="h-full bg-white border-[#E8E2D9] shadow-2xl flex flex-col overflow-hidden rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#E8E2D9] bg-gradient-to-r from-[#FAF7F2] to-[#F5F2ED]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C4866B] to-[#D4A59A] flex items-center justify-center shadow-sm">
                  <span className="text-lg">🌸</span>
                </div>
                <div>
                  <h3 className="text-[#3D3D3D] text-sm font-semibold">SHE³ AI 助手</h3>
                  <span className="text-xs text-[#B8A99A]">
                    {role === 'beneficiary' ? '项目发起人助手' : '支持者助手'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 text-[#B8A99A] hover:text-[#5D4E47] rounded-lg hover:bg-[#F5F2ED]">
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 text-[#B8A99A] hover:text-[#5D4E47] rounded-lg hover:bg-[#F5F2ED]">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF7F2]">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className={`flex items-start gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            message.role === 'user' 
                              ? 'bg-[#E8E2D9]' 
                              : 'bg-gradient-to-br from-[#C4866B] to-[#D4A59A]'
                          }`}>
                            {message.role === 'user' ? (
                              <User className="w-3.5 h-3.5 text-[#5D4E47]" />
                            ) : (
                              <span className="text-xs">🌸</span>
                            )}
                          </div>
                          <div className={`rounded-2xl px-4 py-2.5 ${
                            message.role === 'user' 
                              ? 'bg-[#C4866B] text-white' 
                              : 'bg-white text-[#3D3D3D] border border-[#E8E2D9] shadow-sm'
                          }`}>
                            <div className="text-sm whitespace-pre-wrap leading-relaxed">
                              {message.content.split('**').map((part, i) => 
                                i % 2 === 1 ? <strong key={i} className={message.role === 'user' ? 'text-white' : 'text-[#C4866B]'}>{part}</strong> : part
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Action cards */}
                        {message.action && (
                          <div className="mt-2 ml-9 space-y-2">
                            {message.action.type === 'campaigns' && (
                              (message.action.data as Campaign[]).map((campaign) => (
                                <CampaignCard key={campaign.id} campaign={campaign} onClick={() => window.location.href = `/campaigns/${campaign.id}`} />
                              ))
                            )}
                            
                            {message.action.type === 'batch_select' && !showBatchConfirm && (
                              <div className="space-y-2">
                                {(message.action.data as Campaign[]).map((campaign) => {
                                  const selection = batchSelections.find(s => s.campaignId === campaign.id)
                                  const isSelected = selection?.selected || false
                                  const progress = Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)
                                  const style = getCategoryStyle(campaign.category)
                                  
                                  if (batchSelections.length === 0) initBatchSelections(message.action!.data as Campaign[])
                                  
                                  return (
                                    <div key={campaign.id} className={`p-3 rounded-xl transition-all ${isSelected ? 'bg-[#C4866B]/10 border border-[#C4866B]/30' : 'bg-white border border-[#E8E2D9]'}`}>
                                      <div className="flex items-start gap-2">
                                        <button
                                          onClick={() => toggleBatchSelection(campaign.id)}
                                          className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${isSelected ? 'bg-[#C4866B] border-[#C4866B]' : 'border-[#D4C8BC] hover:border-[#C4866B]'}`}
                                        >
                                          {isSelected && <Check className="w-3 h-3 text-white" />}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[#3D3D3D] text-xs font-medium truncate">{campaign.title}</span>
                                            <Badge className={`${style.bg} ${style.text} text-[10px]`}>{campaign.category}</Badge>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1 bg-[#E8E2D9] rounded-full overflow-hidden">
                                              <div className="h-full progress-warm" style={{ width: `${progress}%` }} />
                                            </div>
                                            <span className="text-[10px] text-[#B8A99A]">{progress}%</span>
                                          </div>
                                          {isSelected && (
                                            <div className="flex items-center gap-2 mt-2">
                                              <span className="text-[10px] text-[#B8A99A]">金额:</span>
                                              <div className="flex items-center gap-1">
                                                <button onClick={() => updateBatchAmount(campaign.id, (selection?.amount || 10) - 5)} className="w-5 h-5 rounded bg-[#E8E2D9] hover:bg-[#D4C8BC] flex items-center justify-center">
                                                  <Minus className="w-3 h-3 text-[#5D4E47]" />
                                                </button>
                                                <span className="text-xs text-[#C4866B] font-medium w-12 text-center">{selection?.amount || 10}</span>
                                                <button onClick={() => updateBatchAmount(campaign.id, (selection?.amount || 10) + 5)} className="w-5 h-5 rounded bg-[#E8E2D9] hover:bg-[#D4C8BC] flex items-center justify-center">
                                                  <Plus className="w-3 h-3 text-[#5D4E47]" />
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                                
                                {selectedCount > 0 && (
                                  <div className="p-3 bg-[#C4866B]/10 rounded-xl border border-[#C4866B]/30">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs text-[#8A7B73]">已选 {selectedCount} 个项目</span>
                                      <span className="text-sm font-bold text-[#C4866B]">总计 {totalAmount} MON</span>
                                    </div>
                                    <Button onClick={() => setShowBatchConfirm(true)} className="w-full btn-warm text-sm h-9 rounded-full">
                                      <Heart className="w-3 h-3 mr-1" fill="white" />确认支持
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {showBatchConfirm && (
                              <div className="p-4 bg-white rounded-xl border border-[#E8E2D9] shadow-sm space-y-3">
                                <h4 className="text-[#3D3D3D] text-sm font-semibold text-center">确认批量支持</h4>
                                <div className="space-y-1.5">
                                  {batchSelections.filter(s => s.selected).map(s => {
                                    const campaign = mockCampaigns.find(c => c.id === s.campaignId)
                                    return (
                                      <div key={s.campaignId} className="flex justify-between text-xs">
                                        <span className="text-[#8A7B73] truncate max-w-[60%]">{campaign?.title}</span>
                                        <span className="text-[#3D3D3D]">{s.amount} MON</span>
                                      </div>
                                    )
                                  })}
                                </div>
                                <div className="border-t border-[#E8E2D9] pt-2">
                                  <div className="flex justify-between text-sm font-semibold">
                                    <span className="text-[#3D3D3D]">总计</span>
                                    <span className="text-[#C4866B]">{totalAmount} MON</span>
                                  </div>
                                </div>
                                <p className="text-[10px] text-[#B8A99A] text-center">利用 Monad 并行执行，{selectedCount} 笔交易将同时完成</p>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => setShowBatchConfirm(false)} className="flex-1 border-[#E8E2D9] text-[#5D4E47] h-8 rounded-full" disabled={isDonating}>返回</Button>
                                  <Button size="sm" onClick={executeBatchDonation} disabled={isDonating} className="flex-1 btn-warm h-8 rounded-full">
                                    {isDonating ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />处理中...</> : <><CheckCircle className="w-3 h-3 mr-1" />确认</>}
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            {message.action.type === 'connect_wallet' && (
                              <div className="p-3 bg-white rounded-xl text-center border border-[#E8E2D9]">
                                <ConnectButton.Custom>
                                  {({ openConnectModal }) => (
                                    <Button size="sm" onClick={openConnectModal} className="btn-warm rounded-full">
                                      <Wallet className="w-4 h-4 mr-1" />连接钱包
                                    </Button>
                                  )}
                                </ConnectButton.Custom>
                              </div>
                            )}
                            {message.action.type === 'upload_proof' && (
                              <Button size="sm" onClick={() => window.location.href = '/proof/upload'} className="w-full btn-sage rounded-full">
                                <Upload className="w-4 h-4 mr-1" />前往上传凭证
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#C4866B] to-[#D4A59A] flex items-center justify-center">
                        <span className="text-xs">🌸</span>
                      </div>
                      <div className="bg-white rounded-2xl px-4 py-2.5 border border-[#E8E2D9] shadow-sm">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-[#C4866B] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-[#C4866B] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-[#C4866B] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Tools */}
                <div className="px-3 py-2 border-t border-[#E8E2D9] bg-white">
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {tools.map((tool) => (
                      <Button key={tool.id} variant="outline" size="sm" onClick={() => handleToolClick(tool)} className="flex-shrink-0 text-xs border-[#E8E2D9] text-[#5D4E47] hover:bg-[#F5F2ED] hover:text-[#C4866B] px-3 py-1 h-7 rounded-full">
                        <tool.icon className="w-3 h-3 mr-1" />{tool.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="p-3 border-t border-[#E8E2D9] bg-white">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder={role === 'beneficiary' ? '问我关于项目管理的问题...' : '告诉我你想支持什么类型的项目...'}
                      className="flex-1 bg-[#F5F2ED] border-[#E8E2D9] text-[#3D3D3D] text-sm placeholder:text-[#B8A99A] focus:border-[#C4866B] h-10 rounded-full px-4"
                    />
                    <Button onClick={() => handleSend()} disabled={!input.trim() || isTyping} size="sm" className="btn-warm px-4 h-10 rounded-full">
                      {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {isMinimized && (
              <div className="p-3 bg-[#FAF7F2]">
                <p className="text-xs text-[#B8A99A] text-center">点击展开继续对话</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  )
}
