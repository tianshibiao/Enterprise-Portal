import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { PortalService } from './portal.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateSystemDto } from './dto/create-system.dto';
import { UpdateSystemDto } from './dto/update-system.dto';
import type {
  PortalCategory,
  PortalSystem,
  PortalListResponse,
  SearchSystemResponse,
} from '@shared/api.interface';

@Controller('api/portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  // ---------- Categories ----------

  @Get('categories')
  async getCategories(): Promise<PortalCategory[]> {
    return this.portalService.getCategories();
  }

  @NeedLogin()
  @Post('categories')
  async createCategory(@Body() dto: CreateCategoryDto): Promise<PortalCategory> {
    return this.portalService.createCategory(dto);
  }

  @NeedLogin()
  @Patch('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<PortalCategory> {
    return this.portalService.updateCategory(id, dto);
  }

  @NeedLogin()
  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.portalService.deleteCategory(id);
  }

  // ---------- Systems ----------

  @Get('systems/grouped')
  async getSystemsGrouped(): Promise<PortalListResponse> {
    return this.portalService.getSystemsGrouped();
  }

  @Get('systems/search')
  async searchSystems(
    @Query('keyword') keyword: string,
  ): Promise<SearchSystemResponse> {
    return this.portalService.searchSystems(keyword ?? '');
  }

  @Get('systems')
  async getSystems(
    @Query('categoryId') categoryId?: string,
  ): Promise<PortalSystem[]> {
    return this.portalService.getSystems(categoryId);
  }

  @NeedLogin()
  @Post('systems')
  async createSystem(@Body() dto: CreateSystemDto): Promise<PortalSystem> {
    return this.portalService.createSystem(dto);
  }

  @NeedLogin()
  @Patch('systems/:id')
  async updateSystem(
    @Param('id') id: string,
    @Body() dto: UpdateSystemDto,
  ): Promise<PortalSystem> {
    return this.portalService.updateSystem(id, dto);
  }

  @NeedLogin()
  @Delete('systems/:id')
  async deleteSystem(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.portalService.deleteSystem(id);
  }
}
