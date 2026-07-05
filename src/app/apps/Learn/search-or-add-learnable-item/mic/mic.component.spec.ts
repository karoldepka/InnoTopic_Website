import {describe, it, expect, vi} from 'vitest'
import {MicComponent} from './mic.component'

/** Mock standing in for `LearnItemItemsService` - only `className`/`newItem` are used by
 * MicComponent's no-item$ fallback path. */
class FakeLearnItemItemsService {
  className = 'LearnItem'
  newItem = vi.fn((_id: any, _inMemData: any) => ({
    id: 'LearnItem__new_1',
    saveNowToDb: vi.fn(),
  }))
}

/** Mock standing in for `VoiceAttachmentService` - records calls without touching Firestore. */
class FakeVoiceAttachmentService {
  attachRecording = vi.fn(async () => {})
}

function seedAudioChunksAndStop(component: MicComponent) {
  ;(component as any).audioChunks = [new Blob(['fake-audio-bytes'])]
  ;(component as any).onRecordStopped()
}

describe('MicComponent', () => {
  it('attaches the recording to the provided item$ instead of creating a new LearnItem', () => {
    const learnDoService = new FakeLearnItemItemsService()
    const voiceAttachmentService = new FakeVoiceAttachmentService()
    const component = new MicComponent(learnDoService as any, voiceAttachmentService as any)

    const patchThrottled = vi.fn()
    component.item$ = {
      id: 'JournalEntry__abc',
      odmService: {className: 'JournalEntry'},
      patchThrottled,
    }

    seedAudioChunksAndStop(component)

    expect(patchThrottled).toHaveBeenCalledWith({hasAudio: true})
    expect(voiceAttachmentService.attachRecording).toHaveBeenCalledWith('JournalEntry', 'JournalEntry__abc', expect.any(Blob))
    expect(learnDoService.newItem).not.toHaveBeenCalled()
  })

  it('uses the explicit collection input instead of item$.odmService.className when provided (OrYoL tree nodes have no odmService)', () => {
    const learnDoService = new FakeLearnItemItemsService()
    const voiceAttachmentService = new FakeVoiceAttachmentService()
    const component = new MicComponent(learnDoService as any, voiceAttachmentService as any)

    const patchThrottled = vi.fn()
    component.item$ = {id: 'some-tree-node-id', patchThrottled}
    component.collection = 'OryItem'

    seedAudioChunksAndStop(component)

    expect(voiceAttachmentService.attachRecording).toHaveBeenCalledWith('OryItem', 'some-tree-node-id', expect.any(Blob))
  })

  it('falls back to creating a new LearnItem when no item$ is provided (the quick-add bar case)', () => {
    const learnDoService = new FakeLearnItemItemsService()
    const voiceAttachmentService = new FakeVoiceAttachmentService()
    const component = new MicComponent(learnDoService as any, voiceAttachmentService as any)

    seedAudioChunksAndStop(component)

    expect(learnDoService.newItem).toHaveBeenCalledTimes(1)
    expect(voiceAttachmentService.attachRecording).toHaveBeenCalledWith('LearnItem', 'LearnItem__new_1', expect.any(Blob))
  })
})
