'use client';

import {
  Field,
  selectContentClassName,
  selectItemClassName,
  selectTriggerClassName,
} from '@/components/form-sections';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useArticleOptions } from '@/hooks/use-seller-product';
import { cn } from '@/lib/utils';
import { type CreateProductInput } from '@/schemas/product.schema';
import { type ProductInventoryItem } from '@/types/product';
import { type UIEvent } from 'react';
import { type Control, Controller } from 'react-hook-form';

/** Article picker that loads more articles as the list is scrolled. */
export function ArticleSelectField({
  control,
  error,
  initialData,
}: {
  control: Control<CreateProductInput>;
  error?: string;
  initialData?: ProductInventoryItem | null;
}) {
  const {
    data: articleOptionPages,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useArticleOptions();

  const fetched = articleOptionPages?.pages.flatMap((page) => page.items) ?? [];
  // Keep the product's current article selectable even if it isn't loaded yet.
  const articleOptions =
    initialData && !fetched.some((a) => a.id === initialData.articleId)
      ? [
          {
            id: initialData.articleId,
            title: initialData.articleTitle,
            island: initialData.island,
            province: initialData.province,
          },
          ...fetched,
        ]
      : fetched;

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!hasNextPage || isFetchingNextPage) return;
    const el = event.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 60) {
      fetchNextPage();
    }
  };

  return (
    <Field
      label="Artikel Terkait"
      required
      error={error}
      hint="Menghubungkan produk dengan kisah budayanya."
    >
      <Controller
        control={control}
        name="articleId"
        render={({ field }) => (
          <Select
            value={field.value ?? ''}
            onValueChange={field.onChange}
            disabled={isLoading}
          >
            <SelectTrigger className={selectTriggerClassName}>
              <SelectValue
                placeholder={isLoading ? 'Memuat artikel…' : 'Pilih artikel'}
                className="block w-full truncate"
              />
            </SelectTrigger>
            <SelectContent
              position="popper"
              className={cn(selectContentClassName, 'overflow-y-auto')}
              onScroll={handleScroll}
            >
              {articleOptions.map((article) => (
                <SelectItem
                  key={article.id}
                  value={article.id}
                  className={cn(
                    selectItemClassName,
                    'overflow-hidden text-ellipsis whitespace-nowrap',
                  )}
                >
                  {article.title}
                </SelectItem>
              ))}
              {isFetchingNextPage ? (
                <p className="px-2 py-2 text-[13px] text-muted-foreground">
                  Memuat artikel berikutnya...
                </p>
              ) : null}
              {!hasNextPage && articleOptions.length > 0 ? (
                <p className="px-2 py-2 text-[13px] text-muted-foreground">
                  Semua artikel telah dimuat
                </p>
              ) : null}
            </SelectContent>
          </Select>
        )}
      />
    </Field>
  );
}
