import { Injectable, Logger } from '@nestjs/common';
import { Prisma, TrackingEventType as PrismaTrackingEventType } from '@prisma/client';

import { DatabaseOperationException } from '../common/exceptions/database-operation.exception';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTrackingEventInput,
  JsonObject,
  TrackingEventEntity,
} from './entities/tracking-event.entity';
import { TrackingEventType } from './entities/tracking-event-type.enum';
import {
  FindSessionsParams,
  FindSessionsResult,
  SessionListItem,
  TrackingEventRepository,
} from './interfaces/tracking-event-repository.interface';

function toPrismaEventType(eventType: TrackingEventType): PrismaTrackingEventType {
  switch (eventType) {
    case TrackingEventType.PAGE_VIEW:
      return PrismaTrackingEventType.PAGE_VIEW;
    case TrackingEventType.CLICK:
      return PrismaTrackingEventType.CLICK;
    case TrackingEventType.FORM_SUBMIT:
      return PrismaTrackingEventType.FORM_SUBMIT;
    case TrackingEventType.DOWNLOAD:
      return PrismaTrackingEventType.DOWNLOAD;
    case TrackingEventType.VIDEO_PLAY:
      return PrismaTrackingEventType.VIDEO_PLAY;
    case TrackingEventType.CUSTOM:
      return PrismaTrackingEventType.CUSTOM;
  }
}

function toDomainEventType(eventType: PrismaTrackingEventType): TrackingEventType {
  switch (eventType) {
    case PrismaTrackingEventType.PAGE_VIEW:
      return TrackingEventType.PAGE_VIEW;
    case PrismaTrackingEventType.CLICK:
      return TrackingEventType.CLICK;
    case PrismaTrackingEventType.FORM_SUBMIT:
      return TrackingEventType.FORM_SUBMIT;
    case PrismaTrackingEventType.DOWNLOAD:
      return TrackingEventType.DOWNLOAD;
    case PrismaTrackingEventType.VIDEO_PLAY:
      return TrackingEventType.VIDEO_PLAY;
    case PrismaTrackingEventType.CUSTOM:
      return TrackingEventType.CUSTOM;
  }
}

function toPrismaMetadata(
  metadata: JsonObject | null,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  if (metadata === null) {
    return Prisma.DbNull;
  }

  return metadata;
}

