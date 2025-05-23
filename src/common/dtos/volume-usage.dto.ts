import {
  IsString,
  IsInt,
  Min,
  Max,
  IsUUID,
  IsNumber,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VolumeUsageSearchRequestDto {
  @IsString()
  from: string; // ISO 8601 date string, e.g., '2023-01-01T00:00:00Z'

  @IsString()
  to: string; // ISO 8601 date string

  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  domainIds: string[];
}

export class DomainVolumeUsageDto {
  @IsUUID()
  domainId: string; // The ID of the domain

  @IsString()
  domainName: string; // The name of the domain, denormalized for convenience

  @IsInt()
  @Min(0)
  emailVolume: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  spfPassRatio: number; // 0-100

  @IsNumber()
  @Min(0)
  @Max(100)
  dmarcPassRatio: number; // 0-100
}

export class VolumeUsageSearchResponseDto {
  @Type(() => DomainVolumeUsageDto)
  @IsArray()
  data: DomainVolumeUsageDto[];
}
