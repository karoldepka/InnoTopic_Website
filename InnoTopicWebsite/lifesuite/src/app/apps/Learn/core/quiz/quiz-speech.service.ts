import {Injectable} from '@angular/core'
import {stripHtml} from '../../../../libs/AppFedShared/utils/html-utils'

/** GH #128: reads the question/answer aloud during a quiz session, gated by the "READ ALOUD"
 * option in quiz-options - built on the browser's native SpeechSynthesis API rather than a paid
 * TTS service, since it needs no API key/network round-trip and every target browser already
 * supports it. */
@Injectable({providedIn: 'root'})
export class QuizSpeechService {

  speak(html: string | null | undefined) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return
    }
    const text = stripHtml(html ?? '')?.trim()
    if (!text) {
      return
    }
    // Cancel whatever's still being read (e.g. the question) before starting the next utterance
    // (e.g. the answer) - without this they'd queue up and read back-to-back instead of the new
    // one replacing the old.
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
  }

  stop() {
    window.speechSynthesis?.cancel()
  }

}
