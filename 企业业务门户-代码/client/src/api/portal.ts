import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  PortalCategory,
  PortalSystem,
  PortalListResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateSystemRequest,
  UpdateSystemRequest,
  SearchSystemResponse,
} from '@shared/api.interface';

const BASE = '/api/portal';

export async function getCategories(): Promise<PortalCategory[]> {
  try {
    const { data } = await axiosForBackend.get<PortalCategory[]>(
      `${BASE}/categories`,
    );
    return data;
  } catch (err) {
    logger.error('获取分类列表失败', err);
    throw err;
  }
}

export async function getSystemsGrouped(): Promise<PortalListResponse> {
  try {
    const { data } = await axiosForBackend.get<PortalListResponse>(
      `${BASE}/systems/grouped`,
    );
    return data;
  } catch (err) {
    logger.error('获取系统分组列表失败', err);
    throw err;
  }
}

export async function getSystems(categoryId?: string): Promise<PortalSystem[]> {
  try {
    const { data } = await axiosForBackend.get<PortalSystem[]>(
      `${BASE}/systems`,
      { params: categoryId ? { categoryId } : undefined },
    );
    return data;
  } catch (err) {
    logger.error('获取系统列表失败', err);
    throw err;
  }
}

export async function createCategory(
  data: CreateCategoryRequest,
): Promise<PortalCategory> {
  try {
    const res = await axiosForBackend.post<PortalCategory>(
      `${BASE}/categories`,
      data,
    );
    return res.data;
  } catch (err) {
    logger.error('创建分类失败', err);
    throw err;
  }
}

export async function updateCategory(
  id: string,
  data: UpdateCategoryRequest,
): Promise<PortalCategory> {
  try {
    const res = await axiosForBackend.patch<PortalCategory>(
      `${BASE}/categories/${id}`,
      data,
    );
    return res.data;
  } catch (err) {
    logger.error('更新分类失败', err);
    throw err;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await axiosForBackend.delete(`${BASE}/categories/${id}`);
  } catch (err) {
    logger.error('删除分类失败', err);
    throw err;
  }
}

export async function createSystem(
  data: CreateSystemRequest,
): Promise<PortalSystem> {
  try {
    const res = await axiosForBackend.post<PortalSystem>(
      `${BASE}/systems`,
      data,
    );
    return res.data;
  } catch (err) {
    logger.error('创建系统入口失败', err);
    throw err;
  }
}

export async function updateSystem(
  id: string,
  data: UpdateSystemRequest,
): Promise<PortalSystem> {
  try {
    const res = await axiosForBackend.patch<PortalSystem>(
      `${BASE}/systems/${id}`,
      data,
    );
    return res.data;
  } catch (err) {
    logger.error('更新系统入口失败', err);
    throw err;
  }
}

export async function deleteSystem(id: string): Promise<void> {
  try {
    await axiosForBackend.delete(`${BASE}/systems/${id}`);
  } catch (err) {
    logger.error('删除系统入口失败', err);
    throw err;
  }
}

export async function searchSystems(keyword: string): Promise<SearchSystemResponse> {
  try {
    const { data } = await axiosForBackend.get<SearchSystemResponse>(
      `${BASE}/systems/search`,
      { params: { keyword } },
    );
    return data;
  } catch (err) {
    logger.error('搜索系统失败', err);
    throw err;
  }
}
