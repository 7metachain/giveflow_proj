'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { mockCampaigns, formatAmount, type Campaign } from '@/lib/mock-data'

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
  const { isConnected } = useAccount()
  const [step, setStep] = useState<'select' | 'amount' | 'confirm' | 'success'>('select')
  const [selectedCampaigns, setSelectedCampaigns] = useState<Campaign[]>(initialCampaigns || [])
  const [donations, setDonations] = useState<DonationItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [splitMode, setSplitMode] = useState(false)
  const [totalAmount, setTotalAmount] = useState('')

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

  // Execute donation
  const executeDonation = async () => {
    setIsProcessing(true)
    
    // Simulate blockchain transaction
    await new Promise(r => setTimeout(r, 2000))
    
    setIsProcessing(false)
    setStep('success')
    onComplete(donations)
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
              <span className="text-emerald-400 font-bold text-lg">${total}</span>
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
                <span className="text-white">${donation.amount}</span>
              </div>
            ))}
            <div className="border-t border-slate-700 pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-white">总计</span>
                <span className="text-emerald-400">${total}</span>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 text-center">
            点击确认后，将通过 Monad 区块链一次性完成 {donations.length} 笔捐赠
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setStep('amount')}
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
                  处理中...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" fill="white" />
                  确认捐赠 ${total}
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
            你已成功向 {donations.length} 个项目捐赠 ${total}
          </p>
          <div className="p-3 bg-slate-800/50 rounded-lg text-left space-y-1">
            {donations.map(d => (
              <div key={d.campaign.id} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">{d.campaign.title}</span>
                <span className="text-slate-500 ml-auto">${d.amount}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3">
            交易已记录在 Monad 区块链上，可在"我的捐赠"中查看
          </p>
          <Button
            onClick={onClose}
            className="mt-4 bg-emerald-500 hover:bg-emerald-600"
          >
            完成
          </Button>
        </div>
      )}
    </div>
  )
}
