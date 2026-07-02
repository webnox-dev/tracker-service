import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { IsJsonObject } from '../../common/validators/is-json-object.validator';
import type { JsonObject } from '../entities/tracking-event.entity';
import { TrackingEventType } from '../entities/tracking-event-type.enum';

function normalizeString(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeEventType(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  return value.trim().toLowerCase();
}

export class CreateTrackingEventDto {
  @ApiProperty({ example: '11111111-1111-4111-8111-111111111111' })
  @Transform(({ value }) => normalizeString(value))
  @IsUUID('4')
  anonymousId!: string;

  @ApiProperty({ example: '22222222-2222-4222-8222-222222222222' })
  @Transform(({ value }) => normalizeString(value))
  @IsUUID('4')
  sessionId!: string;

  @ApiProperty({ example: 'demo-site', maxLength: 100 })
  @Transform(({ value }) => normalizeString(value))
  @IsString()
  @MaxLength(100)
  accountId!: string;

  @ApiProperty({
    enum: TrackingEventType,
    enumName: 'TrackingEventType',
    example: TrackingEventType.PAGE_VIEW,
  })
  @Transform(({ value }) => normalizeEventType(value))
  @IsEnum(TrackingEventType)
  eventType!: TrackingEventType;

  @ApiProperty({ example: 'https://example.com/pricing' })
  @Transform(({ value }) => normalizeString(value))
  @IsUrl({
    require_protocol: true,
  })
  url!: string;

  @ApiProperty({ example: '/pricing', maxLength: 2048 })
  @Transform(({ value }) => normalizeString(value))
  @IsString()
  @MaxLength(2048)
  path!: string;

  @ApiPropertyOptional({ example: 'Pricing', maxLength: 255 })
  @Transform(({ value }) => normalizeString(value))
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'https://google.com' })
  @Transform(({ value }) => normalizeString(value))
  @IsOptional()
  @IsUrl({
    require_protocol: true,
  })
  referrer?: string;

  @ApiProperty({ example: '2026-06-18T12:00:00.000Z', format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  timestamp!: Date;

  @ApiPropertyOptional({ example: 95, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  timeOnPage?: number;

  @ApiPropertyOptional({ example: 82, minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  scrollPercentage?: number;

  @ApiPropertyOptional({
    example: {
      browser: 'Chrome',
      device: 'Desktop',
      language: 'en',
    },
  })
  @IsOptional()
  @IsObject()
  @IsJsonObject()
  metadata?: JsonObject;
}
