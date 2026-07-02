import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'tracker-service' })
  service!: string;

  @ApiProperty({ example: 'healthy' })
  status!: string;

  @ApiProperty({ example: '2026-06-27T09:30:00.000Z' })
  timestamp!: string;
}
