import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponseDto {
  @ApiProperty({ example: false })
  success!: boolean;

  @ApiProperty({ example: 'Validation Failed' })
  message!: string;

  @ApiProperty({
    type: [String],
    example: ['eventType must be one of the supported values'],
  })
  errors!: string[];
}
