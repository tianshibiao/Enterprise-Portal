export interface PortalCategory {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
}

export interface PortalSystem {
  id: string;
  name: string;
  url: string;
  icon: string;
  categoryId: string;
  description: string;
  sortOrder: number;
}

export interface PortalSystemsByCategory {
  category: PortalCategory;
  systems: PortalSystem[];
}

export interface PortalListResponse {
  categories: PortalCategory[];
  systemsByCategory: PortalSystemsByCategory[];
}

export interface CreateCategoryRequest {
  name: string;
  icon?: string;
  sortOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  icon?: string;
  sortOrder?: number;
}

export interface CreateSystemRequest {
  name: string;
  url: string;
  icon?: string;
  categoryId: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdateSystemRequest {
  name?: string;
  url?: string;
  icon?: string;
  categoryId?: string;
  description?: string;
  sortOrder?: number;
}

export interface SearchSystemRequest {
  keyword: string;
}

export interface SearchSystemResponse {
  items: PortalSystem[];
}
