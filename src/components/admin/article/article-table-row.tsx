import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { type EncyclopediaArticle } from '@/types/encyclopedia';
import { BookOpen, Clock3, Eye, MapPin, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function ArticleRowSkeleton() {
  return (
    <tr className="border-t border-border">
      <td className="px-4 py-3">
        <Skeleton className="size-4 rounded-sm bg-surface" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-xl bg-surface" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-48 bg-surface" />
            <Skeleton className="h-4 w-32 bg-surface" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-6 w-16 rounded-full bg-surface" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-24 bg-surface" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-20 bg-surface" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="ml-auto h-4 w-12 bg-surface" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <Skeleton className="size-8 rounded-lg bg-surface" />
          <Skeleton className="size-8 rounded-lg bg-surface" />
          <Skeleton className="size-8 rounded-lg bg-surface" />
        </div>
      </td>
    </tr>
  );
}

const iconButtonClassName =
  'cursor-pointer rounded-full text-ink-soft hover:bg-surface hover:text-ink';

export function ArticleRow({
  article,
  isSelected,
  isDeleting,
  onToggleSelect,
  onEdit,
  onDelete,
}: {
  article: EncyclopediaArticle;
  isSelected: boolean;
  isDeleting: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr
      onClick={onEdit}
      className={cn(
        'group cursor-pointer border-t border-border transition-colors',
        isSelected ? 'bg-surface' : 'hover:bg-surface',
      )}
    >
      <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
        <Checkbox
          aria-label={`Pilih ${article.title}`}
          checked={isSelected}
          onChange={onToggleSelect}
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface text-ink-soft ring-1 ring-border">
            {article.imageURL ? (
              <Image
                src={article.imageURL}
                alt=""
                fill
                sizes="48px"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <BookOpen className="size-5" />
            )}
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="line-clamp-1 font-semibold text-ink">
              {article.title}
            </p>
            <p className="line-clamp-1 text-[13px] text-ink-soft">
              {article.motifLabel} · {article.region}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex rounded-full bg-surface px-2.5 py-1 text-[13px] font-medium whitespace-nowrap text-ink">
          {article.topic}
        </span>
      </td>
      <td className="px-4 py-3 text-[15px] text-ink-soft">
        <div className="flex items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0 text-ink-soft" />
          <span className="line-clamp-1">{article.region}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-[13px] font-semibold text-ink tabular-nums">
          <Eye className="size-3.5" />
          {article.views}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-[13px] font-semibold text-ink-soft tabular-nums">
          <Clock3 className="size-3.5" />
          {article.readMinutes}
        </span>
      </td>
      <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-center gap-1.5">
          <Button
            asChild
            size="icon-sm"
            variant="ghost"
            className={iconButtonClassName}
          >
            <Link
              href={`/encyclopedia/${article.slug}`}
              aria-label="Kunjungi artikel"
              title="Lihat artikel"
            >
              <Eye />
            </Link>
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Edit artikel"
            title="Edit artikel"
            className={iconButtonClassName}
            onClick={onEdit}
          >
            <Pencil />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Hapus artikel"
            title="Hapus artikel"
            className="cursor-pointer rounded-full text-ink-soft hover:bg-red-50 hover:text-destructive"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 />
          </Button>
        </div>
      </td>
    </tr>
  );
}
