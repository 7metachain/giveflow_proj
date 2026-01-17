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
import type { AIReviewResult } from '@/lib/mock-data'

type ReviewStatus = 'idle' | 'uploading' | 'analyzing' | 'complete'

export default function ProofUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('idle')
  const [reviewProgress, setReviewProgress] = useState(0)
  const [reviewResult, setReviewResult] = useState<AIReviewResult | null>(null)
  const [requestAmount, setRequestAmount] = useState('3000')

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
    if (!selectedFile) return

    setReviewStatus('uploading')
    setReviewProgress(0)

    for (let i = 0; i <= 30; i += 5) {
      await new Promise((r) => setTimeout(r, 100))
      setReviewProgress(i)
    }

    setReviewStatus('analyzing')

    const analysisSteps = [
      { progress: 40, delay: 500 },
      { progress: 55, delay: 700 },
      { progress: 70, delay: 600 },
      { progress: 85, delay: 800 },
      { progress: 95, delay: 500 },
      { progress: 100, delay: 300 },
    ]

    for (const step of analysisSteps) {
      await new Promise((r) => setTimeout(r, step.delay))
      setReviewProgress(step.progress)
    }

    const mockResult: AIReviewResult = {
      status: 'approved',
      confidence: 0.94,
      extracted: {
        amount: parseInt(requestAmount),
        date: '2026-01-15',
        recipient: '乡村医疗服务中心',
        purpose: '女性健康筛查物资采购',
      },
      checks: {
        amountMatch: true,
        dateValid: true,
        formatValid: true,
        authenticityScore: 0.92,
        purposeMatch: true,
      },
      reason:
        '凭证真实有效。OCR 识别金额与申请金额一致，日期在有效期内，收款方为认证机构，用途与项目里程碑描述匹配。建议批准该提款申请。',
    }

    setReviewResult(mockResult)
    setReviewStatus('complete')
  }

  const resetForm = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setReviewStatus('idle')
    setReviewProgress(0)
    setReviewResult(null)
  }

  const getStatusColor = (status: 'approved' | 'rejected' | 'manual_review') => {
    switch (status) {
      case 'approved':
        return 'text-[#8FA584]'
      case 'rejected':
        return 'text-[#C97065]'
      case 'manual_review':
        return 'text-[#C4866B]'
    }
  }

  const getStatusBadge = (status: 'approved' | 'rejected' | 'manual_review') => {
    switch (status) {
      case 'approved':
        return 'badge-sage'
      case 'rejected':
        return 'bg-[#C97065]/10 text-[#C97065] border-[#C97065]/20'
      case 'manual_review':
        return 'badge-terracotta'
    }
  }

  const getStatusIcon = (status: 'approved' | 'rejected' | 'manual_review') => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5" />
      case 'rejected':
        return <XCircle className="w-5 h-5" />
      case 'manual_review':
        return <AlertTriangle className="w-5 h-5" />
    }
  }

  const getStatusText = (status: 'approved' | 'rejected' | 'manual_review') => {
    switch (status) {
      case 'approved':
        return 'AI 审核通过'
      case 'rejected':
        return 'AI 审核未通过'
      case 'manual_review':
        return '需要人工复核'
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

                {/* Request Amount */}
                {previewUrl && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-[#5D4E47] mb-2">
                      申请提款金额 (USDC)
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
                            开始审核
                          </>
                        ) : (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            审核中...
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Progress */}
                {(reviewStatus === 'uploading' || reviewStatus === 'analyzing') && (
                  <div className="mt-6 p-4 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9]">
                    <div className="flex items-center gap-3 mb-3">
                      {reviewStatus === 'uploading' ? (
                        <>
                          <Upload className="w-5 h-5 text-[#C4866B] animate-pulse" />
                          <span className="text-[#5D4E47]">正在上传凭证...</span>
                        </>
                      ) : (
                        <>
                          <Brain className="w-5 h-5 text-[#8FA584] animate-pulse" />
                          <span className="text-[#5D4E47]">AI 正在智能分析...</span>
                        </>
                      )}
                    </div>
                    <div className="h-2 bg-[#E8E2D9] rounded-full overflow-hidden">
                      <div 
                        className="h-full progress-warm transition-all duration-300"
                        style={{ width: `${reviewProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#B8A99A] mt-2">
                      {reviewStatus === 'uploading' 
                        ? '正在安全上传文件...' 
                        : 'AI 正在识别金额、日期、用途等信息...'}
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
            {reviewStatus === 'complete' && reviewResult ? (
              <Card className="warm-card card-shadow">
                <CardHeader>
                  <CardTitle className="text-[#3D3D3D] flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#8FA584]" />
                    AI 审核结果
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status */}
                  <div className={`flex items-center gap-3 p-4 rounded-xl ${
                    reviewResult.status === 'approved' 
                      ? 'bg-[#A8B5A0]/10 border border-[#A8B5A0]/30' 
                      : reviewResult.status === 'rejected'
                      ? 'bg-[#C97065]/10 border border-[#C97065]/30'
                      : 'bg-[#C4866B]/10 border border-[#C4866B]/30'
                  }`}>
                    <div className={getStatusColor(reviewResult.status)}>
                      {getStatusIcon(reviewResult.status)}
                    </div>
                    <div>
                      <div className={`font-semibold ${getStatusColor(reviewResult.status)}`}>
                        {getStatusText(reviewResult.status)}
                      </div>
                      <div className="text-sm text-[#8A7B73]">
                        置信度: {(reviewResult.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Extracted Info */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-[#5D4E47]">识别信息</h5>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: DollarSign, label: '金额', value: `$${reviewResult.extracted.amount}` },
                        { icon: Calendar, label: '日期', value: reviewResult.extracted.date },
                        { icon: Building, label: '收款方', value: reviewResult.extracted.recipient },
                        { icon: FileText, label: '用途', value: reviewResult.extracted.purpose },
                      ].map((item, i) => (
                        <div key={i} className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9]">
                          <div className="flex items-center gap-2 text-xs text-[#B8A99A] mb-1">
                            <item.icon className="w-3 h-3" />
                            {item.label}
                          </div>
                          <div className="text-[#3D3D3D] font-medium truncate">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verification Checks */}
                  <div className="space-y-3">
                    <h5 className="font-medium text-[#5D4E47]">验证项目</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: '金额匹配', pass: reviewResult.checks.amountMatch },
                        { label: '日期有效', pass: reviewResult.checks.dateValid },
                        { label: '格式正确', pass: reviewResult.checks.formatValid },
                        { label: '用途匹配', pass: reviewResult.checks.purposeMatch },
                      ].map((check, i) => (
                        <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${check.pass ? 'bg-[#A8B5A0]/10' : 'bg-[#C97065]/10'}`}>
                          {check.pass ? (
                            <CheckCircle className="w-4 h-4 text-[#8FA584]" />
                          ) : (
                            <XCircle className="w-4 h-4 text-[#C97065]" />
                          )}
                          <span className="text-sm text-[#5D4E47]">{check.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9]">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-[#8A7B73]">真实性评分</span>
                        <span className="text-[#8FA584] font-medium">
                          {(reviewResult.checks.authenticityScore * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-[#E8E2D9] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#A8B5A0] to-[#8FA584]"
                          style={{ width: `${reviewResult.checks.authenticityScore * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* AI Reason */}
                  <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9]">
                    <div className="flex items-center gap-2 text-sm text-[#B8A99A] mb-2">
                      <Brain className="w-4 h-4" />
                      AI 审核意见
                    </div>
                    <p className="text-[#5D4E47] text-sm leading-relaxed">
                      {reviewResult.reason}
                    </p>
                  </div>

                  {/* Actions */}
                  {reviewResult.status === 'approved' && (
                    <div className="space-y-3">
                      <Button className="w-full btn-warm h-12 rounded-full text-base font-semibold">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        确认提款申请
                      </Button>
                      <p className="text-xs text-[#B8A99A] text-center">
                        提款申请将提交至链上，等待里程碑资金释放
                      </p>
                    </div>
                  )}

                  {reviewResult.status === 'rejected' && (
                    <Button
                      onClick={resetForm}
                      variant="outline"
                      className="w-full border-[#E8E2D9] text-[#5D4E47] hover:bg-[#F5F2ED] rounded-full"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      重新上传凭证
                    </Button>
                  )}
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
