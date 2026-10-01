import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import type { CreateCategoryRequest } from '@shared/api.interface';

export class CreateCategoryDto implements CreateCategoryRequest {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
