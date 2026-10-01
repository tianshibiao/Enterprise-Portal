import { Injectable, Inject, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { eq, asc, ilike, and } from 'drizzle-orm';
import { portalCategory, portalSystem } from '@server/database/schema';
import type {
  PortalCategory,
  PortalSystem,
  PortalListResponse,
  PortalSystemsByCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateSystemRequest,
  UpdateSystemRequest,
  SearchSystemResponse,
} from '@shared/api.interface';

@Injectable()
export class PortalService {
  private readonly logger = new Logger(PortalService.name);

  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  // ---------- Categories ----------

  async getCategories(): Promise<PortalCategory[]> {
    const rows = await this.db
      .select({
        id: portalCategory.id,
        name: portalCategory.name,
        icon: portalCategory.icon,
        sortOrder: portalCategory.sortOrder,
      })
      .from(portalCategory)
      .orderBy(asc(portalCategory.sortOrder), asc(portalCategory.id));
    return rows;
  }

  async createCategory(dto: CreateCategoryRequest): Promise<PortalCategory> {
    const [row] = await this.db
      .insert(portalCategory)
      .values({
        name: dto.name,
        icon: dto.icon,
        sortOrder: dto.sortOrder,
      })
      .returning({
        id: portalCategory.id,
        name: portalCategory.name,
        icon: portalCategory.icon,
        sortOrder: portalCategory.sortOrder,
      });
    return row;
  }

  async updateCategory(id: string, dto: UpdateCategoryRequest): Promise<PortalCategory> {
    const patch: Partial<typeof portalCategory.$inferInsert> = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.icon !== undefined) patch.icon = dto.icon;
    if (dto.sortOrder !== undefined) patch.sortOrder = dto.sortOrder;
    if (Object.keys(patch).length === 0) {
      throw new BadRequestException('未提供可更新字段');
    }

    const [row] = await this.db
      .update(portalCategory)
      .set(patch)
      .where(eq(portalCategory.id, id))
      .returning({
        id: portalCategory.id,
        name: portalCategory.name,
        icon: portalCategory.icon,
        sortOrder: portalCategory.sortOrder,
      });
    if (!row) throw new NotFoundException('分类不存在');
    return row;
  }

  async deleteCategory(id: string): Promise<{ success: boolean }> {
    const deleted = await this.db
      .delete(portalCategory)
      .where(eq(portalCategory.id, id))
      .returning({ id: portalCategory.id });
    if (deleted.length === 0) throw new NotFoundException('分类不存在');
    return { success: true };
  }

  // ---------- Systems ----------

  async getSystems(categoryId?: string): Promise<PortalSystem[]> {
    const where = categoryId ? eq(portalSystem.categoryId, categoryId) : undefined;
    const query = where
      ? this.db
          .select({
            id: portalSystem.id,
            name: portalSystem.name,
            url: portalSystem.url,
            icon: portalSystem.icon,
            categoryId: portalSystem.categoryId,
            description: portalSystem.description,
            sortOrder: portalSystem.sortOrder,
          })
          .from(portalSystem)
          .where(where)
          .orderBy(asc(portalSystem.sortOrder), asc(portalSystem.id))
      : this.db
          .select({
            id: portalSystem.id,
            name: portalSystem.name,
            url: portalSystem.url,
            icon: portalSystem.icon,
            categoryId: portalSystem.categoryId,
            description: portalSystem.description,
            sortOrder: portalSystem.sortOrder,
          })
          .from(portalSystem)
          .orderBy(asc(portalSystem.sortOrder), asc(portalSystem.id));
    const rows = await query;
    return rows.map((r) => ({ ...r, description: r.description ?? '' }));
  }

  async getSystemsGrouped(): Promise<PortalListResponse> {
    const [categories, systems] = await Promise.all([
      this.db
        .select({
          id: portalCategory.id,
          name: portalCategory.name,
          icon: portalCategory.icon,
          sortOrder: portalCategory.sortOrder,
        })
        .from(portalCategory)
        .orderBy(asc(portalCategory.sortOrder), asc(portalCategory.id)),
      this.db
        .select({
          id: portalSystem.id,
          name: portalSystem.name,
          url: portalSystem.url,
          icon: portalSystem.icon,
          categoryId: portalSystem.categoryId,
          description: portalSystem.description,
          sortOrder: portalSystem.sortOrder,
        })
        .from(portalSystem)
        .orderBy(asc(portalSystem.sortOrder), asc(portalSystem.id)),
    ]);

    const systemsMap = new Map<string, PortalSystem[]>();
    for (const s of systems) {
      const system: PortalSystem = { ...s, description: s.description ?? '' };
      systemsMap.set(s.categoryId, [...(systemsMap.get(s.categoryId) ?? []), system]);
    }

    const systemsByCategory: PortalSystemsByCategory[] = categories.map((c) => ({
      category: c,
      systems: systemsMap.get(c.id) ?? [],
    }));

    return { categories, systemsByCategory };
  }

  async createSystem(dto: CreateSystemRequest): Promise<PortalSystem> {
    const [row] = await this.db
      .insert(portalSystem)
      .values({
        name: dto.name,
        url: dto.url,
        icon: dto.icon,
        categoryId: dto.categoryId,
        description: dto.description,
        sortOrder: dto.sortOrder,
      })
      .returning({
        id: portalSystem.id,
        name: portalSystem.name,
        url: portalSystem.url,
        icon: portalSystem.icon,
        categoryId: portalSystem.categoryId,
        description: portalSystem.description,
        sortOrder: portalSystem.sortOrder,
      });
    return { ...row, description: row.description ?? '' };
  }

  async updateSystem(id: string, dto: UpdateSystemRequest): Promise<PortalSystem> {
    const patch: Partial<typeof portalSystem.$inferInsert> = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.url !== undefined) patch.url = dto.url;
    if (dto.icon !== undefined) patch.icon = dto.icon;
    if (dto.categoryId !== undefined) patch.categoryId = dto.categoryId;
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.sortOrder !== undefined) patch.sortOrder = dto.sortOrder;
    if (Object.keys(patch).length === 0) {
      throw new BadRequestException('未提供可更新字段');
    }

    const [row] = await this.db
      .update(portalSystem)
      .set(patch)
      .where(eq(portalSystem.id, id))
      .returning({
        id: portalSystem.id,
        name: portalSystem.name,
        url: portalSystem.url,
        icon: portalSystem.icon,
        categoryId: portalSystem.categoryId,
        description: portalSystem.description,
        sortOrder: portalSystem.sortOrder,
      });
    if (!row) throw new NotFoundException('系统不存在');
    return { ...row, description: row.description ?? '' };
  }

  async deleteSystem(id: string): Promise<{ success: boolean }> {
    const deleted = await this.db
      .delete(portalSystem)
      .where(eq(portalSystem.id, id))
      .returning({ id: portalSystem.id });
    if (deleted.length === 0) throw new NotFoundException('系统不存在');
    return { success: true };
  }

  async searchSystems(keyword: string): Promise<SearchSystemResponse> {
    if (!keyword || keyword.trim() === '') {
      return { items: [] };
    }
    const rows = await this.db
      .select({
        id: portalSystem.id,
        name: portalSystem.name,
        url: portalSystem.url,
        icon: portalSystem.icon,
        categoryId: portalSystem.categoryId,
        description: portalSystem.description,
        sortOrder: portalSystem.sortOrder,
      })
      .from(portalSystem)
      .where(ilike(portalSystem.name, `%${keyword}%`))
      .orderBy(asc(portalSystem.sortOrder), asc(portalSystem.id));
    return { items: rows.map((r) => ({ ...r, description: r.description ?? '' })) };
  }
}
