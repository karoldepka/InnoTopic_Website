import {Topics} from "../../TopicFriendsShared3/topics-core/topics-data";

export interface GraphNode {
  connections?: GraphConnections;
  sizeMult?: number;
  strengthMul?: number;
}

export type GraphNodeId = string;
export type TopicId = string;

// export type GraphConnections = { [key: TopicId]: GraphNode }

export type GraphConnections = { [key in keyof Partial<Topics>]: GraphNode };

export interface LinkByIds {
  source: GraphNodeId;
  target: GraphNodeId;
  strengthMul?: number;
}
