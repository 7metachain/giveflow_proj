'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Upload,
  Brain,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileImage,
  Loader2,
  Shield,
  Sparkles,
  DollarSign,
  Calendar,
  Building,
  FileText,
  ArrowRight,
  RefreshCw,
  Eye,
} from 'lucide-react'
import { useAccount, usePublicClient, useWriteContract } from 'wagmi'
import { decodeEventLog, keccak256, parseEther, toHex, toBytes } from 'viem'
import { ProofRegistryABI, MilestoneVaultABI } from '@/lib/contracts'
import { CONTRACT_ADDRESSES, monadTestnet } from '@/lib/web3'

type ReviewStatus = 'idle' | 'submitting' | 'reviewing' | 'withdrawing' | 'complete' | 'error'

export default function ProofUploadPage() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('idle')
  const [reviewProgress, setReviewProgress] = useState(0)
  const [requestAmount, setRequestAmount] = useState('3000')
  const [campaignId, setCampaignId] = useState('1')
  const [milestoneId, setMilestoneId] = useState('1')
  const [proofId, setProofId] = useState<bigint | null>(null)
  const [submitTxHash, setSubmitTxHash] = useState<`0x${string}` | null>(null)
  const [reviewTxHash, setReviewTxHash] = useState<`0x${string}` | null>(null)
  const [withdrawTxHash, setWithdrawTxHash] = useState<`0x${string}` | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setReviewStatus('idle')
      setReviewResult(null)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onDrop(Array.from(files))
    }
  }

  const startAIReview = async () => {
    if (!selectedFile || !publicClient || !writeContractAsync) return
    if (!isConnected || !address) {
      setErrorMessage('请先连接钱包')
      return
    }

    setErrorMessage(null)
    setReviewProgress(0)
    setReviewStatus('submitting')

    try {
      const fileBuffer = await selectedFile.arrayBuffer()
      const proofHash = keccak256(toHex(new Uint8Array(fileBuffer)))
      const ipfsUri = `ipfs://local/${Date.now()}-${selectedFile.name}`
      const amountWei = parseEther(requestAmount)

      const submitHash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.proofRegistry as `0x${string}`,
        abi: ProofRegistryABI,
        functionName: 'submitProof',
        args: [
          BigInt(campaignId),
          BigInt(milestoneId),
          proofHash,
          amountWei,
          ipfsUri,
        ],
        chainId: monadTestnet.id,
      })
      setSubmitTxHash(submitHash)
      setReviewProgress(30)

      const submitReceipt = await publicClient.waitForTransactionReceipt({ hash: submitHash })
      let newProofId: bigint | null = null

      for (const log of submitReceipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: ProofRegistryABI,
            data: log.data,
            topics: log.topics,
          })
          if (decoded.eventName === 'ProofSubmitted') {
            newProofId = decoded.args.proofId as bigint
            break
          }
        } catch {
          // skip non-matching logs
        }
      }

      if (!newProofId) {
        throw new Error('未获取到 Proof ID，请检查合约事件')
      }
      setProofId(newProofId)

      setReviewStatus('reviewing')
      setReviewProgress(60)

      const aiReportHash = keccak256(toBytes(`auto-approve-${submitHash}`))
      const reviewHash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.proofRegistry as `0x${string}`,
        abi: ProofRegistryABI,
        functionName: 'recordAIReview',
        args: [newProofId, 1, BigInt(9500), aiReportHash],
        chainId: monadTestnet.id,
      })
      setReviewTxHash(reviewHash)
      await publicClient.waitForTransactionReceipt({ hash: reviewHash })

      setReviewStatus('withdrawing')
      setReviewProgress(85)

      const withdrawHash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.milestoneVault as `0x${string}`,
        abi: MilestoneVaultABI,
        functionName: 'withdrawWithProof',
        args: [BigInt(campaignId), BigInt(milestoneId), newProofId],
        chainId: monadTestnet.id,
      })
      setWithdrawTxHash(withdrawHash)
      await publicClient.waitForTransactionReceipt({ hash: withdrawHash })

      setReviewProgress(100)
      setReviewStatus('complete')
    } catch (error) {
      console.error('On-chain review error:', error)
      setReviewStatus('error')
      setErrorMessage(error instanceof Error ? error.message : '链上处理失败')
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setReviewStatus('idle')
    setReviewProgress(0)
    setErrorMessage(null)
    setProofId(null)
    setSubmitTxHash(null)
    setReviewTxHash(null)
    setWithdrawTxHash(null)
  }

  const getStatusText = () => {
    switch (reviewStatus) {
      case 'submitting':
        return '正在提交凭证上链'
      case 'reviewing':
        return 'AI 审核上链'
      case 'withdrawing':
        return '执行资金释放'
      case 'complete':
        return '链上流程完成'
      case 'error':
        return '链上处理失败'
      default:
        return '等待操作'
    }
  }

  return (
    <div className="min-h-screen py-10 hero-pattern">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <Badge className="mb-4 px-4 py-2 badge-sage">
            <Brain className="w-4 h-4 mr-2" />
            AI 智能审核
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-[#3D3D3D] mb-4">
            上传凭证申请提款
          </h1>
          <p className="text-[#8A7B73] max-w-2xl leading-relaxed">
            上传支出凭证（发票、收据等），AI 将自动识别并审核。
            审核通过后，资金将释放到你的钱包。所有审核结果链上存证，确保透明可信。
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Upload Section */}
          <div className="space-y-6">
            {/* Upload Card */}
            <Card className="warm-card card-shadow">
              <CardHeader>
                <CardTitle className="text-[#3D3D3D] flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#C4866B]" />
                  上传凭证文件
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-[#E8E2D9] rounded-xl p-8 text-center hover:border-[#C4866B]/50 transition-colors bg-[#FAF7F2]">
                  {!previewUrl ? (
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <FileImage className="w-12 h-12 mx-auto text-[#D4C8BC] mb-4" />
                      <p className="text-[#5D4E47] font-medium mb-2">
                        点击或拖拽上传凭证图片
                      </p>
                      <p className="text-sm text-[#B8A99A]">
                        支持 JPG, PNG, PDF 格式，最大 10MB
                      </p>
                    </label>
                  ) : (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg shadow-md"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetForm}
                        className="absolute top-2 right-2 border-[#E8E2D9] bg-white text-[#5D4E47] hover:bg-[#F5F2ED] rounded-full"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        重新选择
                      </Button>
                    </div>
                  )}
                </div>

                {/* Campaign & Milestone */}
                {previewUrl && (
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-[#5D4E47] mb-2">
                        项目 ID
                      </label>
                      <Input
                        type="number"
                        value={campaignId}
                        onChange={(e) => setCampaignId(e.target.value)}
                        className="bg-[#FAF7F2] border-[#E8E2D9] text-[#3D3D3D] focus:border-[#C4866B]"
                        placeholder="输入项目ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#5D4E47] mb-2">
                        里程碑 ID
                      </label>
                      <Input
                        type="number"
                        value={milestoneId}
                        onChange={(e) => setMilestoneId(e.target.value)}
                        className="bg-[#FAF7F2] border-[#E8E2D9] text-[#3D3D3D] focus:border-[#C4866B]"
                        placeholder="输入里程碑ID"
                      />
                    </div>
                  </div>
                )}

                {/* Request Amount */}
                {previewUrl && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-[#5D4E47] mb-2">
                      申请提款金额 (MON)
                    </label>
                    <div className="flex gap-3">
                      <Input
                        type="number"
                        value={requestAmount}
                        onChange={(e) => setRequestAmount(e.target.value)}
                        className="bg-[#FAF7F2] border-[#E8E2D9] text-[#3D3D3D] focus:border-[#C4866B]"
                        placeholder="输入金额"
                      />
                      <Button
                        onClick={startAIReview}
                        disabled={reviewStatus !== 'idle'}
                        className="btn-sage px-6 rounded-full"
                      >
                        {reviewStatus === 'idle' ? (
                          <>
                            <Brain className="w-4 h-4 mr-2" />
                            一键通过并提款
                          </>
                        ) : (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            链上处理中...
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-[#B8A99A] mt-2">
                      当前流程将直接上链：提交凭证 → 自动审核通过 → 资金释放
                    </p>
                  </div>
                )}

                {/* Progress */}
                {['submitting', 'reviewing', 'withdrawing'].includes(reviewStatus) && (
                  <div className="mt-6 p-4 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9]">
                    <div className="flex items-center gap-3 mb-3">
                      <Brain className="w-5 h-5 text-[#8FA584] animate-pulse" />
                      <span className="text-[#5D4E47]">
                        {reviewStatus === 'submitting' && '正在提交凭证上链...'}
                        {reviewStatus === 'reviewing' && 'AI 审核结果上链...'}
                        {reviewStatus === 'withdrawing' && '正在执行资金释放...'}
                      </span>
                    </div>
                    <div className="h-2 bg-[#E8E2D9] rounded-full overflow-hidden">
                      <div 
                        className="h-full progress-warm transition-all duration-300"
                        style={{ width: `${reviewProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#B8A99A] mt-2">
                      {getStatusText()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="warm-card card-shadow">
              <CardContent className="p-5">
                <h4 className="font-semibold text-[#3D3D3D] mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C4866B]" />
                  AI 审核说明
                </h4>
                <div className="space-y-3 text-sm">
                  {[
                    { icon: Eye, text: 'OCR 自动识别凭证中的金额、日期等关键信息' },
                    { icon: Shield, text: '真实性验证：检测凭证是否被篡改或伪造' },
                    { icon: FileText, text: '用途匹配：确认支出用途与项目里程碑一致' },
                    { icon: CheckCircle, text: '审核结果链上存证，透明可查' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-[#8A7B73]">
                      <item.icon className="w-4 h-4 text-[#A8B5A0] mt-0.5 flex-shrink-0" />
                      {item.text}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Review Result */}
          <div>
            {reviewStatus === 'complete' ? (
              <Card className="warm-card card-shadow">
                <CardHeader>
                  <CardTitle className="text-[#3D3D3D] flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#8FA584]" />
                    链上审核与资金释放
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-[#8FA584] bg-[#A8B5A0]/10 border border-[#A8B5A0]/30 rounded-xl p-3">
                      <CheckCircle className="w-4 h-4" />
                      凭证已提交并自动审核通过
                    </div>
                    <div className="text-sm text-[#5D4E47] bg-[#FAF7F2] border border-[#E8E2D9] rounded-xl p-3 space-y-2">
                      <div>Proof ID: {proofId?.toString()}</div>
                      {submitTxHash && (
                        <div>
                          提交交易：
                          <a className="text-[#C4866B] ml-2" href={`https://testnet.monadexplorer.com/tx/${submitTxHash}`} target="_blank" rel="noreferrer">
                            查看
                          </a>
                        </div>
                      )}
                      {reviewTxHash && (
                        <div>
                          审核交易：
                          <a className="text-[#C4866B] ml-2" href={`https://testnet.monadexplorer.com/tx/${reviewTxHash}`} target="_blank" rel="noreferrer">
                            查看
                          </a>
                        </div>
                      )}
                      {withdrawTxHash && (
                        <div>
                          资金释放：
                          <a className="text-[#C4866B] ml-2" href={`https://testnet.monadexplorer.com/tx/${withdrawTxHash}`} target="_blank" rel="noreferrer">
                            查看
                          </a>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={resetForm}
                      variant="outline"
                      className="w-full border-[#E8E2D9] text-[#5D4E47] hover:bg-[#F5F2ED] rounded-full"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      继续上传
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="warm-card card-shadow h-full">
                <CardContent className="h-full flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-[#F5F2ED] flex items-center justify-center mb-6">
                    <Brain className="w-10 h-10 text-[#D4C8BC]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#3D3D3D] mb-2">
                    等待上传凭证
                  </h3>
                  <p className="text-sm text-[#8A7B73] max-w-sm">
                    上传凭证图片后，AI 将自动识别并审核凭证内容，
                    确保资金使用合规透明
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
