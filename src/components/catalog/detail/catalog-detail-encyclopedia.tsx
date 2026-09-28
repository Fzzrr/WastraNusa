import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { EncyclopediaArticleDetail } from '@/types/encyclopedia';
import { ArrowRight, BookOpenText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type CatalogDetailEncyclopediaProps = {
  encyclopediaFacts: readonly [string, string][];
  category: string;
  linkedArticle?: EncyclopediaArticleDetail;
  isLinkedArticlePending?: boolean;
};

export function CatalogDetailEncyclopedia({
  encyclopediaFacts,
  category,
  linkedArticle,
  isLinkedArticlePending = false,
}: CatalogDetailEncyclopediaProps) {
  const articleHref = linkedArticle?.slug
    ? `/encyclopedia/${linkedArticle.slug}`
    : '/encyclopedia';
  const articleTitle =
    linkedArticle?.title ?? 'Artikel ensiklopedia belum tersedia';
  const articleExcerpt =
    linkedArticle?.excerpt ??
    'Artikel terkait produk ini belum tersedia saat ini. Silakan lihat daftar ensiklopedia untuk membaca artikel budaya lainnya.';

  return (
    <aside className="flex flex-col gap-3">
      <Card className="group gap-0 overflow-hidden rounded-2xl border-0 bg-[#fbf8f2] p-0 shadow-[0_1px_2px_rgba(60,41,15,0.04),0_12px_28px_rgba(89,69,38,0.06)] ring-1 ring-[#e3d9c7]">
        <div className="flex items-center justify-between bg-gradient-to-r from-[#2f5f49] to-[#3f7359] px-4 py-3 text-[#edf4ec]">
          <h3 className="inline-flex items-center gap-2 text-sm font-bold">
            <BookOpenText className="size-4 text-[#e8cb8d]" />
            Ensiklopedia Budaya
          </h3>
        </div>
        <div className="flex flex-col gap-3 p-4">
          <p className="inline-flex w-fit items-center rounded-full bg-[#f5ead3] px-2.5 py-0.5 text-xs font-semibold text-[#8a6a2a]">
            Terkait Produk Ini
          </p>
          {linkedArticle?.imageURL ? (
            <Card className="overflow-hidden rounded-xl border-0 bg-transparent p-0 ring-1 ring-[#ddd4c5]">
              <div className="relative aspect-[234/133] w-full overflow-hidden">
                <Image
                  src={linkedArticle.imageURL}
                  alt={articleTitle}
                  fill
                  className="block object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 1279px) 100vw, 320px"
                />
              </div>
            </Card>
          ) : (
            <Card className="aspect-[234/133] w-full flex flex-col items-center justify-center gap-2 rounded-xl border border-[#ddd4c5] bg-[#ece3d5]">
              <span className="size-4 rotate-45 border border-[#cebda2]" />
              <p className="text-sm font-semibold text-[#6d665c]">{category}</p>
            </Card>
          )}
          <h4 className="text-2xl font-bold leading-tight text-[#2f5b49]">
            {isLinkedArticlePending ? 'Memuat artikel...' : articleTitle}
          </h4>
          <p className="text-sm leading-6 text-[#4d6056]">
            {isLinkedArticlePending
              ? 'Sedang memuat ringkasan artikel terkait produk ini.'
              : articleExcerpt}
          </p>
          <div className="overflow-hidden rounded-xl ring-1 ring-[#ece3d4]">
            <div className="grid text-xs text-[#455b50]">
              {encyclopediaFacts.map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[110px_minmax(0,1fr)] gap-2 px-3 py-2 odd:bg-[#f5f0e7]"
                >
                  <span className="text-[#6e7a70]">{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
          {isLinkedArticlePending || !linkedArticle ? (
            <Button
              disabled
              className="h-11 rounded-xl bg-[#cc7543] text-white hover:bg-[#b56439]"
            >
              Baca Artikel Lengkap
            </Button>
          ) : (
            <Button
              asChild
              className="group/cta h-11 rounded-xl bg-gradient-to-r from-[#cc7543] to-[#d98b52] text-white shadow-[0_10px_20px_-10px_rgba(204,117,67,0.8)] transition-all hover:-translate-y-0.5 hover:from-[#b56539] hover:to-[#c97a45]"
            >
              <Link href={articleHref}>
                Baca Artikel Lengkap
                <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-1" />
              </Link>
            </Button>
          )}
        </div>
      </Card>
    </aside>
  );
}
