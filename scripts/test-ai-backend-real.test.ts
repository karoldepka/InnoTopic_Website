import {collectObservable, postStreamingText, requestJson} from './ai-backend-test-utils'

interface HealthResponse {
  status: string
  llm: string
}

const backendUrl = new URL(process.env.AI_BACKEND_URL || 'http://localhost:8000')

describe('AI backend real server', () => {
  test('health endpoint reports Ollama is available', async () => {
    const health = await requestJson<HealthResponse>(backendUrl, '/ai-api/health')

    expect(health.status).toBe('ok')
    expect(health.llm).toBe('ollama')
  })

  test('streaming endpoint returns a real answer piece-by-piece', async () => {
    const streamedAnswers = await collectObservable(postStreamingText(backendUrl, '/ai-api/generate-answer-stream', {
      question: 'Count from 1 to 200, one number per line, no extra words.',
      context: '',
    }))
    const finalAnswer = streamedAnswers[streamedAnswers.length - 1] || ''

    expect(streamedAnswers.length).toBeGreaterThan(1)
    expect(finalAnswer).toMatch(/200/)
  })
})
