import { NextRequest, NextResponse } from 'next/server'
import { chatCompletion, chatCompletionStream, parseSSEStream, type ChatMessage } from '@/lib/ai-client'

// System prompt for SHE³ AI Assistant
const SYSTEM_PROMPT = `你是 SHE³（读作 "She Cubed"）女性公益平台的 AI 助手。SHE³ 专注于女性健康与教育公益。

## 你的任务
1. 发现和推荐女性相关的公益项目
2. 协助用户完成捐赠流程（支持批量捐赠）
3. 追踪捐赠资金的链上流向
4. 解答关于平台的问题

## 你的性格
- 温暖、专业、富有同理心
- 用简洁清晰的中文回复，每次不超过 150 字
- 适当使用 emoji（💜 💕 🩺 📚 ✨ 🌸）
- 主动引导用户下一步操作

## 当前可用的公益项目

### 女性健康类
1. **农村女性宫颈癌筛查计划** - 为偏远地区女性提供免费HPV检测和早筛服务（目标$15,000，已筹$11,250）
2. **女性心理健康热线** - 24小时女性心理援助热线（目标$25,000，已筹$17,500）

### 女性教育类
3. **山区女孩编程夏令营** - 为贫困山区女孩提供STEM教育和编程培训（目标$20,000，已筹$16,000）
4. **乡村女教师成长计划** - 资助偏远地区女教师参加教学能力提升培训（目标$18,000，已筹$10,800）

### 女性赋能类
5. **单亲妈妈职业技能培训** - 帮助单亲妈妈学习职业技能，实现经济独立（目标$12,000，已筹$8,400）

## 项目分类说明
- **女性健康**: 疾病筛查、体检、医疗援助、心理健康
- **女性教育**: STEM教育、职业培训、学业资助、教师培训
- **女性赋能**: 经济独立、职业技能、创业支持
- **心理健康**: 心理咨询、情绪支持、危机干预

## 重要说明
- 平台专注于女性公益，暂不涉及家庭婚姻、儿童福利等其他领域
- 如果用户询问非女性公益相关的内容，请友好解释平台的专注领域，并推荐相关的女性项目
- 例如：用户问"家庭婚姻"相关，可以推荐"单亲妈妈职业技能培训"或"女性心理健康热线"

## 平台特色
- 使用 Monad 区块链，交易 1 秒确认，费用极低
- 支持批量捐赠：一次选择多个项目
- AI 审核凭证：项目发起人上传发票，AI 验证后才能提款
- 全程透明：所有交易记录在链上

## 回复格式
直接回复用户问题，保持自然流畅。当推荐项目时，简要介绍项目亮点和进度。`

interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[]
  userAddress?: string
  stream?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { messages, stream = false } = body

    // Build messages array with system prompt
    const aiMessages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    // Stream mode
    if (stream) {
      const responseStream = await chatCompletionStream(aiMessages, {
        maxTokens: 500,
        temperature: 0.7,
      })

      const textStream = parseSSEStream(responseStream)
      
      return new Response(textStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Non-stream mode
    const response = await chatCompletion(aiMessages, {
      maxTokens: 500,
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    // Parse response and try to extract action
    const result = parseAIResponse(content)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Chat API error:', error)
    // Return mock response on error
    return NextResponse.json({
      message: '抱歉，我遇到了一点问题。请再试一次，或者直接告诉我你想做什么：\n\n• 推荐女性健康项目\n• 推荐教育相关项目\n• 查看资金流向',
      action: null,
    })
  }
}

// Parse AI response and extract potential actions
function parseAIResponse(content: string): { message: string; action: { type: string; params?: Record<string, unknown> } | null } {
  const lowerContent = content.toLowerCase()
  
  // Detect action intents from AI response
  let action: { type: string; params?: Record<string, unknown> } | null = null

  // Project recommendation
  if (
    (lowerContent.includes('项目') && (lowerContent.includes('推荐') || lowerContent.includes('这些') || lowerContent.includes('以下'))) ||
    lowerContent.includes('宫颈癌筛查') ||
    lowerContent.includes('心理健康热线') ||
    lowerContent.includes('编程夏令营') ||
    lowerContent.includes('女教师') ||
    lowerContent.includes('单亲妈妈')
  ) {
    action = { type: 'search_campaigns', params: {} }
  }
  
  // Category-specific
  if (lowerContent.includes('健康') || lowerContent.includes('医疗') || lowerContent.includes('筛查') || lowerContent.includes('体检')) {
    action = { type: 'search_campaigns', params: { category: '女性健康' } }
  } else if (lowerContent.includes('教育') || lowerContent.includes('培训') || lowerContent.includes('学习') || lowerContent.includes('编程')) {
    action = { type: 'search_campaigns', params: { category: '女性教育' } }
  } else if (lowerContent.includes('赋能') || lowerContent.includes('独立') || lowerContent.includes('职业') || lowerContent.includes('技能')) {
    action = { type: 'search_campaigns', params: { category: '女性赋能' } }
  } else if (lowerContent.includes('心理') || lowerContent.includes('情绪') || lowerContent.includes('咨询')) {
    action = { type: 'search_campaigns', params: { category: '心理健康' } }
  }
  
  // Donation intent
  if (lowerContent.includes('捐赠') || lowerContent.includes('捐款') || lowerContent.includes('支持')) {
    action = { type: 'donate', params: {} }
  }
  
  // Track donations
  if (lowerContent.includes('追踪') || lowerContent.includes('流向') || lowerContent.includes('记录') || lowerContent.includes('历史')) {
    action = { type: 'track_donations', params: {} }
  }
  
  // Wallet
  if (lowerContent.includes('连接钱包') || lowerContent.includes('钱包')) {
    action = { type: 'connect_wallet', params: {} }
  }

  return {
    message: content,
    action,
  }
}

// GET endpoint to check API status
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    provider: 'wanjiedata',
    model: 'deepseek-v3-2-251201',
  })
}
