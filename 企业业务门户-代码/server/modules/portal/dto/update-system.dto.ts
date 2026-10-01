import { IsString, IsOptional, IsInt, IsUrl, Min } from 'class-validator';
import type { UpdateSystemRequest } from '@shared/api.interface';

export class UpdateSystemDto implements UpdateSystemRequest {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  url?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
