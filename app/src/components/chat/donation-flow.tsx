'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Heart,
  Check,
  X,
  Plus,
  Minus,
  Wallet,
  Loader2,
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { parseEther, formatEther } from 'viem'
import { mockCampaigns, formatAmount, type Campaign } from '@/lib/mock-data'
import { BatchDonateABI } from '@/lib/contracts'
import { CONTRACT_ADDRESSES, monadTestnet } from '@/lib/web3'

interface DonationItem {
  campaign: Campaign
  amount: number
}

interface DonationFlowProps {
  onClose: () => void
  onComplete: (donations: DonationItem[]) => void
  initialCampaigns?: Campaign[]
}

export function DonationFlow({ onClose, onComplete, initialCampaigns }: DonationFlowProps) {
  const { isConnected, address } = useAccount()
  const [step, setStep] = useState<'select' | 'amount' | 'confirm' | 'success'>('select')
  const [selectedCampaigns, setSelectedCampaigns] = useState<Campaign[]>(initialCampaigns || [])
  const [donations, setDonations] = useState<DonationItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [splitMode, setSplitMode] = useState(false)
  const [totalAmount, setTotalAmount] = useState('')
  const [txError, setTxError] = useState<string | null>(null)
  
  // 使用 wagmi hooks 进行合约交互
  const { writeContract, data: txHash, isPending, error: writeError, reset } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })
  
  // 监听交易成功
  useEffect(() => {
    if (txSuccess && txHash) {
      setIsProcessing(false)
      setStep('success')
      onComplete(donations)
      
      console.log('✅ 批量捐赠成功！', {
        交易哈希: txHash,
        捐赠数量: donations.length,
        提示: '前往 /dashboard/donor 查看链上记录'
      })
    }
  }, [txSuccess, txHash, donations, onComplete])
  
  // 监听交易错误
  useEffect(() => {
    if (writeError) {
      setIsProcessing(false)
      setTxError(writeError.message || '交易失败，请重试')
      console.error('捐赠失败:', writeError)
    }
  }, [writeError])
  
  // 更新处理状态
  useEffect(() => {
    setIsProcessing(isPending || isConfirming)
  }, [isPending, isConfirming])

  // Toggle campaign selection
  const toggleCampaign = (campaign: Campaign) => {
    if (selectedCampaigns.find(c => c.id === campaign.id)) {
      setSelectedCampaigns(selectedCampaigns.filter(c => c.id !== campaign.id))
    } else {
      if (selectedCampaigns.length < 5) {
        setSelectedCampaigns([...selectedCampaigns, campaign])
      }
    }
  }

  // Update individual donation amount
  const updateDonationAmount = (campaignId: string, amount: number) => {
    setDonations(donations.map(d => 
      d.campaign.id === campaignId ? { ...d, amount } : d
    ))
  }

  // Calculate total
  const total = donations.reduce((sum, d) => sum + d.amount, 0)

  // Proceed to amount step
  const proceedToAmount = () => {
    if (selectedCampaigns.length === 0) return
    
    // Initialize donations with default amounts
    const initialDonations = selectedCampaigns.map(campaign => ({
      campaign,
      amount: 10, // Default 10 MON per campaign
    }))
    setDonations(initialDonations)
    setStep('amount')
  }

  // Apply split mode
  const applySplitAmount = () => {
    const amount = parseFloat(totalAmount)
    if (isNaN(amount) || amount <= 0) return
    
    const perCampaign = Math.floor(amount / donations.length)
    const remainder = amount - (perCampaign * donations.length)
    
    setDonations(donations.map((d, i) => ({
      ...d,
      amount: i === 0 ? perCampaign + remainder : perCampaign
    })))
  }

  // Execute real blockchain donation
  const executeDonation = async () => {
    setIsProcessing(true)
    setTxError(null)
    reset() // 重置之前的交易状态
    
    try {
      // 从 campaign id 提取数字 ID (例如 "campaign-1" -> 1)
      const campaignIds = donations.map(d => {
        const idStr = d.campaign.id.replace('campaign-', '')
        return BigInt(parseInt(idStr) || 1) // 默认为 1 如果解析失败
      })
      
      // 将 MON 金额转换为 wei (1 MON = 10^18 wei)
      // 注意：这里使用小额测试，将金额除以 1000 以节省测试币
      const amounts = donations.map(d => parseEther((d.amount / 1000).toString()))
      
      // 计算总金额
      const totalValue = amounts.reduce((sum, a) => sum + a, BigInt(0))
      
      console.log('📤 发起批量捐赠（将被记录到链上）:', {
        钱包地址: address,
        合约地址: CONTRACT_ADDRESSES.batchDonate,
        项目数量: campaignIds.length,
        项目IDs: campaignIds.map(id => id.toString()),
        各项金额Wei: amounts.map(a => a.toString()),
        各项金额MON: amounts.map(a => (Number(formatEther(a)) * 1000).toFixed(2)),
        总金额Wei: totalValue.toString(),
        总金额MON: (Number(formatEther(totalValue)) * 1000).toFixed(2),
      })
      
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
      setIsProcessing(false)
      setTxError(err instanceof Error ? err.message : '交易失败，请重试')
    }
  }

  // Render based on step
  if (!isConnected) {
    return (
      <Card className="bg-slate-800/50 border-emerald-500/20">
        <CardContent className="py-8 text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-slate-600" />
          <h3 className="text-white font-semibold mb-2">连接钱包开始捐赠</h3>
          <p className="text-sm text-slate-400 mb-4">
            连接你的钱包，一次性支持多个公益项目
          </p>
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <Button
                onClick={openConnectModal}
                className="bg-gradient-to-r from-emerald-500 to-teal-500"
              >
                连接钱包
              </Button>
            )}
          </ConnectButton.Custom>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {['选择项目', '设置金额', '确认捐赠'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              i < ['select', 'amount', 'confirm'].indexOf(step) 
                ? 'bg-emerald-500 text-white'
                : i === ['select', 'amount', 'confirm'].indexOf(step)
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500'
                : 'bg-slate-700 text-slate-500'
            }`}>
              {i < ['select', 'amount', 'confirm'].indexOf(step) ? <Check className="w-3 h-3" /> : i + 1}
            </div>
            {i < 2 && <div className="w-8 h-0.5 bg-slate-700" />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Campaigns */}
      {step === 'select' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">选择要支持的项目</h3>
            <Badge className="bg-emerald-500/10 text-emerald-400">
              已选 {selectedCampaigns.length}/5
            </Badge>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {mockCampaigns.map(campaign => {
              const isSelected = selectedCampaigns.find(c => c.id === campaign.id)
              const progress = Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)
              
              return (
                <div
                  key={campaign.id}
                  onClick={() => toggleCampaign(campaign)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-emerald-500/20 border border-emerald-500/50' 
                      : 'bg-slate-800/50 border border-transparent hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center ${
                      isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white text-sm font-medium truncate">{campaign.title}</span>
                        <Badge className="bg-slate-700 text-slate-300 text-xs flex-shrink-0">
                          {campaign.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="h-1 flex-1 bg-slate-700" />
                        <span className="text-xs text-slate-400">{progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-700 text-slate-400"
            >
              取消
            </Button>
            <Button
              onClick={proceedToAmount}
              disabled={selectedCampaigns.length === 0}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
            >
              下一步
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Set Amounts */}
      {step === 'amount' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">设置捐赠金额</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSplitMode(!splitMode)}
              className={`text-xs ${splitMode ? 'text-emerald-400' : 'text-slate-400'}`}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              平均分配
            </Button>
          </div>
          
          {/* Split mode input */}
          {splitMode && (
            <div className="flex gap-2 p-3 bg-emerald-500/10 rounded-lg">
              <Input
                type="number"
                placeholder="输入总金额"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <Button onClick={applySplitAmount} size="sm" className="bg-emerald-500">
                分配
              </Button>
            </div>
          )}
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {donations.map(donation => (
              <div
                key={donation.campaign.id}
                className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-white text-sm truncate block">
                    {donation.campaign.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-7 h-7 border-slate-700"
                    onClick={() => updateDonationAmount(
                      donation.campaign.id, 
                      Math.max(1, donation.amount - 10)
                    )}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Input
                    type="number"
                    value={donation.amount}
                    onChange={(e) => updateDonationAmount(
                      donation.campaign.id, 
                      Math.max(1, parseInt(e.target.value) || 0)
                    )}
                    className="w-20 text-center bg-slate-800 border-slate-700 text-white"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-7 h-7 border-slate-700"
                    onClick={() => updateDonationAmount(
                      donation.campaign.id, 
                      donation.amount + 10
                    )}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-3 bg-emerald-500/10 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">总计</span>
              <span className="text-emerald-400 font-bold text-lg">{total} MON</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStep('select')}
              className="flex-1 border-slate-700 text-slate-400"
            >
              返回
            </Button>
            <Button
              onClick={() => setStep('confirm')}
              disabled={total <= 0}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
            >
              确认金额
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && (
        <div className="space-y-3">
          <h3 className="text-white font-medium text-center">确认捐赠</h3>
          
          <div className="p-4 bg-slate-800/50 rounded-lg space-y-2">
            {donations.map(donation => (
              <div key={donation.campaign.id} className="flex justify-between text-sm">
                <span className="text-slate-400 truncate max-w-[60%]">
                  {donation.campaign.title}
                </span>
                <span className="text-white">{donation.amount} MON</span>
              </div>
            ))}
            <div className="border-t border-slate-700 pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-white">总计</span>
                <span className="text-emerald-400">{total} MON</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>实际链上金额</span>
                <span>{(total / 1000).toFixed(4)} MON (测试模式)</span>
              </div>
            </div>
          </div>
          
          {/* 交易状态显示 */}
          {txHash && (
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>交易已提交，等待确认...</span>
              </div>
              <a 
                href={`https://testnet.monadexplorer.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline flex items-center gap-1 mt-1"
              >
                查看交易 <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
          
          {/* 错误显示 */}
          {txError && (
            <div className="p-3 bg-red-500/10 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>{txError}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setTxError(null)}
                className="text-xs text-red-400 mt-1"
              >
                关闭
              </Button>
            </div>
          )}
          
          <p className="text-xs text-slate-500 text-center">
            点击确认后，将通过 Monad 区块链一次性完成 {donations.length} 笔捐赠
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => { setStep('amount'); setTxError(null); reset(); }}
              disabled={isProcessing}
              className="flex-1 border-slate-700 text-slate-400"
            >
              返回
            </Button>
            <Button
              onClick={executeDonation}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isPending ? '等待签名...' : '确认中...'}
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" fill="white" />
                  确认捐赠 {total} MON
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 'success' && (
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">捐赠成功！🎉</h3>
          <p className="text-slate-400 mb-4">
            你已成功向 {donations.length} 个项目捐赠 {total} MON
          </p>
          <div className="p-3 bg-slate-800/50 rounded-lg text-left space-y-1">
            {donations.map(d => (
              <div key={d.campaign.id} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">{d.campaign.title}</span>
                <span className="text-slate-500 ml-auto">{d.amount} MON</span>
              </div>
            ))}
          </div>
          
          {/* 交易链接 */}
          {txHash && (
            <a 
              href={`https://testnet.monadexplorer.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:underline mt-3"
            >
              <ExternalLink className="w-4 h-4" />
              在 Monad Explorer 查看交易
            </a>
          )}
          
          <p className="text-xs text-slate-500 mt-3">
            交易已记录在 Monad 区块链上
          </p>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              关闭
            </Button>
            <Button
              onClick={() => {
                onClose()
                window.location.href = '/dashboard/donor'
              }}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
            >
              查看记录
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
