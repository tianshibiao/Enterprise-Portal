import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { Search, Settings, Plus, X, Sparkles } from 'lucide-react';
import type {
  PortalCategory,
  PortalSystem,
  PortalListResponse,
} from '@shared/api.interface';
import * as portalApi from '@client/src/api/portal';
import { Input } from '@client/src/components/ui/input';
import { Button } from '@client/src/components/ui/button';
import CategorySidebar from './components/CategorySidebar';
import SystemCard from './components/SystemCard';
import SystemDialog from './components/SystemDialog';
import CategoryDialog from './components/CategoryDialog';
import ConfirmDialog from './components/ConfirmDialog';
import { getIcon } from './icon-map';

const PortalHome: React.FC = () => {
  const [categories, setCategories] = useState<PortalCategory[]>([]);
  const [systemsByCategory, setSystemsByCategory] = useState<
    { category: PortalCategory; systems: PortalSystem[] }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [searchResults, setSearchResults] = useState<PortalSystem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Dialogs
  const [systemDialogOpen, setSystemDialogOpen] = useState<boolean>(false);
  const [editingSystem, setEditingSystem] = useState<PortalSystem | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] =
    useState<PortalCategory | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description?: string;
    onConfirm: () => void;
  }>({ open: false, title: '', onConfirm: () => {} });

  // Load all data
  const loadData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const data: PortalListResponse = await portalApi.getSystemsGrouped();
      setCategories(data.categories);
      setSystemsByCategory(data.systemsByCategory);
    } catch (err) {
      logger.error('加载门户数据失败', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Debounced search
  useEffect(() => {
    if (!searchKeyword.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await portalApi.searchSystems(searchKeyword.trim());
        setSearchResults(res.items);
      } catch (err) {
        logger.error('搜索失败', err);
        setSearchResults([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // All systems flat list (for "all" category and search fallback)
  const allSystems = useMemo<PortalSystem[]>(() => {
    return systemsByCategory.flatMap(
      (g) => g.systems,
    );
  }, [systemsByCategory]);

  // Display systems based on active category
  const displaySystems = useMemo<PortalSystem[]>(() => {
    if (activeCategory === 'all') return allSystems;
    const group = systemsByCategory.find(
      (g) => g.category.id === activeCategory,
    );
    return group?.systems ?? [];
  }, [activeCategory, allSystems, systemsByCategory]);

  const activeCategoryName = useMemo<string>(() => {
    if (activeCategory === 'all') return '全部系统';
    const cat = categories.find((c) => c.id === activeCategory);
    return cat?.name ?? '全部系统';
  }, [activeCategory, categories]);

  const activeCategoryIcon = useMemo<string>(() => {
    if (activeCategory === 'all') return 'LayoutGrid';
    const cat = categories.find((c) => c.id === activeCategory);
    return cat?.icon ?? 'Globe';
  }, [activeCategory, categories]);

  // Category CRUD
  const handleAddCategory = (): void => {
    setEditingCategory(null);
    setCategoryDialogOpen(true);
  };

  const handleEditCategory = (cat: PortalCategory): void => {
    setEditingCategory(cat);
    setCategoryDialogOpen(true);
  };

  const handleDeleteCategory = (cat: PortalCategory): void => {
    setConfirmDialog({
      open: true,
      title: '删除分类',
      description: `确定要删除分类「${cat.name}」吗？该分类下的所有系统入口也将被删除。`,
      onConfirm: async () => {
        try {
          await portalApi.deleteCategory(cat.id);
          if (activeCategory === cat.id) {
            setActiveCategory('all');
          }
          await loadData();
        } catch (err) {
          logger.error('删除分类失败', err);
        }
      },
    });
  };

  const handleCategorySubmit = async (data: {
    name: string;
    icon: string;
    sortOrder?: number;
  }): Promise<void> => {
    try {
      if (editingCategory) {
        await portalApi.updateCategory(editingCategory.id, data);
      } else {
        await portalApi.createCategory(data);
      }
      await loadData();
    } catch (err) {
      logger.error('保存分类失败', err);
    }
  };

  // System CRUD
  const handleAddSystem = (): void => {
    setEditingSystem(null);
    setSystemDialogOpen(true);
  };

  const handleEditSystem = (system: PortalSystem): void => {
    setEditingSystem(system);
    setSystemDialogOpen(true);
  };

  const handleDeleteSystem = (system: PortalSystem): void => {
    setConfirmDialog({
      open: true,
      title: '删除系统入口',
      description: `确定要删除系统「${system.name}」吗？`,
      onConfirm: async () => {
        try {
          await portalApi.deleteSystem(system.id);
          await loadData();
        } catch (err) {
          logger.error('删除系统失败', err);
        }
      },
    });
  };

  const handleSystemSubmit = async (data: {
    name: string;
    url: string;
    icon: string;
    categoryId: string;
    description?: string;
    sortOrder?: number;
  }): Promise<void> => {
    try {
      if (editingSystem) {
        await portalApi.updateSystem(editingSystem.id, data);
      } else {
        await portalApi.createSystem(data);
      }
      await loadData();
    } catch (err) {
      logger.error('保存系统入口失败', err);
    }
  };

  const showSearchResults = searchKeyword.trim().length > 0;

  return (
    <div className="flex h-screen w-full flex-col bg-muted/30">
      {/* Header */}
      <header className="flex items-center gap-4 border-b border-border bg-card px-6 py-3 shadow-sm z-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <h1 className="text-base font-semibold text-foreground">
            业务系统门户
          </h1>
        </div>

        <div className="flex-1 max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索系统名称、描述..."
            value={searchKeyword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchKeyword(e.target.value)
            }
            className="pl-9 pr-9 bg-muted/50"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isAdmin ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsAdmin(!isAdmin)}
            className="gap-1.5"
          >
            <Settings className="h-4 w-4" />
            {isAdmin ? '退出管理' : '管理入口'}
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <CategorySidebar
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          isAdmin={isAdmin}
          onAddCategory={handleAddCategory}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              加载中...
            </div>
          ) : showSearchResults ? (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                  搜索结果
                </h2>
                <span className="text-sm text-muted-foreground">
                  共 {searchResults.length} 个结果
                </span>
              </div>
              {searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Search className="h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm">未找到相关系统</p>
                </div>
              ) : (
                <div
                  className="grid gap-4
                    grid-cols-2
                    md:grid-cols-3
                    lg:grid-cols-4"
                >
                  {searchResults.map((system: PortalSystem) => (
                    <SystemCard
                      key={system.id}
                      system={system}
                      isAdmin={isAdmin}
                      onEdit={() => handleEditSystem(system)}
                      onDelete={() => handleDeleteSystem(system)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {React.createElement(getIcon(activeCategoryIcon), {
                    className: 'h-5 w-5 text-primary',
                  })}
                  <h2 className="text-lg font-semibold text-foreground">
                    {activeCategoryName}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {displaySystems.length} 个系统
                  </span>
                </div>
                {isAdmin && (
                  <Button size="sm" onClick={handleAddSystem} className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    新增系统
                  </Button>
                )}
              </div>

              {displaySystems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  {React.createElement(getIcon(activeCategoryIcon), {
                    className: 'h-10 w-10 mb-3 opacity-30',
                  })}
                  <p className="text-sm">暂无系统入口</p>
                </div>
              ) : (
                <div
                  className="grid gap-4
                    grid-cols-2
                    md:grid-cols-3
                    lg:grid-cols-4"
                  data-ai-section-type="card-list"
                >
                  {displaySystems.map((system: PortalSystem) => (
                    <SystemCard
                      key={system.id}
                      system={system}
                      isAdmin={isAdmin}
                      onEdit={() => handleEditSystem(system)}
                      onDelete={() => handleDeleteSystem(system)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Dialogs */}
      <SystemDialog
        open={systemDialogOpen}
        onOpenChange={setSystemDialogOpen}
        categories={categories}
        system={editingSystem}
        onSubmit={handleSystemSubmit}
      />

      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        category={editingCategory}
        onSubmit={handleCategorySubmit}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText="确认删除"
        variant="destructive"
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
};

export default PortalHome;
