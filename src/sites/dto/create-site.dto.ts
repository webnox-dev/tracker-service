import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

function normalizeString(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class CreateSiteDto {
  @ApiProperty({ example: 'My Website', maxLength: 255 })
  @Transform(({ value }) => normalizeString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: 'example.com', maxLength: 255 })
  @Transform(({ value }) => normalizeString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  domain!: string;

  @ApiPropertyOptional({ example: 'This is my personal website' })
  @Transform(({ value }) => normalizeString(value))
  @IsOptional()
  @IsString()
  description?: string;
}
