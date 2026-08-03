import { errorAlert } from './data/error-alert'
import { Topic } from './data/Topic'
import { tag } from './data/topics'
import { topicsArr } from './data/topics-data'
import { topicsOld } from './data/topics-data-old'
import { topicInfoById } from './data/topic-info.data'
import { ReactiveValue } from './reactive-value'

const runWhenIdle = (callback: () => void) => {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, { timeout: 2000 })
    return
  }
  setTimeout(callback, 500)
}

/**
 * Replaces Angular's TopicsService - same responsibilities (topic lookup, lazy-loaded
 * extended info), no DI/framework needed: a plain singleton does the same job a
 * `providedIn: 'root'` service did.
 */
class TopicsRegistry {

  public topics: Topic[] = this.transformTags(topicsOld)

  /**
   * topics-data-extended.ts is a large (2000+ entry) dictionary only needed for the
   * click-to-reveal info popover on a topic tag - loaded lazily on idle so it doesn't
   * bloat/slow down whatever bundle first imports this registry.
   */
  private extendedData: typeof import('./data/topics-data-extended') | undefined
  readonly extendedDataLoaded = new ReactiveValue(false)

  constructor() {
    topicsArr.forEach(t => {
      if (this.getTopicByIdIfExisting(t.id)) {
        errorAlert('TOPIC DUPLICATE WITH OLD topics (old one might be overriding data):', t.id)
      }
    })
    this.topics.push(...topicsArr)

    runWhenIdle(() => {
      import('./data/topics-data-extended').then(mod => {
        this.extendedData = mod
        this.extendedDataLoaded.set(true)
      })
    })
  }

  private transformTags(inputList: (Topic | string)[]): Topic[] {
    const retTopicsArray: Topic[] = []
    for (const elTopic of inputList) {
      this.addTopic(elTopic, retTopicsArray)
    }
    return retTopicsArray
  }

  /** getTopicByIdIfExisting() already errorAlert()s when a string id can't be resolved. */
  getTopicById(topicIdOrName: string, topicsArray?: Topic[]): Topic {
    const topic = this.getTopicByIdIfExisting(topicIdOrName, topicsArray)
    if (!topic) {
      errorAlert('getTopicById failed for topicIdOrName ' + topicIdOrName)
    }
    return topic as Topic
  }

  getTopicByIdIfExisting(topicIdOrName: string, topicsArray?: Topic[]): Topic | undefined {
    if (topicIdOrName == null) {
      const message = 'topicIdOrName wrong: ' + topicIdOrName
      errorAlert(message)
      throw new Error(message)
    }
    topicsArray = topicsArray || this.topics
    let retVal = topicsArray.find((topic: Topic) => {
      const id = topic.id
      if (id == null) {
        errorAlert('id null for topic', topic.name)
      }
      return id.toLowerCase() === topicIdOrName.toLowerCase()
    })
    if (!retVal) {
      retVal = topicsArray.find((it: Topic) => it.name.toLowerCase() === topicIdOrName.toLowerCase())
    }
    return retVal
  }

  addTopic(topic: Topic | string, topicsArray?: Topic[]) {
    topicsArray = topicsArray || this.topics

    const newTopic: Topic = topic instanceof Topic ? topic : tag(topic)

    if (this.topicExistsById(newTopic.id, topicsArray)) {
      errorAlert('Duplicate topic:', newTopic.id)
      return null
    }

    topicsArray.push(newTopic)
    if (newTopic.related) {
      for (const relatedTopic of newTopic.related) {
        this.addTopic(relatedTopic, topicsArray)
      }
    }
    return newTopic
  }

  topicExistsById(topicId: string, topicsArray?: Topic[]) {
    return !!this.getTopicByIdIfExisting(topicId, topicsArray)
  }

  /**
   * Single source of truth for "what short info do we have about this topic": prefers data
   * set directly on the Topic, falls back to the separate topic-info.data.ts lookup.
   */
  getTopicInfo(topic: Topic | undefined | null): string | undefined {
    if (!topic) {
      return undefined
    }
    this.extendedDataLoaded.value // read so subscribers can tell once the lazy chunk lands
    const extendedMap = this.extendedData?.topicsDataExtended as any
    const extended = extendedMap && (extendedMap[topic.id] || extendedMap[topic.name])
    return topic.comments || topic.description || topic.tagline
      || (extended && this.extendedData!.formatTopicExtendedInfo(extended))
      || topicInfoById[topic.id] || topicInfoById[topic.name]
  }
}

export const topicsRegistry = new TopicsRegistry()
