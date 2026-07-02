import type { TrackingEventType } from './tracking-event-type.enum';

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}

export interface TrackingEventEntity {
  id: string;
  anonymousId: string;
  sessionId: string;
  accountId: string;
  eventType: TrackingEventType;
  url: string;
  path: string;
  title: string | null;
  referrer: string | null;
  timestamp: Date;
  timeOnPage: number | null;
  scrollPercentage: number | null;
  metadata: JsonObject | null;
  createdAt: Date;
}

export type CreateTrackingEventInput = Omit<TrackingEventEntity, 'id' | 'createdAt'>;
