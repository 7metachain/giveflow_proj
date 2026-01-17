/**
 * 测试 DeepSeek API 连接
 */
const API_CONFIG = {
  baseUrl: 'https://maas-openapi.wanjiedata.com/api/v1',
  apiKey: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3OTcwNjA5NDIsImtleSI6IjVLNzVaOFROQzlGNEhNMzdQOVk3In0.gIpJqwNha8UW3_FhUMGkADNGf-HbkGH5NqhfEWmFFG4',
  model: 'deepseek-v3-2-251201',
}

async function testDeepSeekAPI() {
  console.log('🧪 开始测试 DeepSeek API...\n')

  try {
    // 测试非流式请求
    console.log('📡 测试非流式请求...')
    const response = await fetch(`${API_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: API_CONFIG.model,
        messages: [
          { role: 'system', content: '你是一个帮助测试API的助手。' },
          { role: 'user', content: '你好，请回复"测试成功"' }
        ],
        stream: false,
        max_tokens: 100,
        temperature: 0.7,
      }),
    })

    console.log(`   状态码: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`   ❌ 错误: ${errorText}`)
      return false
    }

    const data = await response.json()
    console.log('   ✅ 非流式请求成功')
    console.log(`   回复内容: ${data.choices[0]?.message?.content}`)
    console.log(`   Token 使用: ${data.usage?.total_tokens} tokens\n`)

    // 测试流式请求
    console.log('📡 测试流式请求...')
    const streamResponse = await fetch(`${API_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: API_CONFIG.model,
        messages: [
          { role: 'system', content: '你是一个帮助测试API的助手。' },
          { role: 'user', content: '请数1到5' }
        ],
        stream: true,
        max_tokens: 100,
        temperature: 0.7,
      }),
    })

    console.log(`   状态码: ${streamResponse.status}`)

    if (!streamResponse.ok) {
      const errorText = await streamResponse.text()
      console.error(`   ❌ 错误: ${errorText}`)
      return false
    }

    console.log('   ✅ 流式请求成功')
    console.log('   流式响应内容: ')

    const reader = streamResponse.body.getReader()
    const decoder = new TextDecoder()
    let streamContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = decoder.decode(value)
      const lines = text.split('\n').filter(line => line.trim())

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            console.log('\n   ✅ 流式传输完成')
            break
          }

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices[0]?.delta?.content
            if (content) {
              process.stdout.write(content)
              streamContent += content
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
    }

    console.log('\n\n✨ 所有测试通过！API 连接正常。\n')
    return true

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message)
    console.error(error)
    return false
  }
}

// 运行测试
testDeepSeekAPI().then(success => {
  process.exit(success ? 0 : 1)
})
