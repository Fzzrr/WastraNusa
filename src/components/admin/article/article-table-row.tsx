import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Image from '@/components/ui/image';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { type EncyclopediaArticle } from '@/types/encyclopedia';
import { BookOpen, Clock3, Eye, MapPin, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

export function ArticleRowSkeleton() {
  return (
    <tr className="border-t border-[#ece7de]">
      <td className="px-4 py-3">
        <Skeleton className="size-4 rounded-sm bg-[#eee2d0]" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-xl bg-[#eee2d0]" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-48 bg-[#eee2d0]" />
            <Skeleton className="h-4 w-32 bg-[#eee2d0]" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-6 w-16 rounded-full bg-[#eee2d0]" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-24 bg-[#eee2d0]" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-20 bg-[#eee2d0]" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="ml-auto h-4 w-12 bg-[#eee2d0]" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <Skeleton className="size-8 rounded-lg bg-[#eee2d0]" />
          <Skeleton className="size-8 rounded-lg bg-[#eee2d0]" />
          <Skeleton className="size-8 rounded-lg bg-[#eee2d0]" />
        </div>
      </td>
    </tr>
  );
}

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
        'group cursor-pointer border-t border-[#efe8dd] transition-colors',
        isSelected ? 'bg-[#f4efe5]' : 'hover:bg-[#faf7f2]',
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
          <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f4efe5] text-[#b08a5e] ring-1 ring-[#ebe3d6]">
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
            <p className="line-clamp-1 font-semibold text-[#2f3a33] transition-colors group-hover:text-[#2f5543]">
              {article.title}
            </p>
            <p className="line-clamp-1 text-xs text-[#9a8f80]">
              {article.motifLabel} · {article.region}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex rounded-full bg-[#f5ead3] px-2.5 py-1 text-xs font-medium whitespace-nowrap text-[#826428]">
          {article.topic}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-[#6f6a62]">
        <div className="flex items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0 text-[#b08a5e]" />
          <span className="line-clamp-1">{article.region}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#e7efe4] px-2.5 py-1 text-xs font-semibold text-[#2f5543] tabular-nums">
          <Eye className="size-3.5" />
          {article.views}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#f1ede6] px-2.5 py-1 text-xs font-semibold text-[#6f6a62] tabular-nums">
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
            className="cursor-pointer rounded-lg text-[#6f6a62] hover:bg-[#e7efe4] hover:text-[#2f5543]"
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
            className="cursor-pointer rounded-lg text-[#6f6a62] hover:bg-[#f5ead3] hover:text-[#826428]"
            onClick={onEdit}
          >
            <Pencil />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Hapus artikel"
            title="Hapus artikel"
            className="cursor-pointer rounded-lg text-[#6f6a62] hover:bg-red-50 hover:text-red-600"
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
