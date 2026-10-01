import React from 'react';
import { Edit2, Trash2, ExternalLink } from 'lucide-react';
import type { PortalSystem } from '@shared/api.interface';
import { getIcon } from '../icon-map';
import { Button } from '@client/src/components/ui/button';

interface SystemCardProps {
  system: PortalSystem;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const SystemCard: React.FC<SystemCardProps> = ({
  system,
  isAdmin = false,
  onEdit,
  onDelete,
}) => {
  const Icon = getIcon(system.icon);

  const handleClick = (): void => {
    window.open(system.url, '_blank');
  };

  const handleEdit = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleDelete = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <div
      onClick={handleClick}
      className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30"
    >
      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-primary"
            onClick={handleEdit}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0 pr-8">
          <h3 className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
            {system.name}
            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
        </div>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2rem]">
        {system.description || '暂无描述'}
      </p>
    </div>
  );
};

export default SystemCard;
