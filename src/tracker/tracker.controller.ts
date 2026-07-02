import { Body, Controller, HttpCode, HttpStatus, Post, Get, Query, Req, Delete } from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ApiErrorResponseDto } from '../common/dto/api-error-response.dto';
import { CreateTrackingEventDto } from './dto/create-tracking-event.dto';
import { CreateTrackingEventResponseDto } from './dto/create-tracking-event-response.dto';
import { TrackerService } from './tracker.service';

@ApiTags('tracking-events')
@Controller('api/v1/events')
export class TrackerController {
  constructor(private readonly trackerService: TrackerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Receive and persist a tracking event from the JavaScript SDK',
  })
  @ApiCreatedResponse({
    description: 'Tracking event accepted and stored successfully.',
    type: CreateTrackingEventResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Payload validation failed.',
    type: ApiErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'The event could not be stored because of an internal error.',
    type: ApiErrorResponseDto,
  })
  async createEvent(
    @Body() payload: CreateTrackingEventDto,
    @Req() req: Request,
  ): Promise<CreateTrackingEventResponseDto> {
    const xForwardedFor = req.headers['x-forwarded-for'];
    let clientIp = 'unknown';
    if (xForwardedFor) {
      clientIp = (xForwardedFor as string).split(',')[0]?.trim() || 'unknown';
    } else {
      clientIp = (req.socket?.remoteAddress || req.ip || 'unknown') as string;
    }

    payload.metadata = {
      ...(payload.metadata || {}),
      ip: clientIp || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    };

    console.log('\n=================== RECEIVED TRACKING EVENT ===================');
    console.log('Account ID (API Key):', payload.accountId);
    console.log('Event Type:', payload.eventType);
    console.log('URL Path:', payload.path);
    console.log('Session ID:', payload.sessionId);
    console.log('Referrer:', payload.referrer);
    console.log('Client IP:', clientIp);
    console.log('User Agent:', req.headers['user-agent']);
    console.log('================================================================\n');

    const data = await this.trackerService.createEvent(payload);

    return {
      success: true,
      message: 'Event received successfully',
      data,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieve all tracking events',
  })
  async getEvents(@Query('accountId') accountId?: string) {
    return this.trackerService.findAll(accountId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete/Truncate all tracking events',
  })
  async truncateEvents() {
    await this.trackerService.truncate();
    return {
      success: true,
      message: 'All tracking events have been successfully truncated',
    };
  }
}
