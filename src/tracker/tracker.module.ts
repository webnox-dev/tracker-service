import { Module } from '@nestjs/common';

import { TRACKING_EVENT_REPOSITORY } from './interfaces/tracking-event-repository.interface';
import { TrackerController } from './tracker.controller';
import { SessionsController } from './sessions.controller';
import { PrismaTrackingEventRepository } from './tracker.repository';
import { TrackerService } from './tracker.service';

@Module({
  controllers: [TrackerController, SessionsController],
  providers: [
    TrackerService,
    PrismaTrackingEventRepository,
    {
      provide: TRACKING_EVENT_REPOSITORY,
      useExisting: PrismaTrackingEventRepository,
    },
  ],
})
export class TrackerModule {}
