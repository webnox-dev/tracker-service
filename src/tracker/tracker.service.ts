import { Inject, Injectable, Logger } from '@nestjs/common';

import { CreateTrackingEventDto } from './dto/create-tracking-event.dto';
import { TrackingEventCreatedDataDto } from './dto/create-tracking-event-response.dto';
import { TrackingEventEntity } from './entities/tracking-event.entity';
import type {
  TrackingEventRepository,
  FindSessionsParams,
  FindSessionsResult,
} from './interfaces/tracking-event-repository.interface';
import { TRACKING_EVENT_REPOSITORY } from './interfaces/tracking-event-repository.interface';

@Injectable()
export class TrackerService {
  private readonly logger = new Logger(TrackerService.name);

  constructor(
    @Inject(TRACKING_EVENT_REPOSITORY)
    private readonly trackingEventRepository: TrackingEventRepository,
  ) {}

  async createEvent(payload: CreateTrackingEventDto): Promise<TrackingEventCreatedDataDto> {
    const event = await this.trackingEventRepository.create({
      anonymousId: payload.anonymousId,
      sessionId: payload.sessionId,
      accountId: payload.accountId,
      eventType: payload.eventType,
      url: payload.url,
      path: payload.path,
      title: payload.title ?? null,
      referrer: payload.referrer ?? null,
      timestamp: payload.timestamp,
      timeOnPage: payload.timeOnPage ?? null,
      scrollPercentage: payload.scrollPercentage ?? null,
      metadata: payload.metadata ?? null,
    });

    this.logger.log(
      `Tracking event stored for account ${event.accountId} with id ${event.id} and type ${event.eventType}`,
    );

    return {
      id: event.id,
    };
  }

  async findAll(accountId?: string): Promise<TrackingEventEntity[]> {
    return this.trackingEventRepository.findAll(accountId);
  }

  async truncate(): Promise<void> {
    await this.trackingEventRepository.truncate();
  }

  async findSessions(params: FindSessionsParams): Promise<FindSessionsResult> {
    return this.trackingEventRepository.findSessions(params);
  }

  async findSessionEvents(sessionId: string): Promise<TrackingEventEntity[]> {
    return this.trackingEventRepository.findSessionEvents(sessionId);
  }

  async findSessionDetails(sessionId: string, timeoutMinutes?: number): Promise<any | null> {
    return this.trackingEventRepository.findSessionDetails(sessionId, timeoutMinutes);
  }
}
