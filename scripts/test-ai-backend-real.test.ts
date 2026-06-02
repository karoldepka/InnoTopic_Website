import {collectObservable, postJson, postStreamingText, requestJson} from './ai-backend-test-utils'

interface HealthResponse {
  status: string
  llm: string
}

interface AnswerResponse {
  answer: string
}

const backendUrl = new URL(process.env.AI_BACKEND_URL || 'http://localhost:8000')

describe('AI backend real server', () => {
  test('health endpoint reports Ollama is available', async () => {
    const health = await requestJson<HealthResponse>(backendUrl, '/ai-api/health')

    expect(health.status).toBe('ok')
    expect(health.llm).toBe('ollama')
  })

  test('unprefixed health endpoint reports the same backend', async () => {
    const health = await requestJson<HealthResponse>(backendUrl, '/health')

    expect(health.status).toBe('ok')
    expect(health.llm).toBe('ollama')
  })

  test('non-streaming endpoint returns a real generated answer', async () => {
    const response = await postJson<AnswerResponse>(backendUrl, '/ai-api/generate-answer', {
      question: 'What is 2 + 2? Reply with only the digit.',
      context: '',
    })

    expect(response.answer).toMatch(/4/)
  })

  test('streaming endpoint returns a real answer', async () => {
    const streamedAnswers = await collectObservable(postStreamingText(backendUrl, '/ai-api/generate-answer-stream', {
      question: 'Count from 1 to 200, one number per line, no extra words.',
      context: '',
    }))
    const finalAnswer = streamedAnswers[streamedAnswers.length - 1] || ''

    expect(streamedAnswers.length).toBeGreaterThanOrEqual(1)
    expect(finalAnswer).toMatch(/200/)
  })
})
