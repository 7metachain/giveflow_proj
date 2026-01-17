import { NextRequest } from 'next/server'
import { AI_CONFIG, type ChatMessage } from '@/lib/ai-client'

// System prompt for SHE³ AI Assistant
const SYSTEM_PROMPT = `你是 SHE³（读作 "She Cubed"）女性公益平台的 AI 助手。SHE³ 专注于女性健康与教育公益。你的任务是帮助用户：
1. 发现和推荐女性健康、教育、赋能相关的公益项目
2. 协助完成捐赠流程（支持批量捐赠给多个项目）
3. 追踪捐赠资金的链上流向
4. 解答关于平台和区块链捐赠的问题

你需要：
- 温暖、专业、富有同理心
- 用简洁清晰的语言回复
- 当用户表达支持意愿时，引导他们选择项目
- 强调平台的透明性：AI 审核凭证、链上存证、Monad 区块链的高效性
- 适当使用 emoji（💜 💕 🩺 📚 ✨）增加亲和力

当前可用的女性公益项目：
1. 农村女性宫颈癌筛查计划 - 为偏远地区女性提供免费HPV检测和早筛服务（女性健康类，目标$15,000，已筹$11,250）
2. 山区女孩编程夏令营 - 为贫困山区女孩提供STEM教育和编程培训（女性教育类，目标$20,000，已筹$16,000）
3. 单亲妈妈职业技能培训 - 为单亲妈妈提供职业技能培训，帮助经济独立（女性赋能类，目标$12,000，已筹$8,400）
4. 女性心理健康热线 - 建设24小时女性心理援助热线（心理健康类，目标$25,000，已筹$17,500）
5. 乡村女教师成长计划 - 资助偏远地区女教师参加教学能力提升培训（女性教育类，目标$18,000，已筹$10,800）

平台特色：
- 使用 Monad 区块链，交易快速（1秒确认）、费用低
- 支持批量支持：用户可以同时选择多个项目，一次性完成捐赠
- AI 自动审核凭证：项目发起人上传发票/收据，AI 识别验证后才能提款
- 全程透明：所有交易、凭证审核结果都记录在链上

回复要求：
- 使用中文回复
- 温暖有力，每次回复不超过 150 字
- 主动引导用户进行下一步操作
- 体现对女性公益的关怀`

interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[]
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { messages } = body

    // Build messages array with system prompt
    const aiMessages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    // Make streaming request to AI API
    const response = await fetch(`${AI_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: aiMessages,
        stream: true,
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`AI API Error: ${response.status} - ${errorText}`)
    }

    // Create a transform stream that extracts content from SSE
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk)
        const lines = text.split('\n').filter(line => line.trim())
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              controller.terminate()
              return
            }
            
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                // Send just the content as SSE
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`))
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      },
    })

    // Pipe the response through our transform
    const stream = response.body!.pipeThrough(transformStream)

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Stream chat API error:', error)
    
    // Return error as SSE
    const errorStream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({ 
              content: '抱歉，我遇到了一点问题。请再试一次，或者直接告诉我你想做什么：推荐项目、进行捐赠、查看资金流向',
              error: true 
            })}\n\n`
          )
        )
        controller.close()
      },
    })

    return new Response(errorStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  }
}
