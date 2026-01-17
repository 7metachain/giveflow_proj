import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// System prompt for GiveFlow AI Assistant
const SYSTEM_PROMPT = `你是 GiveFlow 公益捐赠平台的 AI 助手。你的任务是帮助用户：
1. 发现和推荐合适的公益项目
2. 协助完成捐赠流程
3. 追踪捐赠资金的链上流向
4. 解答关于平台和区块链捐赠的问题

你需要：
- 友好、专业、有同理心
- 用简洁清晰的语言回复
- 当用户表达捐赠意愿时，引导他们选择项目
- 强调平台的透明性：AI 审核凭证、链上存证
- 适当使用 emoji 增加亲和力

当前可用的公益项目：
1. 乡村医疗救助计划 - 为偏远山区村民提供基本医疗服务（医疗健康类，目标$10,000，已筹$7,500）
2. 山区儿童教育支持 - 为贫困山区孩子提供学习用品和在线教育资源（教育助学类，目标$15,000，已筹$12,000）
3. 灾区紧急救援物资 - 为受灾地区提供食品、饮水和临时住所（灾害救助类，目标$50,000，已筹$35,000）

回复格式要求：
- 必须返回 JSON 格式
- 包含 message (回复文本) 和 action (可选操作)
- action 类型: search_campaigns, show_campaign, donate, track_donations, connect_wallet

JSON 格式示例：
{
  "message": "你的回复文本",
  "action": {
    "type": "search_campaigns",
    "params": { "category": "医疗健康" }
  }
}`

interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[]
  userAddress?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { messages, userAddress } = body

    // Check if we have OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      // Return mock response for demo
      return NextResponse.json(generateMockResponse(messages[messages.length - 1]?.content || ''))
    }

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      max_tokens: 500,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    const parsed = JSON.parse(content)
    return NextResponse.json(parsed)

  } catch (error) {
    console.error('Chat API error:', error)
    // Return mock response on error
    return NextResponse.json({
      message: '抱歉，我遇到了一点问题。请再试一次，或者直接告诉我你想做什么：\n\n• 推荐项目\n• 进行捐赠\n• 查看资金流向',
      action: null,
    })
  }
}

// Generate mock response for demo (when no API key)
function generateMockResponse(userMessage: string): { message: string; action: { type: string; params?: Record<string, unknown> } | null } {
  const lowerMsg = userMessage.toLowerCase()

  // Donation intent
  if (lowerMsg.includes('捐') || lowerMsg.includes('donate')) {
    return {
      message: '太好了，感谢你的爱心！💚\n\n我为你推荐了几个优质的公益项目。每个项目都经过验证，资金使用全程透明。\n\n你可以选择任意项目进行捐赠，或者告诉我你更感兴趣的领域（如医疗、教育、灾害救助）。',
      action: { type: 'search_campaigns', params: {} },
    }
  }

  // Search intent
  if (lowerMsg.includes('医疗') || lowerMsg.includes('健康')) {
    return {
      message: '我找到了医疗健康相关的项目：\n\n**乡村医疗救助计划** 正在进行中，已有 156 人参与，目前进度 75%。\n\n这个项目帮助偏远山区村民获得基本医疗服务，每一分钱的使用都需要通过 AI 审核。',
      action: { type: 'search_campaigns', params: { category: '医疗健康' } },
    }
  }

  if (lowerMsg.includes('教育') || lowerMsg.includes('孩子') || lowerMsg.includes('学校')) {
    return {
      message: '这是教育相关的公益项目：\n\n**山区儿童教育支持** 已筹集 $12,000，帮助贫困山区的孩子获得学习资源。\n\n80% 的资金已用于采购学习用品和建设图书馆，所有支出凭证都经过了 AI 验证。',
      action: { type: 'search_campaigns', params: { category: '教育助学' } },
    }
  }

  if (lowerMsg.includes('灾害') || lowerMsg.includes('救援') || lowerMsg.includes('紧急')) {
    return {
      message: '紧急救援类项目：\n\n**灾区紧急救援物资** 目前已筹集 $35,000，正在为受灾群众提供食品、饮水和临时住所。\n\n第一阶段的紧急物资已发放完毕，所有采购凭证都已通过 AI 审核并上链存证。',
      action: { type: 'search_campaigns', params: { category: '灾害救助' } },
    }
  }

  // Tracking intent
  if (lowerMsg.includes('追踪') || lowerMsg.includes('资金') || lowerMsg.includes('流向') || lowerMsg.includes('记录')) {
    return {
      message: '好的，我来帮你查看捐赠记录和资金流向！📊\n\n每笔捐赠都记录在 Monad 区块链上，你可以看到：\n• 捐赠时间和金额\n• 资金分配到哪个里程碑\n• 每笔支出的 AI 审核结果\n\n请先连接钱包，我就能显示你的完整捐赠历史。',
      action: { type: 'track_donations' },
    }
  }

  // Greeting
  if (lowerMsg.includes('你好') || lowerMsg.includes('hi') || lowerMsg.includes('hello')) {
    return {
      message: '你好！我是 GiveFlow AI 助手 💚\n\n我可以帮你：\n• 🔍 **发现项目** - 找到适合你的公益项目\n• 💰 **轻松捐赠** - 用自然语言完成捐赠\n• 👁️ **追踪资金** - 查看每一分钱的去向\n\n试试说："推荐一些医疗相关的项目" 或 "我想捐 50 美元"',
      action: null,
    }
  }

  // General/推荐
  if (lowerMsg.includes('推荐') || lowerMsg.includes('项目') || lowerMsg.includes('有什么')) {
    return {
      message: '这是我为你精选的公益项目：\n\n1️⃣ **乡村医疗救助** - 帮助偏远山区村民\n2️⃣ **山区儿童教育** - 支持孩子获得教育资源  \n3️⃣ **灾区紧急救援** - 为受灾群众提供物资\n\n所有项目都经过验证，资金使用透明。告诉我你感兴趣的项目，我帮你了解更多！',
      action: { type: 'search_campaigns', params: {} },
    }
  }

  // Default response
  return {
    message: '我是 GiveFlow AI 助手，专注于帮你完成透明公益捐赠。\n\n你可以试试：\n• "推荐一些公益项目"\n• "我想给医疗项目捐款"\n• "查看我的捐赠记录"\n\n有什么我可以帮你的吗？ 💚',
    action: null,
  }
}

// GET endpoint to check API status
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    hasApiKey: !!process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
  })
}
