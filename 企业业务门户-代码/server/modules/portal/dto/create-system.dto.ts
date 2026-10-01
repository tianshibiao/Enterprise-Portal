import { IsString, IsOptional, IsInt, IsUrl, Min } from 'class-validator';
import type { CreateSystemRequest } from '@shared/api.interface';

export class CreateSystemDto implements CreateSystemRequest {
  @IsString()
  name!: string;

  @IsString()
  @IsUrl({ require_tld: false })
  url!: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsString()
  categoryId!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
