import * as http from 'http'
import {collectObservable, postJson, postStreamingText, requestJson} from './ai-backend-test-utils'

interface MockBackend {
  requests: unknown[]
  server: http.Server
}

function createMockBackend(): MockBackend {
  const requests: unknown[] = []
  const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/ai-api/health') {
      res.writeHead(200, {'Content-Type': 'application/json'})
      res.end(JSON.stringify({status: 'ok', llm: 'mock', model: 'mock-model'}))
      return
    }

    if (req.method === 'GET' && req.url === '/ai-api/health-error') {
      res.writeHead(503, {'Content-Type': 'text/plain'})
      res.end('backend unavailable')
      return
    }

    if (req.method === 'GET' && req.url === '/ai-api/invalid-json') {
      res.writeHead(200, {'Content-Type': 'application/json'})
      res.end('not json')
      return
    }

    if (req.method === 'POST' && req.url === '/ai-api/generate-answer-stream') {
      let body = ''
      req.setEncoding('utf8')
      req.on('data', chunk => body += chunk)
      req.on('end', () => {
        requests.push(JSON.parse(body))
        res.writeHead(200, {'Content-Type': 'text/plain'})
        res.write('mock ')
        setTimeout(() => {
          res.write('streamed ')
          setTimeout(() => {
            res.end('answer')
          }, 5)
        }, 5)
      })
      return
    }

    if (req.method === 'POST' && req.url === '/ai-api/generate-answer') {
      let body = ''
      req.setEncoding('utf8')
      req.on('data', chunk => body += chunk)
      req.on('end', () => {
        requests.push(JSON.parse(body))
        res.writeHead(200, {'Content-Type': 'application/json'})
        res.end(JSON.stringify({answer: 'mock json answer'}))
      })
      return
    }

    if (req.method === 'POST' && req.url === '/ai-api/generate-answer-error') {
      res.writeHead(500, {'Content-Type': 'application/json'})
      res.end(JSON.stringify({detail: 'mock answer failure'}))
      return
    }

    if (req.method === 'POST' && req.url === '/ai-api/generate-empty-answer-stream') {
      res.writeHead(200, {'Content-Type': 'text/plain'})
      res.end()
      return
    }

    if (req.method === 'POST' && req.url === '/ai-api/generate-answer-stream-error') {
      res.writeHead(500, {'Content-Type': 'text/plain'})
      res.end('mock stream failure')
      return
    }

    res.writeHead(404, {'Content-Type': 'text/plain'})
    res.end('not found')
  })

  return {
    requests,
    server,
  }
}

function listen(server: http.Server): Promise<NonNullable<ReturnType<http.Server['address']>>> {
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject)
      resolve(server.address()!)
    })
  })
}

function close(server: http.Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve())
  })
}

describe('AI backend mocked server', () => {
  let mockBackend: MockBackend
  let backendUrl: URL

  beforeEach(async () => {
    mockBackend = createMockBackend()
    const address = await listen(mockBackend.server)
    if (typeof address === 'string') {
      throw new Error(`Expected TCP address, got pipe address: ${address}`)
    }
    backendUrl = new URL(`http://127.0.0.1:${address.port}`)
  })

  afterEach(async () => {
    await close(mockBackend.server)
  })

  test('health endpoint returns mocked metadata', async () => {
    await expect(requestJson(backendUrl, '/ai-api/health')).resolves.toEqual({
      status: 'ok',
      llm: 'mock',
      model: 'mock-model',
    })
  })

  test('streaming endpoint emits accumulated chunks through RxJS', async () => {
    const streamedAnswers = await collectObservable(postStreamingText(backendUrl, '/ai-api/generate-answer-stream', {
      question: 'mock question',
      context: 'mock context',
    }))

    expect(streamedAnswers).toEqual([
      'mock ',
      'mock streamed ',
      'mock streamed answer',
    ])
    expect(mockBackend.requests).toEqual([{
      question: 'mock question',
      context: 'mock context',
    }])
  })

  test('JSON POST helper sends the question and returns a generated answer', async () => {
    await expect(postJson(backendUrl, '/ai-api/generate-answer', {
      question: 'mock json question',
      context: 'mock json context',
    })).resolves.toEqual({
      answer: 'mock json answer',
    })

    expect(mockBackend.requests).toEqual([{
      question: 'mock json question',
      context: 'mock json context',
    }])
  })

  test('JSON helper rejects non-2xx backend responses with response body', async () => {
    await expect(requestJson(backendUrl, '/ai-api/health-error')).rejects.toThrow(
      'HTTP 503: backend unavailable'
    )
  })

  test('JSON helper rejects invalid JSON responses', async () => {
    await expect(requestJson(backendUrl, '/ai-api/invalid-json')).rejects.toThrow()
  })

  test('JSON POST helper rejects non-2xx backend responses with response body', async () => {
    await expect(postJson(backendUrl, '/ai-api/generate-answer-error', {
      question: 'failing answer',
    })).rejects.toThrow('HTTP 500: {"detail":"mock answer failure"}')
  })

  test('streaming helper emits no chunks for an empty successful stream', async () => {
    await expect(collectObservable(postStreamingText(backendUrl, '/ai-api/generate-empty-answer-stream', {
      question: 'empty stream',
    }))).resolves.toEqual([])
  })

  test('streaming helper rejects non-2xx stream responses with response body', async () => {
    await expect(collectObservable(postStreamingText(backendUrl, '/ai-api/generate-answer-stream-error', {
      question: 'failing stream',
    }))).rejects.toThrow('HTTP 500: mock stream failure')
  })
})
