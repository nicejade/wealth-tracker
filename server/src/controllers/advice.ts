import OpenAI from 'openai'

interface AIConfig {
  model: string
  baseURL?: string
  apiKey?: string
}

interface AdviceRequest {
  settings: any
  prompt: string
}

interface OpenAIConfig {
  apiKey: string
  baseURL: string
}

const validateRequest = (aiConfig: AIConfig): { isValid: boolean; error?: string } => {
  if (!aiConfig?.apiKey) {
    return { isValid: false, error: 'API key is required' }
  }
  return { isValid: true }
}

const getOpenAIConfig = (aiConfig: AIConfig): OpenAIConfig => {
  const {
    baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    apiKey = process.env.OPENAI_API_KEY || '',
  } = aiConfig || {}

  return { apiKey, baseURL }
}

const callOpenAI = async (openai: OpenAI, prompt: string, model: string) => {
  console.log(`generateAdvice - start callOpenAI with model:`, model)

  try {
    const stream = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 8192,
      temperature: 0.7,
      stream: true,
    })

    console.log(`generateAdvice - stream created successfully`)
    return stream
  } catch (error) {
    console.error(`generateAdvice - OpenAI API error:`, error)
    throw error
  }
}

export const generateAdvice = async (request, reply) => {
  const { settings, prompt } = request?.body as AdviceRequest
  const { model = 'gpt-4o-mini' } = settings || {}

  const validation = validateRequest(settings)
  if (!validation.isValid) {
    return reply.code(400).send({
      statusCode: 400,
      message: validation.error,
    })
  }

  try {
    reply.raw.on('close', () => {
      console.log(`#Log# request stream close.`)
      reply.raw.end()
    })

    const headers = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no',
    }
    reply.raw.writeHead(200, headers)
    reply.raw.write('retry: 5\n')

    const config = getOpenAIConfig(settings)
    console.log(`AI config:`, config)

    const openai = new OpenAI(config)
    const stream = await callOpenAI(openai, prompt, model)
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        const message = `data: ${JSON.stringify({ stream: content })}\n\n`
        reply.raw.write(message)
      }
    }
    reply.raw.write('data: [DONE]\n\n')
    reply.raw.end()
  } catch (error: any) {
    console.error(`generateAdvice - Error details:`, {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    })

    return reply.code(500).send({
      statusCode: 500,
      message: 'Failed to generate advice',
      error: error.message,
    })
  }
}
