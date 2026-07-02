import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { HealthResponseDto } from './health-response.dto';

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService) {}

  getHealth(): HealthResponseDto {
    return {
      success: true,
      service: this.configService.getOrThrow<string>('app.serviceName'),
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
