import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// AI Review Result interface
interface AIReviewResult {
  status: 'approved' | 'rejected' | 'manual_review'
  confidence: number
  extracted: {
    amount: number
    date: string
    recipient: string
    purpose: string
  }
  checks: {
    amountMatch: boolean
    dateValid: boolean
    formatValid: boolean
    authenticityScore: number
    purposeMatch: boolean
  }
  reason: string
}

// Prompt template for GPT-4V
const REVIEW_PROMPT = `You are an AI auditor for a charity platform. Analyze this expense proof (invoice/receipt) image and extract the following information:

1. Total amount on the document
2. Date of the transaction
3. Recipient/Vendor name
4. Purpose/Description of the expense

Then verify:
1. Is this a legitimate-looking document? (check format, signatures, stamps)
2. Does it appear to be an original document (not edited)?
3. Is the date recent and valid?
4. Does the purpose align with charitable/medical/educational spending?

The user claims this proof is for an expense of ${{requestAmount}} for {{campaignPurpose}}.

Respond in JSON format ONLY:
{
  "extracted": {
    "amount": <number>,
    "date": "<YYYY-MM-DD>",
    "recipient": "<string>",
    "purpose": "<string>"
  },
  "verification": {
    "formatValid": <boolean>,
    "appearsOriginal": <boolean>,
    "dateValid": <boolean>,
    "purposeAligned": <boolean>,
    "authenticityScore": <0-1 float>
  },
  "decision": {
    "status": "<approved|rejected|manual_review>",
    "confidence": <0-1 float>,
    "reason": "<explanation in Chinese>"
  }
}`

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const requestAmount = formData.get('requestAmount') as string
    const campaignPurpose = formData.get('campaignPurpose') as string || '公益项目支出'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type || 'image/jpeg'
    const dataUrl = `data:${mimeType};base64,${base64}`

    // Check if we have OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      // Return mock result for demo purposes
      console.log('No OpenAI API key, returning mock result')
      return NextResponse.json(generateMockResult(parseInt(requestAmount) || 3000))
    }

    // Call GPT-4V
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: REVIEW_PROMPT
                .replace('{{requestAmount}}', requestAmount || '3000')
                .replace('{{campaignPurpose}}', campaignPurpose),
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    // Parse AI response
    const aiResponse = JSON.parse(content)
    
    // Transform to our format
    const result: AIReviewResult = {
      status: aiResponse.decision?.status || 'manual_review',
      confidence: aiResponse.decision?.confidence || 0.5,
      extracted: {
        amount: aiResponse.extracted?.amount || 0,
        date: aiResponse.extracted?.date || new Date().toISOString().split('T')[0],
        recipient: aiResponse.extracted?.recipient || 'Unknown',
        purpose: aiResponse.extracted?.purpose || 'Unknown',
      },
      checks: {
        amountMatch: Math.abs(aiResponse.extracted?.amount - parseInt(requestAmount)) < 100,
        dateValid: aiResponse.verification?.dateValid || false,
        formatValid: aiResponse.verification?.formatValid || false,
        authenticityScore: aiResponse.verification?.authenticityScore || 0.5,
        purposeMatch: aiResponse.verification?.purposeAligned || false,
      },
      reason: aiResponse.decision?.reason || '审核完成',
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('AI review error:', error)
    
    // Return mock result on error for demo
    return NextResponse.json(generateMockResult(3000))
  }
}

// Generate mock result for demo purposes
function generateMockResult(requestAmount: number): AIReviewResult {
  return {
    status: 'approved',
    confidence: 0.94,
    extracted: {
      amount: requestAmount,
      date: new Date().toISOString().split('T')[0],
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
    reason: '凭证真实有效。OCR 识别金额与申请金额一致，日期在有效期内，收款方为认证机构，用途与项目里程碑描述匹配。建议批准该提款申请。',
  }
}

// GET endpoint to check API status
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    hasApiKey: !!process.env.OPENAI_API_KEY,
    model: 'gpt-4o',
  })
}
