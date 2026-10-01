import React from 'react';
import { Plus, Edit2, Trash2, LayoutGrid } from 'lucide-react';
import type { PortalCategory } from '@shared/api.interface';
import { getIcon } from '../icon-map';
import { Button } from '@client/src/components/ui/button';

interface CategorySidebarProps {
  categories: PortalCategory[];
  activeCategory: string | 'all';
  onSelect: (id: string | 'all') => void;
  isAdmin?: boolean;
  onAddCategory?: () => void;
  onEditCategory?: (category: PortalCategory) => void;
  onDeleteCategory?: (category: PortalCategory) => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  activeCategory,
  onSelect,
  isAdmin = false,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  return (
    <aside className="w-56 shrink-0 border-r border-border bg-card/50 p-3 flex flex-col gap-1 overflow-y-auto">
      <div className="flex items-center justify-between px-2 mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          分类
        </span>
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onAddCategory}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <button
        onClick={() => onSelect('all')}
        className={`group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
          activeCategory === 'all'
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-foreground hover:bg-accent'
        }`}
      >
        <LayoutGrid className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">全部</span>
      </button>

      {categories.map((cat: PortalCategory) => {
        const Icon = getIcon(cat.icon);
        const isActive = activeCategory === cat.id;
        return (
          <div
            key={cat.id}
            className={`group relative flex items-center rounded-md transition-colors ${
              isActive ? 'bg-primary/10' : 'hover:bg-accent'
            }`}
          >
            <button
              onClick={() => onSelect(cat.id)}
              className={`flex-1 flex items-center gap-2 px-3 py-2 text-sm text-left ${
                isActive ? 'text-primary font-medium' : 'text-foreground'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{cat.name}</span>
            </button>
            {isAdmin && (
              <div className="pr-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCategory?.(cat);
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCategory?.(cat);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
};

export default CategorySidebar;
