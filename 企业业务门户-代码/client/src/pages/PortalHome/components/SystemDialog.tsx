import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@client/src/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@client/src/components/ui/form';
import { Input } from '@client/src/components/ui/input';
import { Button } from '@client/src/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import { Textarea } from '@client/src/components/ui/textarea';
import type { PortalCategory, PortalSystem } from '@shared/api.interface';
import { ICON_NAMES, getIcon } from '../icon-map';

const formSchema = z.object({
  name: z.string().min(1, '请输入系统名称'),
  url: z
    .string()
    .min(1, '请输入访问地址')
    .url('请输入有效的 URL 地址'),
  icon: z.string().min(1, '请选择图标'),
  categoryId: z.string().min(1, '请选择所属分类'),
  description: z.string().optional(),
  sortOrder: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^-?\d+$/.test(val),
      '排序必须为整数',
    ),
});

type FormValues = z.infer<typeof formSchema>;

interface SystemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: PortalCategory[];
  system?: PortalSystem | null;
  onSubmit: (data: {
    name: string;
    url: string;
    icon: string;
    categoryId: string;
    description?: string;
    sortOrder?: number;
  }) => void;
}

const SystemDialog: React.FC<SystemDialogProps> = ({
  open,
  onOpenChange,
  categories,
  system = null,
  onSubmit,
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      url: '',
      icon: 'Globe',
      categoryId: categories[0]?.id ?? '',
      description: '',
      sortOrder: '0',
    },
  });

  useEffect(() => {
    if (open) {
      if (system) {
        form.reset({
          name: system.name,
          url: system.url,
          icon: system.icon || 'Globe',
          categoryId: system.categoryId,
          description: system.description || '',
          sortOrder: String(system.sortOrder ?? '0'),
        });
      } else {
        form.reset({
          name: '',
          url: '',
          icon: 'Globe',
          categoryId: categories[0]?.id ?? '',
          description: '',
          sortOrder: '0',
        });
      }
    }
  }, [open, system, categories, form]);

  const handleSubmit = (values: FormValues): void => {
    onSubmit({
      name: values.name,
      url: values.url,
      icon: values.icon,
      categoryId: values.categoryId,
      description: values.description || undefined,
      sortOrder:
        values.sortOrder !== undefined && values.sortOrder !== ''
          ? parseInt(values.sortOrder, 10)
          : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{system ? '编辑系统入口' : '新增系统入口'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>系统名称 *</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入系统名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>访问地址 *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>图标 *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="选择图标" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ICON_NAMES.map((name: string) => {
                          const Icon = getIcon(name);
                          return (
                            <SelectItem key={name} value={name}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span className="text-xs">{name}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>所属分类 *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="选择分类" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat: PortalCategory) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>简介</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="系统简介（选填）"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>排序</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button type="submit">
                {system ? '保存' : '创建'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SystemDialog;