@Injectable()
export class PrismaTrackingEventRepository implements TrackingEventRepository {
  private readonly logger = new Logger(PrismaTrackingEventRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateTrackingEventInput): Promise<TrackingEventEntity> {
    try {
      const createdEvent = await this.prisma.trackingEvent.create({
        data: {
          anonymousId: payload.anonymousId,
          sessionId: payload.sessionId,
          accountId: payload.accountId,
          eventType: toPrismaEventType(payload.eventType),
          url: payload.url,
          path: payload.path,
          title: payload.title,
          referrer: payload.referrer,
          timestamp: payload.timestamp,
          timeOnPage: payload.timeOnPage,
          scrollPercentage: payload.scrollPercentage,
          metadata: toPrismaMetadata(payload.metadata),
        },
      });

      return {
        id: createdEvent.id,
        anonymousId: createdEvent.anonymousId,
        sessionId: createdEvent.sessionId,
        accountId: createdEvent.accountId,
        eventType: toDomainEventType(createdEvent.eventType),
        url: createdEvent.url,
        path: createdEvent.path,
        title: createdEvent.title,
        referrer: createdEvent.referrer,
        timestamp: createdEvent.timestamp,
        timeOnPage: createdEvent.timeOnPage,
        scrollPercentage: createdEvent.scrollPercentage,
        metadata: createdEvent.metadata as JsonObject | null,
        createdAt: createdEvent.createdAt,
      };
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError ||
        error instanceof Prisma.PrismaClientUnknownRequestError ||
        error instanceof Prisma.PrismaClientInitializationError ||
        error instanceof Prisma.PrismaClientRustPanicError
      ) {
        this.logger.error(
          `Database error while creating tracking event for account ${payload.accountId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error instanceof Error ? error.stack : undefined,
        );
      } else if (error instanceof Error) {
        this.logger.error(
          `Unexpected database error while creating tracking event for account ${payload.accountId}: ${error.message}`,
          error.stack,
        );
      }

      throw new DatabaseOperationException();
    }
  }

  async findAll(accountId?: string): Promise<TrackingEventEntity[]> {
    try {
      const events = await this.prisma.trackingEvent.findMany({
        where: accountId ? { accountId } : undefined,
        orderBy: { createdAt: 'desc' },
      });

      return events.map((event) => ({
        id: event.id,
        anonymousId: event.anonymousId,
        sessionId: event.sessionId,
        accountId: event.accountId,
        eventType: toDomainEventType(event.eventType),
        url: event.url,
        path: event.path,
        title: event.title,
        referrer: event.referrer,
        timestamp: event.timestamp,
        timeOnPage: event.timeOnPage,
        scrollPercentage: event.scrollPercentage,
        metadata: event.metadata as JsonObject | null,
        createdAt: event.createdAt,
      }));
    } catch (error: unknown) {
      this.logger.error(
        `Database error while fetching tracking events: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseOperationException();
    }
  }

  async truncate(): Promise<void> {
    try {
      await this.prisma.trackingEvent.deleteMany();
    } catch (error: unknown) {
      this.logger.error(
        `Database error while truncating tracking events: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseOperationException();
    }
  }

  async findSessions(params: FindSessionsParams): Promise<FindSessionsResult> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 10;
      const offset = (page - 1) * limit;
      const search = params.search;
      const startDate = params.startDate;
      const endDate = params.endDate;
      const websiteId = params.websiteId;
      const sortBy = params.sortBy || 'startedAt';
      const sortOrder = params.sortOrder || 'desc';
      const timeoutMinutes = params.timeoutMinutes || 30;

      let whereClause = 'WHERE 1=1';
      const queryParams: any[] = [];
      let paramIndex = 1;

      if (startDate) {
        whereClause += ` AND te."timestamp" >= $${paramIndex}`;
        queryParams.push(new Date(startDate));
        paramIndex++;
      }

      if (endDate) {
        whereClause += ` AND te."timestamp" <= $${paramIndex}`;
        queryParams.push(new Date(endDate));
        paramIndex++;
      }

      if (websiteId) {
        whereClause += ` AND (st."id"::text = $${paramIndex} OR te."accountId" = $${paramIndex})`;
        queryParams.push(websiteId);
        paramIndex++;
      }

      if (search) {
        whereClause += ` AND (
          st."name" ILIKE $${paramIndex} OR
          st."domain" ILIKE $${paramIndex} OR
          te."sessionId"::text ILIKE $${paramIndex} OR
          te."anonymousId"::text ILIKE $${paramIndex} OR
          te."path" ILIKE $${paramIndex}
        )`;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      const activeThresholdMs = timeoutMinutes * 60 * 1000;

      const sortFieldMap: Record<string, string> = {
        sessionId: 's."sessionId"',
        anonymousId: 's."anonymousId"',
        startedAt: 's."startedAt"',
        endedAt: 's."endedAt"',
        duration: 's."duration"',
        totalEvents: 's."totalEvents"',
        totalPageViews: 's."totalPageViews"',
      };

      const orderField = sortFieldMap[sortBy] || 's."startedAt"';
      const orderDir = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      const query = `
        WITH filtered_events AS (
          SELECT 
            te.*,
            st."name" as "siteName",
            st."domain" as "siteDomain"
          FROM "tracking_events" te
          LEFT JOIN "sites" st ON te."accountId" = st."apiKey"
          ${whereClause}
        ),
        session_agg AS (
          SELECT 
            "sessionId",
            "anonymousId",
            "accountId",
            "siteName",
            "siteDomain",
            MIN("timestamp") as "startedAt",
            MAX("timestamp") as "endedAt",
            EXTRACT(EPOCH FROM (MAX("timestamp") - MIN("timestamp")))::INTEGER as "duration",
            COUNT(*) as "totalEvents",
            COUNT(CASE WHEN "eventType" = 'PAGE_VIEW' THEN 1 END) as "totalPageViews"
          FROM filtered_events
          GROUP BY "sessionId", "anonymousId", "accountId", "siteName", "siteDomain"
        ),
        session_latest_event AS (
          SELECT DISTINCT ON ("sessionId")
            "sessionId",
            "path" as "exitPage"
          FROM filtered_events
          ORDER BY "sessionId", "timestamp" DESC
        )
        SELECT 
          s.*,
          l."exitPage",
          COUNT(*) OVER() as "totalCount"
        FROM session_agg s
        JOIN session_latest_event l ON s."sessionId" = l."sessionId"
        ORDER BY ${orderField} ${orderDir}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(limit, offset);

      const rows = await this.prisma.$queryRawUnsafe<any[]>(query, ...queryParams);

      const total = rows.length > 0 ? Number(rows[0].totalCount) : 0;
      const now = new Date();

      const sessions: SessionListItem[] = rows.map((row) => {
        const endedAt = new Date(row.endedAt);
        const isActive = now.getTime() - endedAt.getTime() < activeThresholdMs;

        return {
          sessionId: row.sessionId,
          anonymousId: row.anonymousId,
          accountId: row.accountId,
          siteName: row.siteName,
          siteDomain: row.siteDomain,
          startedAt: new Date(row.startedAt),
          endedAt,
          duration: row.duration,
          totalEvents: Number(row.totalEvents),
          totalPageViews: Number(row.totalPageViews),
          exitPage: row.exitPage,
          status: isActive ? 'active' : 'completed',
        };
      });

      return { sessions, total };
    } catch (error: unknown) {
      this.logger.error(
        `Database error in findSessions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseOperationException();
    }
  }

  async findSessionEvents(sessionId: string): Promise<TrackingEventEntity[]> {
    try {
      const events = await this.prisma.trackingEvent.findMany({
        where: { sessionId },
        orderBy: { timestamp: 'asc' },
      });

      return events.map((event) => ({
        id: event.id,
        anonymousId: event.anonymousId,
        sessionId: event.sessionId,
        accountId: event.accountId,
        eventType: toDomainEventType(event.eventType),
        url: event.url,
        path: event.path,
        title: event.title,
        referrer: event.referrer,
        timestamp: event.timestamp,
        timeOnPage: event.timeOnPage,
        scrollPercentage: event.scrollPercentage,
        metadata: event.metadata as JsonObject | null,
        createdAt: event.createdAt,
      }));
    } catch (error: unknown) {
      this.logger.error(
        `Database error in findSessionEvents for session ${sessionId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseOperationException();
    }
  }

  async findSessionDetails(sessionId: string, timeoutMinutes: number = 30): Promise<any | null> {
    try {
      const events = await this.findSessionEvents(sessionId);
      const firstEvent = events[0];
      const lastEvent = events[events.length - 1];
      if (!firstEvent || !lastEvent) {
        return null;
      }

      const accountId = firstEvent.accountId;
      const site = await this.prisma.site.findUnique({
        where: { apiKey: accountId },
      });

      const startedAt = firstEvent.timestamp;
      const endedAt = lastEvent.timestamp;
      const duration = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000);

      const now = new Date();
      const isActive = now.getTime() - endedAt.getTime() < timeoutMinutes * 60 * 1000;

      const totalEvents = events.length;
      const totalPageViews = events.filter((e) => e.eventType === TrackingEventType.PAGE_VIEW).length;
      const totalClicks = events.filter((e) => e.eventType === TrackingEventType.CLICK).length;
      
      const uniquePaths = new Set(events.map((e) => e.path));
      const bounceSession = uniquePaths.size === 1 && totalPageViews === 1;

      const exitPage = lastEvent.path;

      const timeOnPageValues = events
        .map((e) => e.timeOnPage)
        .filter((v): v is number => v !== null && v !== undefined);
      const averageTimeOnPage = timeOnPageValues.length > 0
        ? Math.round(timeOnPageValues.reduce((sum, v) => sum + v, 0) / timeOnPageValues.length)
        : null;

      const scrollPercentages = events
        .map((e) => e.scrollPercentage)
        .filter((v): v is number => v !== null && v !== undefined);
      const maximumScrollPercentage = scrollPercentages.length > 0
        ? Math.max(...scrollPercentages)
        : null;

      return {
        sessionId,
        anonymousId: firstEvent.anonymousId,
        accountId,
        website: site ? {
          name: site.name,
          domain: site.domain,
          apiKey: site.apiKey,
        } : {
          name: accountId,
          domain: '',
          apiKey: accountId,
        },
        startedAt,
        endedAt,
        duration,
        totalEvents,
        totalPageViews,
        totalClicks,
        bounceSession,
        averageTimeOnPage,
        maximumScrollPercentage,
        exitPage,
        status: isActive ? 'active' : 'completed',
      };
    } catch (error: unknown) {
      this.logger.error(
        `Database error in findSessionDetails for session ${sessionId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new DatabaseOperationException();
    }
  }
}
