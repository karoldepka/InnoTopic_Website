import * as http from 'http'
import * as https from 'https'
import {Observable} from 'rxjs'

export function requestJson<T>(baseUrl: URL, path: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const transport = baseUrl.protocol === 'https:' ? https : http
    const req = transport.request(new URL(path, baseUrl), res => {
      let body = ''

      res.setEncoding('utf8')
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        if ((res.statusCode || 0) >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`))
          return
        }

        try {
          resolve(JSON.parse(body) as T)
        } catch (error) {
          reject(error)
        }
      })
    })

    req.on('error', reject)
    req.end()
  })
}

export function postJson<T>(
  baseUrl: URL,
  path: string,
  payload: Record<string, unknown>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const transport = baseUrl.protocol === 'https:' ? https : http
    const body = JSON.stringify(payload)
    const req = transport.request(new URL(path, baseUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let responseBody = ''

      res.setEncoding('utf8')
      res.on('data', chunk => responseBody += chunk)
      res.on('end', () => {
        if ((res.statusCode || 0) >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${responseBody}`))
          return
        }

        try {
          resolve(JSON.parse(responseBody) as T)
        } catch (error) {
          reject(error)
        }
      })
    })

    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

export function postStreamingText(
  baseUrl: URL,
  path: string,
  payload: Record<string, unknown>,
): Observable<string> {
  return new Observable<string>(subscriber => {
    const transport = baseUrl.protocol === 'https:' ? https : http
    const body = JSON.stringify(payload)
    let answer = ''

    const req = transport.request(new URL(path, baseUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      res.setEncoding('utf8')

      if ((res.statusCode || 0) >= 400) {
        let errorBody = ''
        res.on('data', chunk => errorBody += chunk)
        res.on('end', () => subscriber.error(new Error(`HTTP ${res.statusCode}: ${errorBody}`)))
        return
      }

      res.on('data', chunk => {
        answer += chunk
        subscriber.next(answer)
      })
      res.on('end', () => subscriber.complete())
    })

    req.on('error', error => subscriber.error(error))
    req.write(body)
    req.end()

    return () => req.destroy()
  })
}

export function collectObservable<T>(observable: Observable<T>): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const values: T[] = []

    observable.subscribe({
      next: value => values.push(value),
      error: reject,
      complete: () => resolve(values),
    })
  })
}
