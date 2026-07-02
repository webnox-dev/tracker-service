import { ApiProperty } from '@nestjs/swagger';

export class TrackingEventCreatedDataDto {
  @ApiProperty({ example: 'a7c783f5-e24f-4d04-96c4-f0466d1e55fd' })
  id!: string;
}

export class CreateTrackingEventResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Event received successfully' })
  message!: string;

  @ApiProperty({ type: TrackingEventCreatedDataDto })
  data!: TrackingEventCreatedDataDto;
}
