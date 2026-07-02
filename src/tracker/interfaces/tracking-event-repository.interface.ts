import type {
  CreateTrackingEventInput,
  TrackingEventEntity,
} from '../entities/tracking-event.entity';

export const TRACKING_EVENT_REPOSITORY = Symbol('TRACKING_EVENT_REPOSITORY');

export interface FindSessionsParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  websiteId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  timeoutMinutes?: number;
}

export interface SessionListItem {
  sessionId: string;
  anonymousId: string;
  accountId: string;
  siteName: string | null;
  siteDomain: string | null;
  startedAt: Date;
  endedAt: Date;
  duration: number;
  totalEvents: number;
  totalPageViews: number;
  exitPage: string;
  status: 'active' | 'completed';
}

export interface FindSessionsResult {
  sessions: SessionListItem[];
  total: number;
}

export interface TrackingEventRepository {
  create(payload: CreateTrackingEventInput): Promise<TrackingEventEntity>;
  findAll(accountId?: string): Promise<TrackingEventEntity[]>;
  truncate(): Promise<void>;
  findSessions(params: FindSessionsParams): Promise<FindSessionsResult>;
  findSessionEvents(sessionId: string): Promise<TrackingEventEntity[]>;
  findSessionDetails(sessionId: string, timeoutMinutes?: number): Promise<any | null>;
}
