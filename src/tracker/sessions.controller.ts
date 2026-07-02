import { Controller, Get, Query, Param, HttpStatus, HttpCode, NotFoundException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TrackerService } from './tracker.service';

@ApiTags('tracker-sessions')
@Controller('api/v1/sessions')
export class SessionsController {
  constructor(private readonly trackerService: TrackerService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List visitor sessions grouped from tracking events' })
  async getSessions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('websiteId') websiteId?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('timeoutMinutes') timeoutMinutes?: string,
  ) {
    return this.trackerService.findSessions({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      startDate,
      endDate,
      websiteId,
      sortBy,
      sortOrder,
      timeoutMinutes: timeoutMinutes ? parseInt(timeoutMinutes, 10) : undefined,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get detailed statistics and info for a single session' })
  async getSessionDetails(
    @Param('id') id: string,
    @Query('timeoutMinutes') timeoutMinutes?: string,
  ) {
    const details = await this.trackerService.findSessionDetails(
      id,
      timeoutMinutes ? parseInt(timeoutMinutes, 10) : undefined,
    );
    if (!details) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }
    return details;
  }

  @Get(':id/events')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get chronological tracking events for a single session' })
  async getSessionEvents(@Param('id') id: string) {
    return this.trackerService.findSessionEvents(id);
  }
}
