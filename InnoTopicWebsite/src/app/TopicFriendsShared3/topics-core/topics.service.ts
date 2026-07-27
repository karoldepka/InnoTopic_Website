import { Injectable } from '@angular/core';
import { errorAlert } from '../../utils/utils';
import {
  Topic,
} from './Topic';
import {
  tag,
} from './topics';
import { topicsArr } from './topics-data';
import { topicsOld } from './topics-data-old';
import { topicInfoById } from './topic-info.data';


interface IdToTopicMap {
  [key: string]: string;
}

interface TopicMaps {
  [key: string]: IdToTopicMap;
}

function checkForDuplicates(maps: TopicMaps): string[] {
  const seenKeys: Set<string> = new Set();
  const duplicates: string[] = [];

  Object.values(maps).forEach((map) => {
    Object.keys(map).forEach((key) => {
      if (seenKeys.has(key)) {
        duplicates.push(key);
      } else {
        seenKeys.add(key);
      }
    });
  });

  return duplicates;
}

@Injectable({
  providedIn: 'root'
})
export class TopicsService {

  public topics: Topic[] = this.transformTags(topicsOld);

  constructor(
  ) {
    // console.log('topicsArr', topicsArr)
    topicsArr.forEach(t => {
      if ( this.getTopicByIdIfExisting(t.id) ) {
        errorAlert('TOPIC DUPLICATE WITH OLD topics (old one might be overriding data):', t.id)
      }
    })
    this.topics.push(... topicsArr)
    // console.log('all topics', this.topics)
  }

  private transformTags(inputList: (Topic|string)[]): Topic[] {
    let retTopicsArray: any = []
    for ( let elTopic of inputList ) {
      // console.log('transformTags elTopic', elTopic)
      this.addTopic(elTopic, retTopicsArray)
    }
    return retTopicsArray
  }

  getTopicById(topicIdOrName: string, topicsArray?: Topic[]): Topic {
    const topic = this.getTopicByIdIfExisting(/*...arguments*/ topicIdOrName, topicsArray)
    if ( ! topic ) {
      // FIXME: handle unknown topics (no icon, add some suffix like "(Unknown)", warn on console; for TopicFriends, if older version displays data from newer version
      // console.log('getTopicById', this.topics)
      errorAlert('getTopicById failed for topicIdOrName ' + topicIdOrName)
      // console.log(topicsArray)
    }
    return topic
  }

  getTopicByIdIfExisting(topicIdOrName: string, topicsArray?: Topic[]): Topic {
    // console.log('getTopicByIdIfExisting topicIdOrName', topicIdOrName)
    // TODO: change to hash-map, while doing topic management
    if ( topicIdOrName == null) {
      const message = 'topicIdOrName wrong: ' + topicIdOrName;
      errorAlert(message)
      throw(new Error(message))
    }
    topicsArray = topicsArray || this.topics
    let retVal = topicsArray.find((topic: Topic) => {
      let id = topic.id;
      if ( id == null ) {
        errorAlert('id null for topic', topic.name)
      }
      return id.toLowerCase() === topicIdOrName.toLowerCase()
    })
    if ( ! retVal ) {
      retVal = topicsArray.find((it: Topic) => it.name.toLowerCase() === topicIdOrName.toLowerCase()) !
    }
    // console.log('getTopicById', topicId, retVal)
    return retVal
  }

  addTopic(topic: Topic|string, topicsArray?: Topic[]) {
    topicsArray = topicsArray || this.topics

    let newTopic: Topic

    if (topic instanceof Topic) {
      newTopic = topic
    } else {
      newTopic = tag(topic)
    }

    if ( this.topicExistsById(newTopic.id, topicsArray) ) {
      errorAlert('Duplicate topic:', newTopic.id)
      return null
    }

    topicsArray.push(newTopic)
    if ( newTopic.related ) {
      for ( let relatedTopic of newTopic.related ) {
        this.addTopic(relatedTopic, topicsArray)
      }
      // topicsArray.splice(topicsArray.length, 0, ...newTopic.related)
    }
    return newTopic
  }

  topicExistsById(topicId: string, topicsArray?: any) {
    return !! this.getTopicByIdIfExisting(topicId, topicsArray)
  }

  /**
   * Single source of truth for "what short info do we have about this topic":
   * prefers data set directly on the Topic, falls back to the separate topic-info.data.ts lookup.
   */
  getTopicInfo(topic: Topic | undefined | null): string | undefined {
    if ( ! topic ) {
      return undefined
    }
    return topic.comments || topic.description || topic.tagline
      || topicInfoById[topic.id] || topicInfoById[topic.name]
  }

}
