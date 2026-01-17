/**
 * GiveFlow AI Client
 * 使用 wanjiedata OpenAI 兼容 API
 */

// API 配置 - 使用 DeepSeek V3
export const AI_CONFIG = {
  baseUrl: 'https://maas-openapi.wanjiedata.com/api/v1',
  apiKey: process.env.AI_API_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3OTcwNjA5NDIsImtleSI6IjVLNzVaOFROQzlGNEhNMzdQOVk3In0.gIpJqwNha8UW3_FhUMGkADNGf-HbkGH5NqhfEWmFFG4',
  model: 'deepseek-v3-2-251201',
  visionModel: 'deepseek-v3-2-251201',
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | ContentPart[]
}

export interface ContentPart {
  type: 'text' | 'image_url'
  text?: string
  image_url?: {
    url: string
  }
}

export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    message: {
      role: string
      content: string
      tool_calls: null
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface StreamChunk {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    delta: {
      role?: string
      content?: string
    }
    finish_reason: string | null
  }[]
}

/**
 * 非流式聊天请求
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options?: {
    model?: string
    maxTokens?: number
    temperature?: number
  }
): Promise<ChatCompletionResponse> {
  const response = await fetch(`${AI_CONFIG.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options?.model || AI_CONFIG.model,
      messages,
      stream: false,
      max_tokens: options?.maxTokens || 1000,
      temperature: options?.temperature || 0.7,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`AI API Error: ${response.status} - ${errorText}`)
  }

  return response.json()
}

/**
 * 流式聊天请求
 */
export async function chatCompletionStream(
  messages: ChatMessage[],
  options?: {
    model?: string
    maxTokens?: number
    temperature?: number
  }
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch(`${AI_CONFIG.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options?.model || AI_CONFIG.model,
      messages,
      stream: true,
      max_tokens: options?.maxTokens || 1000,
      temperature: options?.temperature || 0.7,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`AI API Error: ${response.status} - ${errorText}`)
  }

  return response.body!
}

/**
 * 解析流式响应
 */
export function parseSSEStream(stream: ReadableStream<Uint8Array>): ReadableStream<string> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  
  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read()
      
      if (done) {
        controller.close()
        return
      }
      
      const text = decoder.decode(value)
      const lines = text.split('\n').filter(line => line.trim())
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            controller.close()
            return
          }
          
          try {
            const parsed: StreamChunk = JSON.parse(data)
            const content = parsed.choices[0]?.delta?.content
            if (content) {
              controller.enqueue(content)
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
    },
  })
}

/**
 * 图片识别请求 (Vision)
 */
export async function visionCompletion(
  prompt: string,
  imageUrl: string,
  options?: {
    model?: string
    maxTokens?: number
  }
): Promise<ChatCompletionResponse> {
  const messages: ChatMessage[] = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: prompt,
        },
        {
          type: 'image_url',
          image_url: {
            url: imageUrl,
          },
        },
      ],
    },
  ]

  return chatCompletion(messages, {
    model: options?.model || AI_CONFIG.visionModel,
    maxTokens: options?.maxTokens || 1500,
  })
}

/**
 * 上传文件获取 URL (用于图生视频等)
 */
export async function uploadFile(file: File): Promise<{ url: string; fileName: string }> {
  const formData = new FormData()
  formData.append('maasFile', file)

  const response = await fetch('https://maas-openapi.wanjiedata.com/api/file/v1/uploadFile', {
    method: 'POST',
    headers: {
      'Authorization': AI_CONFIG.apiKey,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`)
  }

  const result = await response.json()
  if (!result.success) {
    throw new Error(result.message || 'Upload failed')
  }

  return result.result
}
