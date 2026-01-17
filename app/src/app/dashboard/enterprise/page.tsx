'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { parseEther } from 'viem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Briefcase,
  CheckCircle,
  ExternalLink,
  Heart,
  Loader2,
  Minus,
  Plus,
  RefreshCw,
} from 'lucide-react'
import { mockCampaigns, formatAmount, getCategoryStyle } from '@/lib/mock-data'
import { BatchDonateABI } from '@/lib/contracts'
import { CONTRACT_ADDRESSES, monadTestnet } from '@/lib/web3'

interface EnterpriseSelection {
  campaignId: string
  selected: boolean
  amount: number
}

export default function EnterpriseDashboardPage() {
  const { address, isConnected } = useAccount()
  const [selections, setSelections] = useState<EnterpriseSelection[]>(
    mockCampaigns.map((campaign) => ({
      campaignId: campaign.id,
      selected: false,
      amount: 10,
    }))
  )
  const [isEnterprise, setIsEnterprise] = useState(true)
  const [paymentRequirement, setPaymentRequirement] = useState<{
    serviceId: string
    price: string
    amountWei: string
    recipient: string
  } | null>(null)
  const [paymentTxHash, setPaymentTxHash] = useState<`0x${string}` | undefined>()
  const [isPaymentVerified, setIsPaymentVerified] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const selectedItems = useMemo(() => selections.filter((s) => s.selected), [selections])
  const totalAmount = useMemo(
    () => selectedItems.reduce((sum, s) => sum + s.amount, 0),
    [selectedItems]
  )

  const { writeContract, data: donateTxHash, isPending: isDonatePending, error: donateError } = useWriteContract()
  const { sendTransaction, data: feeTxHash, error: feeError } = useSendTransaction()

  const { isLoading: isDonateConfirming, isSuccess: isDonateSuccess } = useWaitForTransactionReceipt({
    hash: donateTxHash,
  })
  const { isLoading: isFeeConfirming, isSuccess: isFeeSuccess } = useWaitForTransactionReceipt({
    hash: feeTxHash,
  })

  useEffect(() => {
    if (!isEnterprise) {
      setPaymentRequirement(null)
      setPaymentTxHash(undefined)
      setIsPaymentVerified(false)
    }
  }, [isEnterprise])

  useEffect(() => {
    if (feeError) {
      setErrorMessage(feeError.message || '服务费支付失败')
    }
  }, [feeError])

  useEffect(() => {
    if (donateError) {
      setErrorMessage(donateError.message || '捐赠交易失败')
    }
  }, [donateError])

  useEffect(() => {
    if (isFeeSuccess && feeTxHash) {
      setPaymentTxHash(feeTxHash)
    }
  }, [isFeeSuccess, feeTxHash])

  useEffect(() => {
    if (paymentTxHash && !isPaymentVerified) {
      verifyEnterprisePayment(paymentTxHash).catch((err) => {
        setErrorMessage(err.message || '服务费验证失败')
      })
    }
  }, [paymentTxHash, isPaymentVerified])

  useEffect(() => {
    if (isDonateSuccess && donateTxHash) {
      setStatusMessage('✅ 捐赠成功！链上已确认')
    }
  }, [isDonateSuccess, donateTxHash])

  const toggleSelection = (campaignId: string) => {
    setSelections((prev) =>
      prev.map((s) => (s.campaignId === campaignId ? { ...s, selected: !s.selected } : s))
    )
  }

  const updateAmount = (campaignId: string, amount: number) => {
    setSelections((prev) =>
      prev.map((s) => (s.campaignId === campaignId ? { ...s, amount: Math.max(1, amount) } : s))
    )
  }

  const requestEnterprisePayment = async () => {
    const payload = {
      donations: selectedItems.map((s) => ({ campaignId: s.campaignId, amount: s.amount })),
      payer: address,
    }

    const response = await fetch('/api/enterprise/batch-donate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (response.status === 402) {
      const data = await response.json()
      setPaymentRequirement(data.payment)
      setStatusMessage('已生成服务费报价，请支付服务费')
      return
    }

    if (!response.ok) {
      throw new Error('企业捐赠付费请求失败')
    }
  }

  const verifyEnterprisePayment = async (hash: `0x${string}`) => {
    const response = await fetch('/api/enterprise/batch-donate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Payment-Id': hash,
      },
      body: JSON.stringify({ payer: address }),
    })

    if (!response.ok) {
      throw new Error('服务费验证失败')
    }

    const result = await response.json()
    if (result.ok) {
      setIsPaymentVerified(true)
      setStatusMessage('服务费已验证，可以继续捐赠')
    }
  }

  const executeBatchDonate = async () => {
    const campaignIds = selectedItems.map((s) => BigInt(parseInt(s.campaignId) || 1))
    const amounts = selectedItems.map((s) => parseEther((s.amount / 1000).toString()))
    const totalValue = amounts.reduce((sum, a) => sum + a, BigInt(0))

    writeContract({
      address: CONTRACT_ADDRESSES.batchDonate as `0x${string}`,
      abi: BatchDonateABI,
      functionName: 'batchDonate',
      args: [campaignIds, amounts],
      value: totalValue,
      chainId: monadTestnet.id,
    })
  }

  const handleEnterpriseDonate = async () => {
    setErrorMessage(null)
    setStatusMessage(null)

    if (!isConnected || !address) {
      setErrorMessage('请先连接钱包')
      return
    }

    if (selectedItems.length === 0) {
      setErrorMessage('请至少选择一个项目')
      return
    }

    if (isEnterprise) {
      if (!paymentRequirement) {
        await requestEnterprisePayment()
        return
      }

      if (!isPaymentVerified) {
        sendTransaction({
          to: paymentRequirement.recipient as `0x${string}`,
          value: BigInt(paymentRequirement.amountWei),
          chainId: monadTestnet.id,
        })
        return
      }
    }

    await executeBatchDonate()
  }

  const isBusy = isDonatePending || isDonateConfirming || isFeeConfirming

  return (
    <div className="min-h-screen py-10 hero-pattern">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Badge className="mb-3 px-4 py-2 badge-terracotta">
            <Briefcase className="w-3 h-3 mr-1" />
            企业捐赠方案
          </Badge>
          <h1 className="text-3xl font-bold text-[#3D3D3D] mb-2">企业批量捐赠</h1>
          <p className="text-[#8A7B73]">
            企业用户使用 x402 模式按需付费，完成批量捐赠。
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="warm-card card-shadow">
              <CardHeader>
                <CardTitle className="text-[#3D3D3D] flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#C4866B]" />
                  选择捐赠项目
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockCampaigns.map((campaign) => {
                  const selection = selections.find((s) => s.campaignId === campaign.id)
                  const isSelected = selection?.selected || false
                  const style = getCategoryStyle(campaign.category)
                  return (
                    <div
                      key={campaign.id}
                      className={`p-4 rounded-xl border transition-all ${isSelected ? 'border-[#C4866B]/40 bg-[#C4866B]/5' : 'border-[#E8E2D9] bg-white'}`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleSelection(campaign.id)}
                          className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${isSelected ? 'bg-[#C4866B] border-[#C4866B]' : 'border-[#D4C8BC] hover:border-[#C4866B]'}`}
                        >
                          {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[#3D3D3D] text-sm font-medium">{campaign.title}</span>
                            <Badge className={`${style.bg} ${style.text} text-xs`}>{campaign.category}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="w-7 h-7"
                              onClick={() => updateAmount(campaign.id, (selection?.amount || 10) - 5)}
                              disabled={!isSelected}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Input
                              type="number"
                              value={selection?.amount || 10}
                              onChange={(e) => updateAmount(campaign.id, parseInt(e.target.value) || 1)}
                              className="w-24 text-center"
                              disabled={!isSelected}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="w-7 h-7"
                              onClick={() => updateAmount(campaign.id, (selection?.amount || 10) + 5)}
                              disabled={!isSelected}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <span className="text-xs text-[#8A7B6E]">MON</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="warm-card card-shadow">
              <CardHeader>
                <CardTitle className="text-[#3D3D3D] text-lg">企业捐赠确认</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#8A7B6E]">已选项目</span>
                  <span className="text-[#3D3D3D] font-medium">{selectedItems.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#8A7B6E]">总计金额</span>
                  <span className="text-[#C4866B] font-semibold">{totalAmount} MON</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#8A7B6E]">
                  <span>链上实际金额</span>
                  <span>{(totalAmount / 1000).toFixed(4)} MON (测试模式)</span>
                </div>

                <div className="flex items-center justify-between text-xs text-[#8A7B6E]">
                  <span>企业捐赠方案（x402）</span>
                  <button
                    type="button"
                    onClick={() => setIsEnterprise(!isEnterprise)}
                    className={`w-9 h-5 rounded-full transition-colors ${isEnterprise ? 'bg-[#C4866B]' : 'bg-[#E8E2D9]'}`}
                  >
                    <span className={`block w-4 h-4 bg-white rounded-full transition-transform ${isEnterprise ? 'translate-x-4' : 'translate-x-1'}`} />
                  </button>
                </div>

                {paymentRequirement && (
                  <div className="text-xs text-[#5D4E47] bg-white rounded-lg p-2 border border-[#E8E2D9]">
                    服务费：{paymentRequirement.price}
                  </div>
                )}

                {statusMessage && (
                  <div className="text-xs text-[#7BA089] bg-[#7BA089]/10 p-2 rounded-lg border border-[#7BA089]/20">
                    {statusMessage}
                  </div>
                )}

                {errorMessage && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                    {errorMessage}
                  </div>
                )}

                <Button
                  onClick={handleEnterpriseDonate}
                  disabled={isBusy}
                  className="w-full btn-warm rounded-full"
                >
                  {isBusy ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />处理中...</>
                  ) : (
                    <>
                      {isEnterprise && !isPaymentVerified ? '支付服务费' : '确认捐赠'}
                    </>
                  )}
                </Button>

                {(donateTxHash || feeTxHash) && (
                  <Link
                    href={`https://testnet.monadexplorer.com/tx/${donateTxHash || feeTxHash}`}
                    target="_blank"
                    className="text-xs text-[#8A7B6E] flex items-center gap-1 justify-center hover:text-[#C4866B]"
                  >
                    查看链上交易 <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
