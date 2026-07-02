import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

function normalizeString(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class UpdateSiteDto {
  @ApiPropertyOptional({ example: 'My Website Updated', maxLength: 255 })
  @Transform(({ value }) => normalizeString(value))
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'updated-example.com', maxLength: 255 })
  @Transform(({ value }) => normalizeString(value))
  @IsOptional()
  @IsString()
  @MaxLength(255)
  domain?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @Transform(({ value }) => normalizeString(value))
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'enabled', enum: ['enabled', 'disabled'] })
  @Transform(({ value }) => normalizeString(value))
  @IsOptional()
  @IsString()
  @IsIn(['enabled', 'disabled'])
  status?: string;
}
