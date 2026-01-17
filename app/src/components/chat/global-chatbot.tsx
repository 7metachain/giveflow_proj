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
  ExternalLink,
} from 'lucide-react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { parseEther, formatEther } from 'viem'
import { useUser, type UserRole } from '@/lib/user-context'
import {
  mockCampaigns,
  formatAmount,
  getCategoryStyle,
  type Campaign,
} from '@/lib/mock-data'
import { BatchDonateABI } from '@/lib/contracts'
import { CONTRACT_ADDRESSES, monadTestnet } from '@/lib/web3'

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
function processAction(action: MessageAction | null, isConnected: boolean, isBatchMode: boolean = false): MessageAction | undefined {
  if (!action) return undefined
  
  switch (action.type) {
    case 'search_campaigns':
      const category = action.params?.category as string | undefined
      let campaigns = mockCampaigns
      if (category) {
        campaigns = mockCampaigns.filter(c => c.category.includes(category))
      }
      // 如果是批量模式，返回 batch_select 类型
      if (isBatchMode) {
        return { type: 'batch_select', data: campaigns.slice(0, 5) }
      }
      return { type: 'campaigns', data: campaigns.slice(0, 3) }
    
    case 'donate':
      if (!isConnected) {
        return { type: 'connect_wallet' }
      }
      // 捐赠也使用批量模式
      return { type: 'batch_select', data: mockCampaigns.slice(0, 5) }
    
    case 'track_donations':
      if (!isConnected) {
        return { type: 'connect_wallet' }
      }
      // 不使用 mock，直接引导到链上真实记录页
      return { type: 'track_donations' }
    
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
  const { isConnected, address } = useAccount()
  const [isOpen, setIsOpen] = useState(true) // 默认打开
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [batchSelections, setBatchSelections] = useState<BatchSelection[]>([])
  const [showBatchConfirm, setShowBatchConfirm] = useState(false)
  const [isDonating, setIsDonating] = useState(false)
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()
  const [txError, setTxError] = useState<string | null>(null)

  // 合约交互 hooks
  const { writeContract, data: writeTxHash, isPending: isWritePending, error: writeError, reset: resetWrite } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: writeTxHash,
  })

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
  
  // 监听交易成功
  useEffect(() => {
    if (isTxSuccess && writeTxHash) {
      const selectedItems = batchSelections.filter(s => s.selected)
      const campaigns = selectedItems.map(s => mockCampaigns.find(c => c.id === s.campaignId)!)
      
      const successMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🎉 **批量支持成功！**\n\n你已向 ${selectedItems.length} 个女性公益项目支持共计 **${totalAmount} MON**\n\n${campaigns.map((c, i) => `✅ ${c.title} - ${selectedItems[i].amount} MON`).join('\n')}\n\n📜 **交易哈希**: ${writeTxHash.slice(0, 10)}...${writeTxHash.slice(-8)}\n\n所有交易已记录在 Monad 区块链上 ⛓️\n\n👉 [点击这里查看链上记录](/dashboard/donor)\n\n感谢你为女性公益贡献力量！🌸`,
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, successMessage])
      setShowBatchConfirm(false)
      setBatchSelections([])
      setIsDonating(false)
      setTxHash(writeTxHash)
      
      console.log('✅ 批量捐赠链上交易成功！', {
        txHash: writeTxHash,
        项目数: selectedItems.length,
        总金额: totalAmount + ' MON',
      })
    }
  }, [isTxSuccess, writeTxHash])
  
  // 监听交易错误
  useEffect(() => {
    if (writeError) {
      setIsDonating(false)
      setTxError(writeError.message || '交易失败')
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ **交易失败**\n\n${writeError.message || '发生错误，请重试'}\n\n请确保：\n• 钱包已连接 Monad Testnet\n• 账户有足够的 MON 余额\n• 已确认 MetaMask 签名`,
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, errorMessage])
      console.error('❌ 批量捐赠失败:', writeError)
    }
  }, [writeError])
  
  // 更新捐赠状态
  useEffect(() => {
    setIsDonating(isWritePending || isConfirming)
  }, [isWritePending, isConfirming])
  
  // 执行真正的链上批量捐赠
  const executeBatchDonation = async () => {
    if (!isConnected || !address) {
      setTxError('请先连接钱包')
      return
    }
    
    setIsDonating(true)
    setTxError(null)
    resetWrite()
    
    try {
      const selectedItems = batchSelections.filter(s => s.selected)
      
      // 从 campaign id 提取数字 ID (例如 "campaign-1" -> 1)
      const campaignIds = selectedItems.map(s => {
        const idStr = s.campaignId.replace('campaign-', '')
        return BigInt(parseInt(idStr) || 1)
      })
      
      // 将 MON 金额转换为 wei (测试模式：除以 1000)
      const amounts = selectedItems.map(s => parseEther((s.amount / 1000).toString()))
      
      // 计算总金额
      const totalValue = amounts.reduce((sum, a) => sum + a, BigInt(0))
      
      console.log('📤 发起批量捐赠（将被记录到链上）:', {
        钱包地址: address,
        合约地址: CONTRACT_ADDRESSES.batchDonate,
        项目数量: campaignIds.length,
        项目IDs: campaignIds.map(id => id.toString()),
        各项金额MON: selectedItems.map(s => s.amount),
        链上金额MON: selectedItems.map(s => (s.amount / 1000).toFixed(4)),
        总金额Wei: totalValue.toString(),
      })
      
      // 添加等待签名的消息
      const pendingMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `⏳ **请在 MetaMask 中确认交易**\n\n正在向 ${selectedItems.length} 个项目发起批量捐赠...\n总金额: ${totalAmount} MON\n\n请在弹出的 MetaMask 窗口中签名确认。`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, pendingMessage])
      
      // 调用 BatchDonate 合约的 batchDonate 函数
      writeContract({
        address: CONTRACT_ADDRESSES.batchDonate as `0x${string}`,
        abi: BatchDonateABI,
        functionName: 'batchDonate',
        args: [campaignIds, amounts],
        value: totalValue,
        chain: monadTestnet,
      })
    } catch (err) {
      console.error('捐赠失败:', err)
      setIsDonating(false)
      setTxError(err instanceof Error ? err.message : '交易失败')
    }
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

    // 检测是否是批量支持模式
    const isBatchMode = messageText.includes('批量') || 
                        messageText.includes('多个项目') || 
                        messageText.includes('同时支持') ||
                        messageText.includes('一起支持')

    // Update conversation history
    const newHistory = [...conversationHistory, { role: 'user' as const, content: messageText }]
    setConversationHistory(newHistory)

    // Call the actual AI API
    const response = await callAI(newHistory)
    
    // Update conversation history with assistant response
    setConversationHistory(prev => [...prev, { role: 'assistant' as const, content: response.message }])

    // Process the action to get UI data - 传入批量模式标志
    const processedAction = processAction(response.action, isConnected, isBatchMode)
    
    // 如果是批量模式，初始化选择列表
    if (isBatchMode && processedAction?.type === 'batch_select') {
      initBatchSelections(processedAction.data as Campaign[])
    }

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
        <div className={`fixed z-50 transition-all duration-300 ${isMinimized ? 'bottom-6 right-6 w-72' : 'bottom-6 right-6 w-[66vw] h-[66vh] max-w-5xl max-h-[80vh]'}`}>
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
                                                <input
                                                  type="number"
                                                  value={selection?.amount || 10}
                                                  onChange={(e) => updateBatchAmount(campaign.id, Math.max(1, parseInt(e.target.value) || 1))}
                                                  className="w-16 h-6 text-xs text-center text-[#C4866B] font-medium bg-white border border-[#E8E2D9] rounded focus:border-[#C4866B] focus:outline-none"
                                                  min="1"
                                                />
                                                <button onClick={() => updateBatchAmount(campaign.id, (selection?.amount || 10) + 5)} className="w-5 h-5 rounded bg-[#E8E2D9] hover:bg-[#D4C8BC] flex items-center justify-center">
                                                  <Plus className="w-3 h-3 text-[#5D4E47]" />
                                                </button>
                                              </div>
                                              <span className="text-[10px] text-[#B8A99A]">MON</span>
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
                                  <div className="flex justify-between text-[10px] text-[#B8A99A] mt-1">
                                    <span>链上实际金额</span>
                                    <span>{(totalAmount / 1000).toFixed(4)} MON (测试模式)</span>
                                  </div>
                                </div>
                                
                                {/* 交易状态 */}
                                {writeTxHash && isDonating && (
                                  <div className="p-2 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2 text-xs text-blue-600">
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      <span>交易确认中...</span>
                                    </div>
                                    <a 
                                      href={`https://testnet.monadexplorer.com/tx/${writeTxHash}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] text-blue-500 hover:underline flex items-center gap-1 mt-1"
                                    >
                                      查看交易 <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                )}
                                
                                {/* 错误提示 */}
                                {txError && (
                                  <div className="p-2 bg-red-50 rounded-lg">
                                    <div className="text-xs text-red-600">{txError}</div>
                                  </div>
                                )}
                                
                                <p className="text-[10px] text-[#B8A99A] text-center">
                                  {isDonating ? '请在 MetaMask 中确认交易' : `利用 Monad 并行执行，${selectedCount} 笔交易将同时完成`}
                                </p>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => { setShowBatchConfirm(false); setTxError(null); resetWrite(); }} className="flex-1 border-[#E8E2D9] text-[#5D4E47] h-8 rounded-full" disabled={isDonating}>返回</Button>
                                  <Button size="sm" onClick={executeBatchDonation} disabled={isDonating || !isConnected} className="flex-1 btn-warm h-8 rounded-full">
                                    {isDonating ? (
                                      <><Loader2 className="w-3 h-3 mr-1 animate-spin" />{isWritePending ? '等待签名...' : '确认中...'}</>
                                    ) : (
                                      <><Heart className="w-3 h-3 mr-1" fill="white" />确认支持</>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            {message.action.type === 'track_donations' && (
                              <div className="p-3 bg-white rounded-xl border border-[#E8E2D9]">
                                <div className="text-xs text-[#8A7B73] mb-2">
                                  捐赠记录已在链上生成，请前往「我的捐赠」查看真实数据。
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => window.location.href = '/dashboard/donor'}
                                  className="w-full btn-warm rounded-full"
                                >
                                  查看我的捐赠记录
                                </Button>
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
