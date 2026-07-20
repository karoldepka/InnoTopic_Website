import {inject, Injectable} from '@angular/core'
import {firstValueFrom} from 'rxjs'

import {AuthService} from '../../../auth/auth.service'
import {SupabaseOdmClientService} from '../../../libs/AppFedSharedSupabase/odm-supabase/supabase-odm-client.service'
import {AiBackendService, QuestionAnswer} from '../../Learn/core/ai-backend.service'

interface EmbeddingBatchResponse {
  embeddings: number[][]
  model: string
  dimensions: number
}

export interface DuplicateFilterResult {
  unique: QuestionAnswer[]
  duplicateCount: number
}

@Injectable({providedIn: 'root'})
export class QaDuplicateDetectorService {
  private readonly aiBackend = inject(AiBackendService)
  private readonly auth = inject(AuthService)
  private readonly supabase = inject(SupabaseOdmClientService).getClient()
  private readonly embeddingCache = new Map<string, number[]>()

  /** A deliberately high threshold: replacements are automatic, so false positives are more
   * harmful than letting a loosely related question through. */
  private readonly similarityThreshold = 0.92

  async removeDuplicates(
    candidates: QuestionAnswer[],
    alreadyAccepted: QuestionAnswer[],
  ): Promise<DuplicateFilterResult> {
    if (!candidates.length) return {unique: [], duplicateCount: 0}
    const acceptedQuestions = alreadyAccepted.map(item => item.question)
    const allTexts = [...acceptedQuestions, ...candidates.map(item => item.question)]
    await this.populateEmbeddingCache(allTexts)

    const acceptedVectors = acceptedQuestions
      .map(question => this.embeddingCache.get(this.normalize(question)))
      .filter((vector): vector is number[] => !!vector)
    const acceptedNormalized = new Set(acceptedQuestions.map(question => this.normalize(question)))
    const unique: QuestionAnswer[] = []
    let duplicateCount = 0

    for (const candidate of candidates) {
      const normalized = this.normalize(candidate.question)
      const vector = this.embeddingCache.get(normalized)
      if (!vector) throw new Error('Missing generated question embedding')

      const duplicatesCurrentBatch = acceptedNormalized.has(normalized)
        || acceptedVectors.some(existing => this.cosineSimilarity(vector, existing) >= this.similarityThreshold)
      const duplicatesStoredLearnItem = duplicatesCurrentBatch
        ? true
        : await this.hasStoredDuplicate(vector)

      if (duplicatesStoredLearnItem) {
        duplicateCount++
        continue
      }

      unique.push(candidate)
      acceptedNormalized.add(normalized)
      acceptedVectors.push(vector)
    }

    return {unique, duplicateCount}
  }

  private async populateEmbeddingCache(texts: string[]): Promise<void> {
    const missing = [...new Map(
      texts
        .map(text => [this.normalize(text), text.trim()] as const)
        .filter(([key]) => key && !this.embeddingCache.has(key)),
    ).entries()]
    if (!missing.length) return

    const response = await firstValueFrom(
      this.aiBackend.post<EmbeddingBatchResponse>('/embeddings/batch', {
        texts: missing.map(([, text]) => text),
      }),
    )
    if (response.embeddings.length !== missing.length) {
      throw new Error('Embedding API returned an unexpected vector count')
    }
    missing.forEach(([key], index) => this.embeddingCache.set(key, response.embeddings[index]))
  }

  private async hasStoredDuplicate(vector: number[]): Promise<boolean> {
    // Guest/offline generation still gets within-batch semantic deduplication. A pgvector lookup
    // needs an authenticated Firebase token so Supabase RLS can scope results to this user.
    if (!this.auth.authUser$.lastVal) return false
    const {data, error} = await this.supabase.rpc('match_learn_item_questions', {
      query_embedding: `[${vector.join(',')}]`,
      match_threshold: this.similarityThreshold,
      match_count: 1,
    })
    if (error) throw error
    return Array.isArray(data) && data.length > 0
  }

  private normalize(value: string): string {
    return value.trim().toLocaleLowerCase().replace(/\s+/g, ' ')
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || !a.length) return -1
    let dot = 0
    let magnitudeA = 0
    let magnitudeB = 0
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i]
      magnitudeA += a[i] * a[i]
      magnitudeB += b[i] * b[i]
    }
    const denominator = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB)
    return denominator ? dot / denominator : -1
  }
}
