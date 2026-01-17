import { NextRequest, NextResponse } from 'next/server'
import { mockCampaigns, Campaign } from '@/lib/mock-data'
import { readCampaignsFromFile, addCampaignToFile } from '@/lib/server-storage'

// GET /api/campaigns - 获取所有项目列表
export async function GET() {
  try {
    // 从文件读取项目
    const fileCampaigns = readCampaignsFromFile()

    // 如果文件为空，使用mock数据
    const allCampaigns = fileCampaigns.length > 0 ? fileCampaigns : mockCampaigns

    return NextResponse.json({
      success: true,
      campaigns: allCampaigns,
    })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns - 创建新项目
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证必填字段
    const requiredFields = [
      'title',
      'description',
      'beneficiary',
      'beneficiaryName',
      'targetAmount',
      'category',
      'deadline',
      'milestones',
    ]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 }
        )
      }
    }

    // 验证里程碑数据
    if (!Array.isArray(body.milestones) || body.milestones.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one milestone is required',
        },
        { status: 400 }
      )
    }

    // 验证里程碑金额总和不超过目标金额
    const milestonesTotal = body.milestones.reduce(
      (sum: number, m: any) => sum + (m.targetAmount || 0),
      0
    )

    if (Math.abs(milestonesTotal - body.targetAmount) > 0.01) {
      return NextResponse.json(
        {
          success: false,
          error: `Total milestone amounts (${milestonesTotal}) must equal target amount (${body.targetAmount})`,
        },
        { status: 400 }
      )
    }

    // 创建新项目
    // 如果是链上项目，使用链上返回的ID；否则使用时间戳
    const campaignId = body.chainCampaignId || String(Date.now())

    const newCampaign: Campaign & { onChain?: boolean; txHash?: string } = {
      id: campaignId,
      title: body.title,
      description: body.description,
      beneficiary: body.beneficiary,
      beneficiaryName: body.beneficiaryName,
      targetAmount: Number(body.targetAmount),
      raisedAmount: 0,
      donorsCount: 0,
      category: body.category,
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop',
      milestones: body.milestones.map((m: any, index: number) => ({
        id: `m${Date.now()}_${index}`,
        title: m.title,
        targetAmount: Number(m.targetAmount),
        releasedAmount: 0,
        status: 'pending' as const,
        proofRequired: m.proofRequired !== false, // 默认需要凭证
      })),
      proofs: [],
      createdAt: new Date().toISOString(),
      deadline: new Date(body.deadline).toISOString(),
      status: 'active' as const,
      onChain: body.onChain || false, // 标记是否已上链
      txHash: body.txHash, // 保存交易哈希
    }

    // 添加到文件存储
    const saved = addCampaignToFile(newCampaign as Campaign)

    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Failed to save campaign to storage' },
        { status: 500 }
      )
    }

    console.log('✅ 项目已保存到文件，ID:', campaignId)

    // TODO: 在实际应用中，这里会调用智能合约创建项目
    // 示例代码：
    // import { createCampaignOnChain } from '@/lib/contracts'
    // const chainResult = await createCampaignOnChain({
    //   beneficiary: body.beneficiary,
    //   title: body.title,
    //   description: body.description,
    //   category: body.category,
    //   targetAmount: Number(body.targetAmount) * 1e18, // 转换为wei
    //   deadline: Math.floor(new Date(body.deadline).getTime() / 1000),
    // })
    //
    // if (chainResult.success) {
    //   newCampaign.txHash = chainResult.txHash
    //   newCampaign.onChain = true
    // }

    return NextResponse.json({
      success: true,
      campaign: newCampaign,
      message: 'Campaign created successfully',
    })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create campaign',
      },
      { status: 500 }
    )
  }
}
