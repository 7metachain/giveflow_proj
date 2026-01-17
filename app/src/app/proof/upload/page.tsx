'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
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
import { useDropzone } from 'react-dropzone'
import type { AIReviewResult } from '@/lib/mock-data'

// Install react-dropzone if not available - fallback to basic file input
function useSimpleDropzone(onDrop: (files: File[]) => void) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onDrop(Array.from(files))
    }
  }

  return {
    getRootProps: () => ({}),
    getInputProps: () => ({ type: 'file' as const, accept: 'image/*', onChange: handleChange }),
    isDragActive: false,
  }
}

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

  // Simple file handling without react-dropzone
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

    // Simulate upload progress
    for (let i = 0; i <= 30; i += 5) {
      await new Promise((r) => setTimeout(r, 100))
      setReviewProgress(i)
    }

    setReviewStatus('analyzing')

    // Simulate AI analysis with progress updates
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

    // Generate mock AI review result
    const mockResult: AIReviewResult = {
      status: 'approved',
      confidence: 0.94,
      extracted: {
        amount: parseInt(requestAmount),
        date: '2026-01-15',
        recipient: '乡村医疗服务中心',
        purpose: '医疗药品采购',
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
        return 'text-emerald-400'
      case 'rejected':
        return 'text-red-400'
      case 'manual_review':
        return 'text-yellow-400'
    }
  }

  const getStatusBg = (status: 'approved' | 'rejected' | 'manual_review') => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-500/20 border-emerald-500/30'
      case 'rejected':
        return 'bg-red-500/20 border-red-500/30'
      case 'manual_review':
        return 'bg-yellow-500/20 border-yellow-500/30'
    }
  }

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge className="mb-4 px-4 py-2 bg-teal-500/10 text-teal-400 border-teal-500/30">
            <Sparkles className="w-4 h-4 mr-2" />
            募捐者专用
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            上传凭证申请提款
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            上传支出凭证（发票、收据等），平台 AI 将自动识别并验证凭证真实性，
            审核通过后即可申请释放对应里程碑资金。捐赠者可实时查看审核结果。
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            {/* File Upload Card */}
            <Card className="bg-slate-900/50 border-emerald-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-emerald-400" />
                  上传凭证
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Dropzone */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                    previewUrl
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-slate-700 hover:border-emerald-500/30 hover:bg-slate-800/50'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-slate-400">
                        {selectedFile?.name}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          resetForm()
                        }}
                        className="border-slate-700 text-slate-400"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        更换文件
                      </Button>
                    </div>
                  ) : (
                    <>
                      <FileImage className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                      <p className="text-slate-400 mb-2">
                        点击或拖拽上传凭证图片
                      </p>
                      <p className="text-sm text-slate-500">
                        支持 JPG, PNG, PDF 格式
                      </p>
                    </>
                  )}
                </div>

                {/* Request Amount Input */}
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">
                    申请提取金额 (USDC)
                  </label>
                  <Input
                    type="number"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="输入金额"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={startAIReview}
                  disabled={!selectedFile || reviewStatus !== 'idle'}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-6"
                >
                  {reviewStatus === 'idle' ? (
                    <>
                      <Brain className="w-5 h-5 mr-2" />
                      开始 AI 审核
                    </>
                  ) : reviewStatus === 'uploading' ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      上传中...
                    </>
                  ) : reviewStatus === 'analyzing' ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      AI 分析中...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      审核完成
                    </>
                  )}
                </Button>

                {/* Progress Bar */}
                {(reviewStatus === 'uploading' ||
                  reviewStatus === 'analyzing') && (
                  <div className="space-y-2">
                    <Progress value={reviewProgress} className="h-2 bg-slate-800" />
                    <p className="text-sm text-center text-slate-400">
                      {reviewStatus === 'uploading'
                        ? '正在上传凭证...'
                        : 'GPT-4V 正在分析凭证...'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* How it works */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">工作原理</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: Upload, title: '上传凭证', desc: '支持发票、收据、合同等图片' },
                  { icon: Brain, title: 'AI 识别', desc: 'GPT-4V OCR 提取关键信息' },
                  { icon: Shield, title: '真伪验证', desc: '多维度验证凭证真实性' },
                  { icon: CheckCircle, title: '结果上链', desc: '审核结果永久存证' },
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{step.title}</div>
                      <div className="text-sm text-slate-400">{step.desc}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Result Section */}
          <div className="space-y-6">
            {/* AI Review Result */}
            <Card
              className={`bg-slate-900/50 transition-all ${
                reviewResult
                  ? getStatusBg(reviewResult.status)
                  : 'border-slate-700'
              }`}
            >
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-emerald-400" />
                  AI 审核结果
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviewResult ? (
                  <div className="space-y-6">
                    {/* Status Banner */}
                    <div
                      className={`flex items-center justify-between p-4 rounded-xl ${
                        reviewResult.status === 'approved'
                          ? 'bg-emerald-500/10'
                          : reviewResult.status === 'rejected'
                          ? 'bg-red-500/10'
                          : 'bg-yellow-500/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {reviewResult.status === 'approved' ? (
                          <CheckCircle className="w-10 h-10 text-emerald-400" />
                        ) : reviewResult.status === 'rejected' ? (
                          <XCircle className="w-10 h-10 text-red-400" />
                        ) : (
                          <AlertTriangle className="w-10 h-10 text-yellow-400" />
                        )}
                        <div>
                          <div
                            className={`text-2xl font-bold ${getStatusColor(
                              reviewResult.status
                            )}`}
                          >
                            {reviewResult.status === 'approved'
                              ? '审核通过'
                              : reviewResult.status === 'rejected'
                              ? '审核拒绝'
                              : '人工复核'}
                          </div>
                          <div className="text-sm text-slate-400">
                            置信度:{' '}
                            {(reviewResult.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={`${
                          reviewResult.status === 'approved'
                            ? 'bg-emerald-500'
                            : reviewResult.status === 'rejected'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                        } text-white border-0`}
                      >
                        {reviewResult.status === 'approved'
                          ? '可提款'
                          : '不可提款'}
                      </Badge>
                    </div>

                    {/* Extracted Info */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-3">
                        识别信息
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                            <DollarSign className="w-4 h-4" />
                            金额
                          </div>
                          <div className="text-white font-medium">
                            ${reviewResult.extracted.amount.toLocaleString()}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                            <Calendar className="w-4 h-4" />
                            日期
                          </div>
                          <div className="text-white font-medium">
                            {reviewResult.extracted.date}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                            <Building className="w-4 h-4" />
                            收款方
                          </div>
                          <div className="text-white font-medium truncate">
                            {reviewResult.extracted.recipient}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                            <FileText className="w-4 h-4" />
                            用途
                          </div>
                          <div className="text-white font-medium truncate">
                            {reviewResult.extracted.purpose}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Verification Checks */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-3">
                        验证项目
                      </h4>
                      <div className="space-y-2">
                        {[
                          {
                            label: '金额匹配',
                            pass: reviewResult.checks.amountMatch,
                          },
                          {
                            label: '日期有效',
                            pass: reviewResult.checks.dateValid,
                          },
                          {
                            label: '格式规范',
                            pass: reviewResult.checks.formatValid,
                          },
                          {
                            label: '用途匹配',
                            pass: reviewResult.checks.purposeMatch,
                          },
                        ].map((check, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between py-2 px-3 bg-slate-800/30 rounded-lg"
                          >
                            <span className="text-slate-300">{check.label}</span>
                            {check.pass ? (
                              <CheckCircle className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-400" />
                            )}
                          </div>
                        ))}
                        <div className="flex items-center justify-between py-2 px-3 bg-slate-800/30 rounded-lg">
                          <span className="text-slate-300">真实性评分</span>
                          <span className="text-emerald-400 font-medium">
                            {(
                              reviewResult.checks.authenticityScore * 100
                            ).toFixed(0)}
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AI Reason */}
                    <div className="p-4 bg-slate-800/50 rounded-xl">
                      <div className="flex items-center gap-2 text-emerald-400 text-sm mb-2">
                        <Brain className="w-4 h-4" />
                        AI 审核意见
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {reviewResult.reason}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    {reviewResult.status === 'approved' && (
                      <div className="space-y-3">
                        <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-6">
                          <ArrowRight className="w-5 h-5 mr-2" />
                          确认提款申请
                        </Button>
                        <p className="text-xs text-center text-slate-500">
                          审核结果将同步存证至 Monad 区块链
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                      <Eye className="w-10 h-10 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-400 mb-2">
                      等待上传凭证
                    </h3>
                    <p className="text-sm text-slate-500">
                      上传凭证后，AI 将自动进行分析审核
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Note */}
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-white font-medium mb-1">
                      安全与隐私
                    </div>
                    <p className="text-sm text-slate-400">
                      您的凭证仅用于 AI 审核，审核完成后原始图片不会被存储。
                      仅审核结果的哈希值会上链存证，确保隐私安全。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
