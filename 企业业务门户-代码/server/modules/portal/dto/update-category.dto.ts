import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import type { UpdateCategoryRequest } from '@shared/api.interface';

export class UpdateCategoryDto implements UpdateCategoryRequest {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
