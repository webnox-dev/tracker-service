import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from './config/configuration';
import { validateEnvironment } from './config/environment.validation';
import { HealthModule } from './health/health.module';
import { HomeModule } from './home/home.module';
import { PrismaModule } from './prisma/prisma.module';
import { SitesModule } from './sites/sites.module';
import { TrackerModule } from './tracker/tracker.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validate: validateEnvironment,
    }),
    HomeModule,
    PrismaModule,
    HealthModule,
    TrackerModule,
    SitesModule,
  ],
})
export class AppModule {}

